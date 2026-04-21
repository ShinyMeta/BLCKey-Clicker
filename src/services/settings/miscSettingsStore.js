import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const DEX_DISPLAY_BEHAVIOR = Object.freeze({
  SHOW_ALL: "SHOW_ALL",
  SHOW_SEEN: "SHOW_SEEN",
  SHOW_COLLECTED: "SHOW_COLLECTED",
});

export const useMiscSettingsStore = defineStore("miscSettings", () => {
  const previewPercentMode = useStorage("misc.previewPercentMode", "perChest");

  const dexDisplayBehavior = useStorage("misc.dexDisplayBehavior", DEX_DISPLAY_BEHAVIOR.SHOW_COLLECTED);

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

  return { previewPercentMode, dexDisplayBehavior, keyAutoAttack, toggleKeyAutoAttack };
});
