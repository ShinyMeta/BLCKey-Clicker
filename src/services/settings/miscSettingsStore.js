import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useMiscSettingsStore = defineStore("miscSettings", () => {
  const previewPercentMode = useStorage("misc.previewPercentMode", "perChest");

  // Persisted auto-attack settings for keys
  const keyAutoAttack = useStorage("misc.keyAutoAttack", {
    blcKey: true,
    goldenKey: false,
  });

  function toggleKeyAutoAttack(key) {
    keyAutoAttack.value = {
      ...(keyAutoAttack.value || {}),
      [key]: !keyAutoAttack.value?.[key],
    };
  }

  return { previewPercentMode, keyAutoAttack, toggleKeyAutoAttack };
});
