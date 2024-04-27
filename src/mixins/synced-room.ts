import { watch, type Ref } from 'vue';
import { UnitMap, Unit } from '@/lib/unit';
import { Vector } from '@/lib/vector';

enum UpdateType {
	unit = 'unit',
	full = 'full',
	wind = 'wind',
}

type RoomUpdate =
	| {
			type: UpdateType.full;
			units: Record<string, unknown>;
			wind?: unknown;
	  }
	| {
			type: UpdateType.unit;
			unitId: string;
			value: unknown;
	  }
	| {
			type: UpdateType.wind;
			value: unknown;
	  };

const isRoomUpdate = (value: unknown): value is RoomUpdate => {
	return typeof value === 'object' && value !== null && 'type' in value;
};

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
	unitMap: Ref<UnitMap>,
	wind: Ref<Vector>,
	webSocket: Ref<WebSocket>
) => {
	const onMessage = (event: MessageEvent<any>) => {
		const roomUpdate = JSON.parse(event.data);
		if (!isRoomUpdate(roomUpdate)) return;
		if (roomUpdate.type === UpdateType.full) {
			const newValue: UnitMap = {};
			for (const unitId of Object.keys(roomUpdate.units)) {
				newValue[unitId] = parseUnit(roomUpdate.units[unitId] as Unit);
			}
			unitMap.value = newValue;

			if (roomUpdate.wind != null) {
				wind.value = parseVector(roomUpdate.wind);
			}
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

			newWebSocket.addEventListener('message', onMessage);
		},
		{ immediate: true }
	);

	const updateUnit = (unitId: string) => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.unit,
			unitId,
			value:
				unitMap.value[unitId] != null
					? JSON.parse(JSON.stringify(unitMap.value[unitId]))
					: undefined,
		};
		webSocket.value.send(JSON.stringify(roomUpdate));
	};

	const updateWind = () => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.wind,
			value: JSON.parse(JSON.stringify(wind.value)),
		};
		webSocket.value.send(JSON.stringify(roomUpdate));
	};

	const fullSync = () => {
		const roomUpdate: RoomUpdate = {
			type: UpdateType.full,
			units: JSON.parse(JSON.stringify(unitMap.value)),
			wind: JSON.parse(JSON.stringify(wind.value)),
		};
		webSocket.value.send(JSON.stringify(roomUpdate));
	};

	return {
		updateUnit,
		updateWind,
		fullSync,
	};
};
