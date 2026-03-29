import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useMiscSettingsStore = defineStore("miscSettings", () => {
  const previewPercentMode = useStorage("misc.previewPercentMode", "perChest");

  return { previewPercentMode };
});
