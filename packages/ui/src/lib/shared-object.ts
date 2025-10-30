import EventEmitter from 'events';
import { applyPatch, compare, type Operation } from 'fast-json-patch';
import { ref, type Ref } from 'vue';
import { generateId } from '@packages/data/dist/id';

export type SharedObjectUpdate = {
	id: string;
	lastUpdate?: string;
	nextUpdate?: string;
	author: string;
	patch: Operation[];
	timestamp: number;
};

const defaultUser = generateId();

// function createToggleableReadonlyProxy<T extends object>(
// 	obj: T,
// 	currentlyReadonly: () => boolean,
// 	currentPath: (string | symbol)[] = []
// ) {
// 	const handler: ProxyHandler<T> = {
// 		get(target, prop, receiver) {
// 			const value = Reflect.get(target, prop, receiver);
// 			if (value !== null && typeof value === 'object') {
// 				return createToggleableReadonlyProxy(value, currentlyReadonly, [
// 					...currentPath,
// 					prop,
// 				]);
// 			}
// 			return value;
// 		},
// 		set(target, prop, value, _receiver) {
// 			if (currentlyReadonly() && currentPath[0] !== 'dep')
// 				throw new Error(
// 					`Cannot set property '${currentPath.join('.')}.${String(prop)}' on a readonly object.`
// 				);
// 			return Reflect.set(
// 				target,
// 				prop,
// 				value,
// 				currentPath[0] !== 'dep' ? target : _receiver
// 			);
// 		},
// 		deleteProperty(target, prop) {
// 			if (currentlyReadonly() && currentPath[0] !== 'dep')
// 				throw new Error(
// 					`Cannot delete property '${currentPath.join('.')}.${String(prop)}' from a readonly object.`
// 				);
// 			return Reflect.deleteProperty(target, prop);
// 		},
// 		defineProperty(target, prop, descriptor) {
// 			if (currentlyReadonly() && currentPath[0] !== 'dep')
// 				throw new Error(
// 					`Cannot define property '${currentPath.join('.')}.${String(prop)}' on a readonly object.`
// 				);
// 			return Reflect.defineProperty(target, prop, descriptor);
// 		},
// 	};

// 	return new Proxy(obj, handler);
// }

export class SharedObject<T extends Record<string, unknown>> {
	readonly emitter = new EventEmitter<{
		updateProduced: [SharedObjectUpdate];
		updateReplaced: [SharedObjectUpdate];
		updateRemoved: [SharedObjectUpdate];
	}>();
	updates: Record<string, SharedObjectUpdate> = {};
	firstUpdate: string | undefined;
	lastUpdate: string | undefined;
	protected _currentState: Ref<T>;

	get currentState() {
		return this._currentState;
		// return createToggleableReadonlyProxy(
		// 	this._currentState,
		// 	() => this._stateBeforeProduction == null
		// );
	}

	constructor(
		private readonly initialState: T,
		readonly user: string = defaultUser
	) {
		this._currentState = ref(
			JSON.parse(JSON.stringify(initialState))
		) as Ref<T>;
	}

	protected recalculateCurrentState() {
		const newState = JSON.parse(JSON.stringify(this.initialState));
		let update = this.firstUpdate;
		while (update != null) {
			const updateData = this.updates[update];
			if (updateData == null)
				throw new Error(`Update data not found for id: ${update}`);
			applyPatch(newState, JSON.parse(JSON.stringify(updateData.patch)));
			update = updateData.nextUpdate;
		}
		this._currentState.value = newState;
	}

	protected _removeUpdate(id: string) {
		if (this.updates[id] == null)
			throw new Error(`Update data not found for id: ${id}`);
		const update = this.updates[id];
		delete this.updates[id];
		if (update.lastUpdate != null)
			this.updates[update.lastUpdate]!.nextUpdate = update.nextUpdate;
		if (this.lastUpdate === id) this.lastUpdate = update.lastUpdate;
		if (this.firstUpdate === id) this.firstUpdate = undefined;
		this.emitter.emit('updateRemoved', update);
		return update;
	}

	/** This is dangerous as removing an update when there are further updates after it could break the state. */
	removeUpdate(id: string) {
		const removed = this._removeUpdate(id);
		this.recalculateCurrentState();
		return removed;
	}

	protected _purgeUpdate(id: string): SharedObjectUpdate[] {
		if (this.updates[id] == null)
			throw new Error(`Update data not found for id: ${id}`);
		const update = this.updates[id];

		const purged: SharedObjectUpdate[] = [];
		if (update.nextUpdate != null) {
			purged.push(...this._purgeUpdate(update.nextUpdate));
		}
		purged.push(this._removeUpdate(id));
		return purged;
	}

	purgeUpdate(id: string) {
		const purged = this._purgeUpdate(id);
		this.recalculateCurrentState();
		return purged;
	}

	checkConflicts(update: SharedObjectUpdate) {
		if (this.lastUpdate === update.lastUpdate) return true;
		if (update.lastUpdate != null && this.updates[update.lastUpdate] == null)
			return false;
		const conflictingId =
			update.lastUpdate != null
				? this.updates[update.lastUpdate]!.nextUpdate
				: this.firstUpdate;
		if (conflictingId == null || this.updates[conflictingId] == null)
			return true;
		if (this.updates[conflictingId].timestamp > update.timestamp) return false;
		this.purgeUpdate(conflictingId);
		return true;
	}

	importUpdate(update: SharedObjectUpdate, skipApplyPatch: boolean = false) {
		if (!this.checkConflicts(update)) return false;

		if (!skipApplyPatch) {
			applyPatch(this._currentState.value, JSON.parse(JSON.stringify(update.patch)));
		}
		this.updates[update.id] = update;
		if (this.firstUpdate == null) this.firstUpdate = update.id;
		this.lastUpdate = update.id;
		if (update.lastUpdate != null)
			this.updates[update.lastUpdate].nextUpdate = update.id;

		return true;
	}

	protected _stateBeforeProduction: T | null = null;
	produceUpdate(
		recipe: () => void,
		author: string = this.user,
		mergeWithUpdate?: string
	) {
		const hasParentProduction = this._stateBeforeProduction != null;
		if (!hasParentProduction) {
			this._stateBeforeProduction = JSON.parse(
				JSON.stringify(this._currentState.value)
			);
		}
		recipe();
		if (hasParentProduction) return;
		const patch = compare(
			JSON.parse(JSON.stringify(this._stateBeforeProduction!)),
			JSON.parse(JSON.stringify(this._currentState.value))
		);
		this._stateBeforeProduction = null;
		if (patch.length === 0) return;

		if (mergeWithUpdate != null) {
			const update = this.updates[mergeWithUpdate];
			if (update != null) {
				update.patch.push(...patch);
				update.timestamp = Date.now();
				this.emitter.emit('updateReplaced', update);
				return update;
			} else {
				throw new Error(`Update not found for id: ${mergeWithUpdate}`);
			}
		}

		const newUpdate = {
			id: generateId(),
			author,
			patch,
			timestamp: Date.now(),
			lastUpdate: this.lastUpdate,
		};

		this.importUpdate(newUpdate, true);
		this.emitter.emit('updateProduced', newUpdate);

		return newUpdate;
	}

	undo(author?: string) {
		let updateId = this.lastUpdate;
		while (updateId != null) {
			const update = this.updates[updateId];
			if (update == null) break;
			if (author == null || update.author === author) {
				// TODO : remove this
				if (updateId === this.firstUpdate && update.author === 'sync-system') return;
				this.purgeUpdate(updateId);
				return;
			}
			updateId = update.lastUpdate;
		}
	}
}
