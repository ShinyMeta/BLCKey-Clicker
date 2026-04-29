import { defineStore } from "pinia";
import { useSaveManager } from "@/store/saveManager";

export const DEX_DISPLAY_BEHAVIOR = Object.freeze({
  SHOW_ALL: "SHOW_ALL",
  SHOW_SEEN: "SHOW_SEEN",
  SHOW_COLLECTED: "SHOW_COLLECTED",
});

export const useMiscSettingsStore = defineStore("miscSettings", () => {
  const saveManager = useSaveManager();
  const miscSaveCategory = saveManager.useSaveCategory("misc");
  const settingsResetType = saveManager.resetTypes.SETTINGS;

  const previewPercentMode = miscSaveCategory.useSaveCategoryStorage("previewPercentMode", {
    defaultValue: "perChest",
    resetType: settingsResetType,
  });

  const dexDisplayBehavior = miscSaveCategory.useSaveCategoryStorage("dexDisplayBehavior", {
    defaultValue: DEX_DISPLAY_BEHAVIOR.SHOW_COLLECTED,
    resetType: settingsResetType,
  });

  // Persisted auto-attack settings for keys
  const keyAutoAttack = miscSaveCategory.useSaveCategoryStorage("keyAutoAttack", {
    defaultValue: {
      blcKey: true,
      goldenKey: false,
    },
    resetType: settingsResetType,
  });

  function toggleKeyAutoAttack(key) {
    keyAutoAttack.value = {
      ...(keyAutoAttack.value || {}),
      [key]: !keyAutoAttack.value?.[key],
    };
  }

  return { previewPercentMode, dexDisplayBehavior, keyAutoAttack, toggleKeyAutoAttack };
});
