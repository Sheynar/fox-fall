import { MarkerType } from "@packages/frontend-libs/dist/marker";
import { runGlobal } from "@packages/frontend-libs/dist/scope";
import { ref } from "vue";

const { markerSize, markerColor, markerType, markerDisabled } = runGlobal(() => {
	return {
		markerSize: ref<number>(5),
		markerColor: ref<string>("#9900FF"),
		markerType: ref<MarkerType>(MarkerType.Pen),
		markerDisabled: ref<boolean>(false),
	}
});

export { markerSize, markerColor, markerType, markerDisabled };