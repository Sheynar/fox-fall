import { runGlobal } from "@packages/frontend-libs/dist/scope";
import { ref } from "vue";
import { MarkerType } from "../rendering/marker";

const { markerSize, markerColor, markerType, markerDisabled } = runGlobal(() => {
	return {
		markerSize: ref<number>(5),
		markerColor: ref<string>("hsl(from black h s l / 0.7)"),
		markerType: ref<MarkerType>(MarkerType.Pen),
		markerDisabled: ref<boolean>(true),
	}
});

export { markerSize, markerColor, markerType, markerDisabled };