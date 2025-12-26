import { runGlobal } from "@packages/frontend-libs/dist/scope";
import { ref } from "vue";
import { MarkerType } from "../rendering/marker";
import { useIntelInstance } from "./intel-instance";

const { markerSize, markerColor, markerType, markerDisabled, intelInstance } = runGlobal(() => {
	return {
		markerSize: ref<number>(5),
		markerColor: ref<string>("#000000"),
		markerType: ref<MarkerType>(MarkerType.Pen),
		markerDisabled: ref<boolean>(true),
		intelInstance: useIntelInstance({
			intelInstance: ref({
				id: 'global',
				password: '',
			}),
		}),
	}
});

export { markerSize, markerColor, markerType, markerDisabled, intelInstance };