import { useScopePerKey } from '@kaosdlanor/vue-reactivity';
import { computed, onScopeDispose, ref, watchEffect, type Ref } from 'vue';
import { usePeerToPeer } from '@/mixins/peer-to-peer';
import { UnitMap, Unit } from '@/lib/unit';
import { Vector } from '@/lib/vector';

export enum SyncedUnitMapMessageType {
	update = 'update',
	fullSync = 'fullSync',
	manualUpdate = 'manualUpdate',
	manualFullSync = 'manualFullSync',
}

export type SyncedUnitMapMessage =
	| {
			type:
				| SyncedUnitMapMessageType.fullSync
				| SyncedUnitMapMessageType.manualFullSync;
			data: UnitMap;
	  }
	| {
			type:
				| SyncedUnitMapMessageType.update
				| SyncedUnitMapMessageType.manualUpdate;
			key: keyof UnitMap;
			value: UnitMap[keyof UnitMap] | null | undefined;
	  };

const parseUnit = (unit: Unit): Unit => {
	if (!(unit.vector instanceof Vector)) {
		const vectorObj: any = unit.vector;
		unit.vector =
			vectorObj._angularVector != null
				? Vector.fromAngularVector(vectorObj._angularVector)
				: Vector.fromCartesianVector(vectorObj._cartesianVector);
	}
	return unit;
};

const isSyncedUnitMapMessage = (
	message: unknown
): message is SyncedUnitMapMessage => {
	return (
		typeof message === 'object' &&
		message !== null &&
		'type' in message &&
		typeof message['type'] === 'string'
	);
};

export const useSyncedUnitMap = (
	unitMap: Ref<UnitMap>,
	peerConnection: ReturnType<typeof usePeerToPeer>,
	isMaster = ref(false)
) => {
	peerConnection.events.addEventListener(
		'connection',
		({ detail: connection }) => {
			connection.send({
				type: SyncedUnitMapMessageType.fullSync,
				data: JSON.parse(JSON.stringify(unitMap.value)),
			} satisfies SyncedUnitMapMessage);
		}
	);

	peerConnection.events.addEventListener('message', ({ detail: message }) => {
		if (!isSyncedUnitMapMessage(message)) return;
		if (
			isMaster.value &&
			message.type !== SyncedUnitMapMessageType.manualFullSync &&
			message.type !== SyncedUnitMapMessageType.manualUpdate
		)
			return;

		if (
			message.type === SyncedUnitMapMessageType.fullSync ||
			message.type === SyncedUnitMapMessageType.manualFullSync
		) {
			const newValue: UnitMap = {};
			Object.keys(message.data).forEach((key) => {
				newValue[key] = parseUnit(message.data[key]);
			});
			unitMap.value = newValue;
		} else if (
			message.type === SyncedUnitMapMessageType.update ||
			message.type === SyncedUnitMapMessageType.manualUpdate
		) {
			if (message.value == null) {
				delete unitMap.value[message.key];
			} else {
				unitMap.value[message.key] = parseUnit(message.value);
			}
		}
	});

	useScopePerKey(unitMap, (key) => {
		const stringifiedValue = computed(() => JSON.stringify(unitMap.value[key]));
		watchEffect(() => {
			peerConnection.broadcast({
				type: SyncedUnitMapMessageType.update,
				key,
				value: JSON.parse(stringifiedValue.value),
			} satisfies SyncedUnitMapMessage);
		});

		onScopeDispose(() => {
			peerConnection.broadcast({
				type: SyncedUnitMapMessageType.update,
				key,
				value: undefined,
			} satisfies SyncedUnitMapMessage);
		});
	});

	const manualUpdate = (unitId: string) => {
		peerConnection.broadcast({
			type: SyncedUnitMapMessageType.manualUpdate,
			key: unitId,
			value: JSON.parse(JSON.stringify(unitMap.value[unitId])),
		} satisfies SyncedUnitMapMessage);
	};

	const manualFullSync = () => {
		peerConnection.broadcast({
			type: SyncedUnitMapMessageType.manualFullSync,
			data: JSON.parse(JSON.stringify(unitMap.value)),
		} satisfies SyncedUnitMapMessage);
	};

	return {
		manualUpdate,
		manualFullSync,
	};
};
