import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useGraphicsSettingsStore = defineStore("graphicsSettings", () => {
  const enableMapCompRain = useStorage("graphics.enableMapCompRain", true);
  const mapCompBounceLevel = useStorage("graphics.mapCompBounceLevel", "high");

  return { enableMapCompRain, mapCompBounceLevel };
});
