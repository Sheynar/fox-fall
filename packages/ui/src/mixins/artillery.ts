import { computed, getCurrentScope, type Ref, ref, watch, watchEffect } from 'vue';
import { useScopePerKey } from '@kaosdlanor/vue-reactivity';
import { useEventListener, until } from '@vueuse/core';
import { KeyboardCommand } from '@packages/data/dist/keyboard-config';
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
import { usePrimaryUnitsByType } from './focused-units';
import { useViewportControl } from './viewport-control';

type ArtilleryOptions = {
	containerElement?: Ref<HTMLElement | null>;
	onUnitUpdated?: (unitId: string) => unknown;
	onWindUpdated?: () => unknown;
};
export const useArtillery = (options: ArtilleryOptions = {}) => {
	const currentScope = getCurrentScope();
	if (currentScope == null) {
		throw new Error('useArtillery must be used within a Vue effect scope');
	}

	const overlayOpen = ref(false);
	const mouseActive = ref(false);
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
	const overridingFiringSolution = ref<{
		unitIdFrom: string;
		unitIdTo: string;
	} | null>(null);

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
			new Notification('FoxFall error', {
				body: `Failed to set unit source: ${e}`,
			});
		}
	};

	const getWindOffset = (unitId: string) => {
		const specs = getUnitSpecs(unitMap.value, unitId);
		if (specs == null) return Vector.fromCartesianVector({ x: 0, y: 0 });
		return wind.value.scale(specs.WIND_OFFSET);
	};

	const getFiringVector = (artilleryId: string, targetId: string) => {
		const selectedArtilleryUnit = unitMap.value[artilleryId];
		const selectedTargetUnit = unitMap.value[targetId];

		if (selectedArtilleryUnit == null || selectedTargetUnit == null)
			return undefined;

		const resolvedArtillery = getUnitResolvedVector(
			unitMap.value,
			selectedArtilleryUnit.id
		);
		const resolvedTarget = getUnitResolvedVector(
			unitMap.value,
			selectedTargetUnit.id
		);
		const firingVector = resolvedArtillery.getRelativeOffset(resolvedTarget);
		const firingVectorWithWind = firingVector.addVector(getWindOffset(selectedArtilleryUnit.id).scale(-1));
		return firingVectorWithWind;
	};

	const calibrateWind = async () => {
		assertCanEditWind();
		const availableUnits = Object.keys(unitMap.value).filter(
			(unitId) =>
				unitMap.value[unitId].type === UnitType.Target &&
				unitMap.value[unitId].parentId != null
		);
		if (
			selectedUnit.value != null &&
			unitMap.value[selectedUnit.value]?.type === UnitType.Target &&
			unitMap.value[selectedUnit.value].parentId != null
		) {
			availableUnits.unshift(selectedUnit.value);
		} else if (selectedUnit.value != null) {
			availableUnits.push(selectedUnit.value);
		}

		let baseUnit = availableUnits[0];
		if (baseUnit == null) {
			new Notification('FoxFall error', {
				body: 'No available target unit found',
			});
			return;
		}
		const originalBaseUnit = baseUnit;
		if (
			baseUnit != null &&
			unitMap.value[baseUnit] != null &&
			unitMap.value[baseUnit].type === UnitType.Target &&
			unitMap.value[baseUnit].parentId != null
		) {
			baseUnit = unitMap.value[baseUnit].parentId!;
		}

		const initalSelectedUnit = selectedUnit.value;
		const overlayWasOpen = overlayOpen.value;

		const newUnit = addUnit(
			UnitType.LandingZone,
			undefined,
			undefined,
			baseUnit
		);
		newUnit.value.selectUnitOnDeletion = originalBaseUnit ?? baseUnit;
		selectedUnit.value = newUnit.value.id;
		if (!overlayWasOpen) {
			window.electronApi?.toggleOverlay();
		}

		overlayOpen.value = true;
		currentScope.run(() => {
			until(
				computed(
					() => selectedUnit.value !== newUnit.value.id || !overlayOpen.value
				)
			)
				.toBe(true)
				.then(() => {
					if (selectedUnit.value === newUnit.value.id || selectedUnit.value == null) {
						selectedUnit.value = initalSelectedUnit;
					}
					removeUnit(newUnit.value.id);
					if (!overlayWasOpen && overlayOpen.value) {
						window.electronApi?.toggleOverlay();
					}
				});
		});
	};

	const editTarget = async () => {
		const targets = Object.keys(unitMap.value).filter(
			(unitId) =>
				unitMap.value[unitId].type === UnitType.Target &&
				unitMap.value[unitId].parentId != null
		);
		const target = targets.includes(selectedUnit.value!)
			? selectedUnit.value
			: targets[0];
		if (target == null) {
			new Notification('FoxFall error', {
				body: Object.keys(unitMap.value).some((unitId) => unitMap.value[unitId].type === UnitType.Target) ? 'Target units are not positioned from a parent unit' : 'No target unit found',
			});
			return;
		}

		const initalSelectedUnit = selectedUnit.value;
		const overlayWasOpen = overlayOpen.value;

		selectedUnit.value = target;
		if (!overlayWasOpen) {
			window.electronApi?.toggleOverlay();
		}

		overlayOpen.value = true;
		currentScope.run(() => {
			until(computed(() => selectedUnit.value !== target || !overlayOpen.value))
				.toBe(true)
				.then(() => {
					if (selectedUnit.value === target || selectedUnit.value == null) {
						selectedUnit.value = initalSelectedUnit;
					}
					if (!overlayWasOpen && overlayOpen.value) {
						window.electronApi?.toggleOverlay();
					}
				});
		});
	};

	const primaryUnitsByType = usePrimaryUnitsByType();

	const selectedFiringPair = computed(() => {
		if (primaryUnitsByType.value[UnitType.Artillery] == null || primaryUnitsByType.value[UnitType.Target] == null)
			return undefined;
		return {
			artillery: primaryUnitsByType.value[UnitType.Artillery].id,
			target: primaryUnitsByType.value[UnitType.Target].id,
		};
	});

	const selectedFiringVector = computed(() => {
		if (selectedFiringPair.value == null)
			return undefined;
		return getFiringVector(
			selectedFiringPair.value.artillery,
			selectedFiringPair.value.target
		);
	});

	const overrideFiringSolution = async () => {
		const artilleryUnit = primaryUnitsByType.value[UnitType.Artillery];
		const targetUnit = primaryUnitsByType.value[UnitType.Target];
		if (artilleryUnit == null) {
			new Notification('FoxFall error', {
				body: 'No artillery unit found',
			});
			return;
		}
		if (targetUnit == null) {
			new Notification('FoxFall error', {
				body: 'No target unit found',
			});
			return;
		}

		const specs = getUnitSpecs(unitMap.value, artilleryUnit.id);
		if (specs == null) {
			new Notification('FoxFall error', {
				body: 'Artillery type not selected',
			});
			return;
		}

		const overlayWasOpen = overlayOpen.value;

		overridingFiringSolution.value = { unitIdFrom: artilleryUnit.id, unitIdTo: targetUnit.id };
		if (!overlayWasOpen) {
			window.electronApi?.toggleOverlay();
		}

		overlayOpen.value = true;
		currentScope.run(() => {
			until(computed(() => overridingFiringSolution.value == null || !overlayOpen.value))
				.toBe(true)
				.then(() => {
					if (!overlayWasOpen && overlayOpen.value) {
						window.electronApi?.toggleOverlay();
					}
				});
		});
	};

	const windMultiplier = computed(() => {
		const windMultipliers = Array.from(
			new Set(
				Object.keys(unitMap.value)
					.map((unitId) => getUnitSpecs(unitMap.value, unitId)?.WIND_OFFSET)
					.filter((windOffset) => windOffset != null)
			)
		);

		if (windMultipliers.length === 1) return windMultipliers[0];
		return undefined;
	});
	const assertCanEditWind = () => {
		if (windMultiplier.value == null) {
			throw new Error('No artillery unit with wind specs');
		}
	};
	const editWind = async (unitId: string, firingSolution: Vector) => {
		assertCanEditWind();
		const _windMultiplier = windMultiplier.value!;
		try {
			const unit = unitMap.value[unitId];
			if (unit == null) return;
			if (unit.type !== UnitType.LandingZone) {
				throw new Error('Only landing zones can update wind');
			}
			if (selectedFiringPair.value == null) {
				throw new Error('No artillery found');
			}

			const windCorrection = getUnitResolvedVector(unitMap.value, selectedFiringPair.value.artillery)
				.addVector(firingSolution)
				.addVector(getWindOffset(selectedFiringPair.value.artillery))
				.scale(-1)
				.addVector(getUnitResolvedVector(unitMap.value, unit.id));
			wind.value = wind.value.addVector(
				windCorrection.scale(1 / _windMultiplier)
			);
			options.onWindUpdated?.();

			removeUnit(unitId);
		} catch (e) {
			new Notification('FoxFall error', {
				body: `Failed to update wind: ${e}`,
			});
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
			case KeyboardCommand.EditTarget:
				editTarget();
				break;
			case KeyboardCommand.OverrideFiringSolution:
				overrideFiringSolution();
				break;
		}
	});

	const updateMouseActive = () => {
		mouseActive.value = document.querySelector('.MouseCapture:hover') != null;
	};
	useEventListener('pointermove', updateMouseActive);
	updateMouseActive();

	watch(
		() => overlayOpen.value || mouseActive.value,
		(active) => {
			if (active) {
				window.electronApi?.enableMouse();
			} else {
				window.electronApi?.disableMouse();
			}
		},
		{ immediate: true }
	);

	return {
		addUnit,
		removeUnit,
		setUnitSource,
		getWindOffset,
		getFiringVector,
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
		selectedFiringPair,
		selectedFiringVector,
		overridingFiringSolution,
		containerElement,
		viewport,
		viewportControl,
	};
};
