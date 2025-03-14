import { type Ref, ref, watchEffect } from 'vue';
import { useScopePerKey } from '@kaosdlanor/vue-reactivity';
import { useEventListener } from '@vueuse/core';
import { KeyboardCommand } from '@packages/types/dist/keyboard-config';
import { settings } from '@/lib/settings';
import {
	type Unit,
	type UnitMap,
	createUnit,
	UnitType,
	getUnitResolvedVector,
	getUnitSpecs,
} from '@/lib/unit';
import { Vector } from '@/lib/vector';
import { Viewport } from '@/lib/viewport';
import { useViewportControl } from './viewport-control';

type ArtilleryOptions = {
	containerElement?: Ref<HTMLElement | null>;
	onUnitUpdated?: (unitId: string) => unknown;
	onWindUpdated?: () => unknown;
};
export const useArtillery = (options: ArtilleryOptions = {}) => {
	const overlayOpen = ref(false);
	const cursor = ref(Vector.fromCartesianVector({ x: 0, y: 0 }));
	const readyToFire = ref(false);
	const wind = ref(Vector.fromAngularVector({ azimuth: 0, distance: 0 }));
	const unitMap = ref<UnitMap>({});
	const unitSelector = ref<{
		selectUnit: (unitId?: string | null) => unknown;
		prompt?: string;
	} | null>(null);
	const selectedUnit = ref<Unit['id'] | null>(null);
	const pinnedUnits = ref<Set<Unit['id']>>(new Set());
	const highlightedUnits = ref<Set<Unit['id']>>(new Set());
	const draggingUnits = ref<Set<Unit['id']>>(new Set());

	const containerElement = options.containerElement ?? ref(null);
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
		containerElement,
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
					azimuth: 0,
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
		options.onUnitUpdated?.(newUnit.value.id);

		return newUnit;
	};

	const removeUnit = (unitId: string) => {
		const unit = unitMap.value[unitId];
		if (unit == null) return;

		if (selectedUnit.value === unitId && unit.selectUnitOnDeletion != null) {
			selectedUnit.value = unit.selectUnitOnDeletion;
		} else if (selectedUnit.value === unitId && unit.parentId != null) {
			selectedUnit.value = unit.parentId;
		}
		if (pinnedUnits.value.has(unitId)) {
			pinnedUnits.value.delete(unitId);
		}
		if (highlightedUnits.value.has(unitId)) {
			highlightedUnits.value.delete(unitId);
		}
		if (draggingUnits.value.has(unitId)) {
			draggingUnits.value.delete(unitId);
		}

		for (const otherUnit of Object.values(unitMap.value)) {
			if (otherUnit.parentId === unitId) {
				if (selectedUnit.value === unitId) {
					selectedUnit.value = otherUnit.id;
				}
				setUnitSource(otherUnit.id, unit.parentId);
			}
			if (otherUnit.selectUnitOnDeletion === unitId) {
				delete otherUnit.selectUnitOnDeletion;
			}
		}
		if (selectedUnit.value === unitId) {
			selectedUnit.value = null;
		}
		delete unitMap.value[unitId];
		options.onUnitUpdated?.(unitId);
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
			options.onUnitUpdated?.(unitId);
		} catch (e) {
			alert(`Failed to set unit source: ${e}`);
		}
	};

	const calibrateWind = async () => {
		let baseUnit = selectedUnit.value;
		const originalBaseUnit = baseUnit;
		if (
			baseUnit != null &&
			unitMap.value[baseUnit] != null &&
			unitMap.value[baseUnit].type === UnitType.Target &&
			unitMap.value[baseUnit].parentId != null
		) {
			baseUnit = unitMap.value[baseUnit].parentId!;
		}
		if (baseUnit == null) {
			baseUnit = await new Promise<string>((resolve, reject) => {
				unitSelector.value = {
					selectUnit: (unitId) => {
						unitSelector.value = null;
						if (unitId == null) {
							reject(new Error('User declined to select a unit'));
						} else {
							resolve(unitId);
						}
					},
					prompt: 'Select base unit',
				};
			});
		}
		const newUnit = addUnit(UnitType.LandingZone, undefined, undefined, baseUnit);
		newUnit.value.selectUnitOnDeletion = originalBaseUnit ?? baseUnit;
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

			let windMultiplier = 0;
			const windMultipliers = Array.from(
				new Set(
					Object.keys(unitMap.value)
						.map((unitId) => getUnitSpecs(unitMap.value, unitId)?.WIND_OFFSET)
						.filter((windOffset) => windOffset)
				)
			);
			if (windMultipliers.length === 1) {
				windMultiplier = windMultipliers[0]!;
			} else {
				windMultiplier = await new Promise<number>((resolve, reject) => {
					unitSelector.value = {
						selectUnit: (unitId) => {
							unitSelector.value = null;
							if (unitId == null) {
								return reject(new Error('User declined to select a unit'));
							}
							if (unitMap.value[unitId].type !== UnitType.Artillery) {
								return reject(new Error('Selected unit is not an artillery'));
							}
							const specs = getUnitSpecs(unitMap.value, unitId);
							if (!specs) {
								return reject(
									new Error('Selected unit does not have specifications')
								);
							}
							resolve(specs.WIND_OFFSET);
						},
						prompt: 'Select artillery',
					};
				});
			}

			const windCorrection = getUnitResolvedVector(unitMap.value, target)
				.scale(-1)
				.addVector(getUnitResolvedVector(unitMap.value, unit.id));
			wind.value = wind.value.addVector(
				windCorrection.scale(1 / windMultiplier)
			);
			options.onWindUpdated?.();

			removeUnit(unitId);
		} catch (e) {
			alert(`Failed to update wind: ${e}`);
		}
	};

	const resetWind = () => {
		wind.value = Vector.fromAngularVector({ azimuth: 0, distance: 0 });
		options.onWindUpdated?.();
	};

	const resetViewport = () => {
		if (!settings.value.lockRotate) viewport.value.resetRotation();

		const unitVectors = Object.values(unitMap.value).map((unit) => {
			return getUnitResolvedVector(unitMap.value, unit.id);
		});

		const center = unitVectors
			.reduce(
				(sum, vector) => {
					return sum.addVector(vector);
				},
				Vector.fromCartesianVector({ x: 0, y: 0 })
			)
			.scale(1 / (unitVectors.length || 1));

		if (!settings.value.lockZoom && !settings.value.lockPan) {
			if (unitVectors.length > 1) {
				const maxOffset = Math.max(
					0,
					...unitVectors.map((vector) => {
						return Math.abs(vector.addVector(center.scale(-1)).distance);
					})
				);

				viewport.value.zoomTo(0.8 / (maxOffset / 100));
			} else {
				viewport.value.zoomTo(1);
			}
		}

		if (!settings.value.lockPan) viewport.value.panTo(center);
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

	useEventListener('keydown', (event) => {
		if (event.key === 'Tab' && event.ctrlKey) {
			event.preventDefault();
			const unitIdList = Object.keys(unitMap.value);

			if (selectedUnit.value == null) {
				selectedUnit.value =
					unitIdList[event.shiftKey ? unitIdList.length - 1 : 0];
				return;
			}

			const selectedUnitIndex = unitIdList.indexOf(selectedUnit.value);
			if (selectedUnitIndex === -1) return;

			if (event.shiftKey) {
				selectedUnit.value =
					unitIdList[
						(selectedUnitIndex - 1 + unitIdList.length) % unitIdList.length
					];
			} else {
				selectedUnit.value =
					unitIdList[(selectedUnitIndex + 1) % unitIdList.length];
			}
		} else if (event.key === 'Delete' && event.ctrlKey && selectedUnit.value) {
			event.preventDefault();
			removeUnit(selectedUnit.value);
		}
	});

	window.electronApi?.onKeyboardShortcutPressed((command) => {
		switch (command) {
			case KeyboardCommand.CalibrateWind:
				calibrateWind();
				break;
		}
	});

	return {
		addUnit,
		removeUnit,
		setUnitSource,
		calibrateWind,
		editWind,
		resetWind,
		resetViewport,

		overlayOpen,
		cursor,
		wind,
		unitMap,
		readyToFire,
		unitSelector,
		selectedUnit,
		pinnedUnits,
		highlightedUnits,
		draggingUnits,
		containerElement,
		viewport,
		viewportControl,
	};
};
