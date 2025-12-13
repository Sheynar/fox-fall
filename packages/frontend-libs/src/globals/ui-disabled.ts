import { runGlobal } from "@/scope.js";
import { ref } from "vue";

export const uiDisabled = runGlobal(() => ref(false))!;
