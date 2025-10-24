import EventEmitter from 'events';
import { applyPatch, compare, type Operation } from "fast-json-patch";
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

export class SharedObject<T extends Record<string, unknown>> {
	readonly emitter = new EventEmitter<{ updateProduced: [SharedObjectUpdate], updateRemoved: [SharedObjectUpdate] }>();
	updates: Record<string, SharedObjectUpdate> = {};
	firstUpdate: string | undefined;
	lastUpdate: string | undefined;
	currentState: Ref<T>;

	constructor(
		private readonly initialState: T,
		readonly user: string = defaultUser
	) {
		this.currentState = ref(JSON.parse(JSON.stringify(initialState))) as Ref<T>;
	}

	protected recalculateCurrentState() {
		const newState = JSON.parse(JSON.stringify(this.initialState));
		let update = this.firstUpdate;
		while (update != null) {
			const updateData = this.updates[update];
			if (updateData == null) throw new Error(`Update data not found for id: ${update}`);
			applyPatch(newState, updateData.patch);
			update = updateData.nextUpdate;
		}
		this.currentState.value = newState;
	}

	protected _removeUpdate(id: string) {
		if (this.updates[id] == null) throw new Error(`Update data not found for id: ${id}`);
		const update = this.updates[id];
		delete this.updates[id];
		if (update.lastUpdate != null) this.updates[update.lastUpdate]!.nextUpdate = update.nextUpdate;
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
		if (this.updates[id] == null) throw new Error(`Update data not found for id: ${id}`);
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

	addUpdate(update: SharedObjectUpdate) {
		if (!this.checkConflicts(update)) return false;

		applyPatch(this.currentState.value, update.patch);
		this.updates[update.id] = update;
		if (this.firstUpdate == null) this.firstUpdate = update.id;
		this.lastUpdate = update.id;
		if (update.lastUpdate != null)
			this.updates[update.lastUpdate].nextUpdate = update.id;

		return true;
	}

	protected _producingState: T | null = null;
	produceUpdate(recipe: (draft: T) => void) {
		const productionInProgress = this._producingState != null;
		if (!productionInProgress) {
			this._producingState = JSON.parse(JSON.stringify(this.currentState.value));
		}
		recipe(this._producingState!);
		if (productionInProgress) return;
		const patch = compare(JSON.parse(JSON.stringify(this.currentState.value)), JSON.parse(JSON.stringify(this._producingState!)));
		this._producingState = null;
		if (patch.length === 0) return;

		const newUpdate = {
			id: generateId(),
			author: this.user,
			patch,
			timestamp: Date.now(),
			lastUpdate: this.lastUpdate,
		};

		this.addUpdate(newUpdate);
		this.emitter.emit('updateProduced', newUpdate);
	}
}
