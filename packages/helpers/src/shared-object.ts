import { applyPatch, compare, type Operation } from "fast-json-patch";
import { generateId } from "./id";

export type SharedObjectUpdate = {
	id: string;
	lastUpdate?: string;
	nextUpdate?: string;
	author: string;
	patch: Operation[];
	timestamp: number;
};

export class SharedObject<T extends Record<string, unknown>> {
	updates: Record<string, SharedObjectUpdate> = {};
	firstUpdate: string | undefined;
	lastUpdate: string | undefined;
	currentState: T;

	constructor(
		private readonly initialState: T,
		readonly onUpdateProduced: (update: SharedObjectUpdate) => void,
		readonly user: string
	) {
		this.currentState = structuredClone(initialState);
	}

	protected recalculateCurrentState() {
		const currentState = structuredClone(this.initialState);
		let update = this.firstUpdate;
		while (update != null) {
			const updateData = this.updates[update];
			if (updateData == null) throw new Error(`Update data not found for id: ${update}`);
			applyPatch(currentState, updateData.patch);
			update = updateData.nextUpdate;
		}
		this.currentState = currentState;
	}

	protected _removeUpdate(id: string) {
		if (this.updates[id] == null) throw new Error(`Update data not found for id: ${id}`);
		const update = this.updates[id];
		delete this.updates[id];
		if (update.lastUpdate != null) this.updates[update.lastUpdate]!.nextUpdate = update.nextUpdate;
		if (this.lastUpdate === id) this.lastUpdate = update.lastUpdate;
		if (this.firstUpdate === id) this.firstUpdate = undefined;
		return update;
	}

	/** This is dangerous as removing an update when there are further updates after it could break the state. */
	removeUpdate(id: string) {
		const removed = this._removeUpdate(id);
		this.recalculateCurrentState();
		return removed;
	}

	protected _purgeUpdate(id: string) {
		if (this.updates[id] == null) throw new Error(`Update data not found for id: ${id}`);
		const update = this.updates[id];
		if (update.nextUpdate != null) this._purgeUpdate(update.nextUpdate);
		return this._removeUpdate(id);
	}

	purgeUpdate(id: string) {
		const removed = this._purgeUpdate(id);
		this.recalculateCurrentState();
		return removed;
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

		applyPatch(this.currentState, update.patch);
		this.updates[update.id] = update;
		if (this.firstUpdate == null) this.firstUpdate = update.id;
		this.lastUpdate = update.id;
		if (update.lastUpdate != null)
			this.updates[update.lastUpdate].nextUpdate = update.id;

		return true;
	}

	produceUpdate(recipe: (draft: T) => void) {
		const newState = structuredClone(this.currentState);
		recipe(newState);

		const newUpdate = {
			id: generateId(),
			author: this.user,
			patch: compare(this.currentState, newState),
			timestamp: Date.now(),
			lastUpdate: this.lastUpdate,
		};

		this.addUpdate(newUpdate);
		this.onUpdateProduced(newUpdate);
	}
}
