import { runGlobal } from "@packages/frontend-libs/dist/scope";
import { ref } from "vue";
import { MarkerType } from "../rendering/marker";

const { markerSize, markerColor, markerType, markerDisabled } = runGlobal(() => {
	return {
		markerSize: ref<number>(5),
		markerColor: ref<string>("#000000"),
		markerType: ref<MarkerType>(MarkerType.Pen),
		markerDisabled: ref<boolean>(true),
	}
});

export { markerSize, markerColor, markerType, markerDisabled };