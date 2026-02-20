import { runGlobal } from "@packages/frontend-libs/dist/scope";
import { type Ref, ref } from "vue";
import { MarkerType } from "../router/instance/view/components/canvas/marker";
import type { HexMapOptions } from "@/router/instance/view/components/canvas/hex-map";

export type RenderFilters = HexMapOptions['elementFilters'] & {
	documents?: Ref<boolean>;
	userIcons?: Ref<boolean>;
	markerLayer?: Ref<boolean>;
};

const { markerSize, markerColor, markerType, markerDisabled, renderFilters } = runGlobal(() => {
	return {
		markerSize: ref<number>(5),
		markerColor: ref<string>("#000000"),
		markerType: ref<MarkerType>(MarkerType.Pen),
		markerDisabled: ref<boolean>(true),
		renderFilters: {
			map: ref<boolean>(true),
			mapZone: ref<boolean>(true),
			mapIcon: ref<boolean>(true),
			hexLabel: ref<boolean>(true),
			regionLabel: ref<boolean>(true),
			minorLabel: ref<boolean>(true),
			documents: ref<boolean>(true),
			userIcons: ref<boolean>(true),
			markerLayer: ref<boolean>(true),
		} satisfies RenderFilters,
	}
});

export { markerSize, markerColor, markerType, markerDisabled, renderFilters };