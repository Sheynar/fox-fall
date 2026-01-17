import { runGlobal } from "@packages/frontend-libs/dist/scope";
import { ref } from "vue";
import { MarkerType } from "../instance/canvas/marker";
import { HexMapOptions } from "@/instance/canvas/hex-map";

const { markerSize, markerColor, markerType, markerDisabled, elementFilters } = runGlobal(() => {
	return {
		markerSize: ref<number>(5),
		markerColor: ref<string>("#000000"),
		markerType: ref<MarkerType>(MarkerType.Pen),
		markerDisabled: ref<boolean>(true),
		elementFilters: {
			map: ref<boolean>(true),
			mapZone: ref<boolean>(true),
			mapIcon: ref<boolean>(true),
			hexLabel: ref<boolean>(true),
			regionLabel: ref<boolean>(true),
			minorLabel: ref<boolean>(true),
		} satisfies HexMapOptions['elementFilters'],
	}
});

export { markerSize, markerColor, markerType, markerDisabled, elementFilters };