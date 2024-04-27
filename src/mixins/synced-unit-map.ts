import { useScopePerKey } from '@kaosdlanor/vue-reactivity';
import { computed, onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';
import { UnitMap, Unit } from '@/lib/unit';
import { Vector } from '@/lib/vector';
import { useServerConnection } from '@/mixins/server-connection';

enum UpdateType {
	unit = 'unit',
	full = 'full',
}

type RoomUpdate = {
	type: UpdateType.full;
	value: Record<string, unknown>;
} | {
	type: UpdateType.unit;
	unitId: string;
	value: unknown;
};

const isRoomUpdate = (value: unknown): value is RoomUpdate => {
	return typeof value === 'object' && value !== null && 'type' in value;
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

export const useSyncedUnitMap = (
	unitMap: Ref<UnitMap>,
	webSocket: Ref<WebSocket>
) => {
	const onMessage = (event: MessageEvent<any>) => {
		const roomUpdate = JSON.parse(event.data);
		if (!isRoomUpdate(roomUpdate)) return;
		if (roomUpdate.type === UpdateType.full) {
			const newValue: UnitMap = {};
			Object.keys(roomUpdate.value).forEach((key) => {
				newValue[key] = parseUnit(roomUpdate.value[key] as Unit);
			});
			unitMap.value = newValue;
		} else if (roomUpdate.type === UpdateType.unit) {
			const unitId = roomUpdate.unitId;
			if (roomUpdate.value == null) {
				delete unitMap.value[unitId];
			} else {
				unitMap.value[unitId] = parseUnit(roomUpdate.value as Unit);
			}
		}
	};

	watch(webSocket, (newWebSocket, oldWebSocket) => {
		if (oldWebSocket) {
			oldWebSocket.removeEventListener('message', onMessage);
		}

		newWebSocket.addEventListener('message', onMessage);
	}, { immediate: true });

	const update = (unitId: string) => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.unit,
			unitId,
			value: unitMap.value[unitId] != null ? JSON.parse(JSON.stringify(unitMap.value[unitId])) : undefined,
		}
		webSocket.value.send(JSON.stringify(roomUpdate));
	};

	const fullSync = () => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.full,
			value: JSON.parse(JSON.stringify(unitMap.value)),
		};
		webSocket.value.send(JSON.stringify(roomUpdate));
	};

	return {
		update,
		fullSync,
	};
};
