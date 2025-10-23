import { generateId } from '@packages/helpers';
import { isRoomUpdate, type RoomUpdate, UpdateType } from '@packages/types';
import { ref, watch, type Ref } from 'vue';
import { UnitMap, Unit } from '@/lib/unit';
import { Vector } from '@/lib/vector';

const myId = generateId();

const parseVector = (vector: any): Vector => {
	return vector._angularVector != null
		? Vector.fromAngularVector(vector._angularVector)
		: Vector.fromCartesianVector(vector._cartesianVector);
};

const parseUnit = (unit: Unit): Unit => {
	if (!(unit.vector instanceof Vector)) {
		unit.vector = parseVector(unit.vector);
	}
	return unit;
};

export const useSyncedRoom = (
	readyToFire: Ref<boolean>,
	unitMap: Ref<UnitMap>,
	wind: Ref<Vector>,
	webSocket: Ref<WebSocket | null | undefined>
) => {
	const isReady = ref(false);

	const onMessage = (event: MessageEvent<any>) => {
		const roomUpdate = JSON.parse(event.data);
		if (!isRoomUpdate(roomUpdate) || roomUpdate.eventFrom === myId) return;
		if (roomUpdate.type === UpdateType.full) {
			const newValue: UnitMap = {};
			for (const unitId of Object.keys(roomUpdate.units)) {
				newValue[unitId] = parseUnit(roomUpdate.units[unitId] as Unit);
			}
			unitMap.value = newValue;

			if (roomUpdate.wind != null) {
				wind.value = parseVector(roomUpdate.wind);
			}

			if (roomUpdate.readyToFire != null) {
				readyToFire.value = roomUpdate.readyToFire;
			}

			if (!isReady.value) {
				isReady.value = true;
			}
		} else if (roomUpdate.type === UpdateType.readyToFire) {
			readyToFire.value = roomUpdate.value;
		} else if (roomUpdate.type === UpdateType.unit) {
			const unitId = roomUpdate.unitId;
			if (roomUpdate.value == null) {
				delete unitMap.value[unitId];
			} else {
				unitMap.value[unitId] = parseUnit(roomUpdate.value as Unit);
			}
		} else if (roomUpdate.type === UpdateType.wind) {
			wind.value = parseVector(roomUpdate.value);
		}
	};

	watch(
		webSocket,
		(newWebSocket, oldWebSocket) => {
			if (oldWebSocket) {
				oldWebSocket.removeEventListener('message', onMessage);
			}

			if (newWebSocket) {
				newWebSocket.addEventListener('message', onMessage);
			}
		},
		{ immediate: true }
	);

	const updateUnit = (unitId: string) => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.unit,
			eventFrom: myId,
			unitId,
			value:
				unitMap.value[unitId] != null
					? JSON.parse(JSON.stringify(unitMap.value[unitId]))
					: undefined,
		};
		webSocket.value?.send(JSON.stringify(roomUpdate));

		readyToFire.value = false;
		updateReadyToFire();
	};

	const updateWind = () => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.wind,
			eventFrom: myId,
			value: JSON.parse(JSON.stringify(wind.value)),
		};
		webSocket.value?.send(JSON.stringify(roomUpdate));
	};

	const updateReadyToFire = () => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.readyToFire,
			eventFrom: myId,
			value: readyToFire.value,
		};
		webSocket.value?.send(JSON.stringify(roomUpdate));
	};

	const fullSync = () => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.full,
			eventFrom: myId,
			readyToFire: readyToFire.value,
			units: JSON.parse(JSON.stringify(unitMap.value)),
			wind: JSON.parse(JSON.stringify(wind.value)),
		};
		webSocket.value?.send(JSON.stringify(roomUpdate));
	};

	return {
		isReady,

		fullSync,
		updateReadyToFire,
		updateUnit,
		updateWind,
	};
};
