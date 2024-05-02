import { type Ref, ref, watchEffect } from 'vue';
import { useScopePerKey } from '@kaosdlanor/vue-reactivity';
import { provideCursor } from '@/contexts/cursor';
import {
	type HighlightedUnits,
	provideHighlightedUnits,
} from '@/contexts/highlighted-units';
import { providePinnedUnits, type PinnedUnits } from '@/contexts/pinned-units';
import { provideUnitMap } from '@/contexts/unit';
import {
	provideUnitSelector,
	type UnitSelector,
} from '@/contexts/unit-selector';
import { provideReadyToFire } from '@/contexts/ready-to-fire';
import { provideSelectedUnit } from '@/contexts/selected-unit';
import { provideViewport } from '@/contexts/viewport';
import { provideWind } from '@/contexts/wind';
import { wrapDegrees } from '@/lib/angle';
import {
	type Unit,
	type UnitMap,
	createUnit,
	UnitType,
	getUnitResolvedVector,
} from '@/lib/unit';
import { Vector } from '@/lib/vector';
import { Viewport } from '@/lib/viewport';

type ArtilleryOptions = {
	onUnitUpdated?: (unitId: string) => unknown;
	onWindUpdated?: () => unknown;
};
export const useArtillery = ({
	onUnitUpdated,
	onWindUpdated,
}: ArtilleryOptions) => {
	const cursor = ref(Vector.fromCartesianVector({ x: 0, y: 0 }));
	const readyToFire = ref(false);
	const wind = ref(Vector.fromCartesianVector({ x: 0, y: 0 }));
	const unitMap = ref<UnitMap>({});
	const unitSelector = ref<UnitSelector>(null);
	const selectedUnit = ref<Unit['id'] | null>(null);
	const pinnedUnits = ref<PinnedUnits>(new Set());
	const highlightedUnits = ref<HighlightedUnits>(new Set());
	const viewport = ref(
		new Viewport(
			Vector.fromCartesianVector({
				x: document.body.clientWidth / 2,
				y: document.body.clientHeight / 2,
			}),
			90,
			1
		)
	);

	provideCursor(cursor);
	provideWind(wind);
	provideReadyToFire(readyToFire);
	provideSelectedUnit(selectedUnit);
	providePinnedUnits(pinnedUnits);
	provideHighlightedUnits(highlightedUnits);
	provideUnitSelector(unitSelector);
	provideUnitMap(unitMap);
	provideViewport(viewport);

	const unitCreateEvents = new WeakMap<Unit, PointerEvent>();
	const addUnit = (
		type: UnitType,
		event?: PointerEvent,
		vector: Ref<Vector> = ref(
			Vector.fromAngularVector({
				azimuth: wrapDegrees(-viewport.value.rotation - 90),
				distance: 50,
			})
		),
		parentUnitId?: string
	) => {
		const parentUnit = parentUnitId ? unitMap.value[parentUnitId] : undefined;
		const newUnit = createUnit(type, vector, parentUnitId);

		if (event) {
			newUnit.value.vector = viewport.value.toViewportVector(
				Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				})
			);
			if (parentUnit) {
				newUnit.value.vector = newUnit.value.vector.addVector(
					getUnitResolvedVector(unitMap.value, parentUnit.id).scale(-1)
				);
			}
			unitCreateEvents.set(newUnit.value, event);
		}

		unitMap.value[newUnit.value.id] = newUnit.value;

		return newUnit;
	};

	const removeUnit = (unitId: string) => {
		delete unitMap.value[unitId];
		onUnitUpdated?.(unitId);
	};

	const editWind = async (unitId: string) => {
		try {
			const unit = unitMap.value[unitId];
			if (unit == null) return;
			if (unit.type !== UnitType.LandingZone) {
				throw new Error('Only landing zones can update wind');
			}

			const targets = Object.keys(unitMap.value).filter((unitId) => unitMap.value[unitId].type === UnitType.Target);
			let target: string;
			if (targets.length === 1) {
				target = targets[0];
			} else {
				target = await new Promise<string>((resolve, reject) => {
					unitSelector.value = {
						selectUnit: (unitId) => {
							unitSelector.value = null;
							if (unitMap.value[unitId].type !== UnitType.Target) {
								reject(new Error('Selected unit is not a target'));
							} else {
								resolve(unitId);
							}
						},
						prompt: 'Select target',
					};
				});
			}

			const windCorrection = getUnitResolvedVector(
				unitMap.value,
				target
			).addVector(getUnitResolvedVector(unitMap.value, unit.id).scale(-1));
			wind.value = wind.value.addVector(windCorrection);
			onWindUpdated?.();

			removeUnit(unitId);
		} catch (e) {
			alert(`Failed to update wind: ${e}`);
		}
	};

	const resetWind = () => {
		wind.value = Vector.fromCartesianVector({ x: 0, y: 0 });
		onWindUpdated?.();
	};

	useScopePerKey(unitMap, (key) => {
		watchEffect(() => {
			const unit = unitMap.value[key];
			if (unit.parentId == null) return;
			const parent = unitMap.value[unit.parentId];
			if (parent == null) {
				removeUnit(unit.id);
			}
		});
	});

	return {
		addUnit,
		removeUnit,
		editWind,
		resetWind,

		cursor,
		wind,
		unitMap,
		readyToFire,
		unitSelector,
		selectedUnit,
		pinnedUnits,
		highlightedUnits,
		viewport,

		unitCreateEvents,
	};
};
