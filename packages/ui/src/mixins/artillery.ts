import { type Ref, ref, watchEffect } from 'vue';
import { useScopePerKey } from '@kaosdlanor/vue-reactivity';
import {
	type Unit,
	type UnitMap,
	createUnit,
	UnitType,
	getUnitResolvedVector,
} from '@/lib/unit';
import { Vector } from '@/lib/vector';
import { Viewport } from '@/lib/viewport';
import { useViewportControl } from './viewport-control';

type ArtilleryOptions = {
	onUnitUpdated?: (unitId: string) => unknown;
	onWindUpdated?: () => unknown;
};
export const useArtillery = ({
	onUnitUpdated,
	onWindUpdated,
}: ArtilleryOptions = {}) => {
	const cursor = ref(Vector.fromCartesianVector({ x: 0, y: 0 }));
	const readyToFire = ref(false);
	const wind = ref(Vector.fromAngularVector({ azimuth: 0, distance: 0 }));
	const unitMap = ref<UnitMap>({});
	const unitSelector = ref<{
		selectUnit: (unitId?: string | null) => unknown,
		prompt?: string,
	} | null>(null);
	const selectedUnit = ref<Unit['id'] | null>(null);
	const pinnedUnits = ref<Set<Unit['id']>>(new Set());
	const highlightedUnits = ref<Set<Unit['id']>>(new Set());
	const viewport = ref(
		new Viewport(
			Vector.fromCartesianVector({
				x: 0,
				y: 0,
			}),
			0,
			1
		)
	);

	viewport.value.panTo(Vector.fromCartesianVector({ x: 0, y: 0 }));

	const viewportControl = useViewportControl({
		viewport,
	});

	const addUnit = (
		type: UnitType,
		event?: PointerEvent,
		vector?: Ref<Vector>,
		parentUnitId?: string
	) => {
		if (vector == null) {
			vector = ref(
				Vector.fromAngularVector({
					azimuth: 180,
					distance: 42,
				})
			);
			if (parentUnitId == null) {
				vector.value = viewport.value.toWorldPosition(Vector.zero());
			}
		}

		const parentUnit = parentUnitId ? unitMap.value[parentUnitId] : undefined;
		const newUnit = createUnit(type, vector, parentUnitId);

		if (event) {
			newUnit.value.vector = viewport.value.toWorldPosition(
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
		}

		unitMap.value[newUnit.value.id] = newUnit.value;
		selectedUnit.value = newUnit.value.id;
		onUnitUpdated?.(newUnit.value.id);

		return newUnit;
	};

	const removeUnit = (unitId: string) => {
		const unit = unitMap.value[unitId];
		if (unit == null) return;

		if (selectedUnit.value === unitId && unit.parentId != null) {
			selectedUnit.value = unit.parentId;
		}
		if (pinnedUnits.value.has(unitId)) {
			pinnedUnits.value.delete(unitId);
		}
		if (highlightedUnits.value.has(unitId)) {
			highlightedUnits.value.delete(unitId);
		}

		for (const otherUnit of Object.values(unitMap.value)) {
			if (otherUnit.parentId === unitId) {
				if (selectedUnit.value === unitId) {
					selectedUnit.value = otherUnit.id;
				}
				setUnitSource(otherUnit.id, unit.parentId);
			}
		}
		if (selectedUnit.value === unitId) {
			selectedUnit.value = null;
		}
		delete unitMap.value[unitId];
		onUnitUpdated?.(unitId);
	};

	const setUnitSource = async (unitId: string, newParentId?: string) => {
		try {
			const unit = unitMap.value[unitId];
			if (unit == null) return;

			let currentlyCheckingParent = newParentId;
			while (currentlyCheckingParent != null) {
				if (currentlyCheckingParent === unitId) {
					setUnitSource(newParentId!, undefined);
				}
				currentlyCheckingParent =
					unitMap.value[currentlyCheckingParent]?.parentId;
			}

			unit.vector = getUnitResolvedVector(unitMap.value, unitId);
			if (newParentId != null) {
				unit.vector = unit.vector.addVector(
					getUnitResolvedVector(unitMap.value, newParentId).scale(-1)
				);
			}
			unit.parentId = newParentId;
			onUnitUpdated?.(unitId);
		} catch (e) {
			alert(`Failed to set unit source: ${e}`);
		}
	};

	const editWind = async (unitId: string) => {
		try {
			const unit = unitMap.value[unitId];
			if (unit == null) return;
			if (unit.type !== UnitType.LandingZone) {
				throw new Error('Only landing zones can update wind');
			}

			const targets = Object.keys(unitMap.value).filter(
				(unitId) => unitMap.value[unitId].type === UnitType.Target
			);
			let target: string;
			if (targets.length === 1) {
				target = targets[0];
			} else {
				target = await new Promise<string>((resolve, reject) => {
					unitSelector.value = {
						selectUnit: (unitId) => {
							unitSelector.value = null;
							if (unitId == null) {
								reject(new Error('User declined to select a unit'));
							} else if (unitMap.value[unitId].type !== UnitType.Target) {
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
		wind.value = Vector.fromAngularVector({ azimuth: 0, distance: 0 });
		onWindUpdated?.();
	};

	useScopePerKey(unitMap, (key) => {
		watchEffect(() => {
			const unit = unitMap.value[key];
			if (unit?.parentId == null) return;
			const parent = unitMap.value[unit.parentId];
			if (parent == null) {
				removeUnit(unit.id);
			}
		});
	});

	return {
		addUnit,
		removeUnit,
		setUnitSource,
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
		viewportControl,
	};
};
