import { defineStore } from "pinia";
import { useSaveManager } from "@/store/saveManager";

const DEFAULT_VOLUME = 0.8;

export const useSoundSettingsStore = defineStore("soundSettings", () => {
  const saveManager = useSaveManager();
  const soundSaveCategory = saveManager.useSaveCategory("sound");
  const settingsResetType = saveManager.resetTypes.SETTINGS;

  const muted = soundSaveCategory.useSaveCategoryStorage("muted", {
    defaultValue: false,
    resetType: settingsResetType,
  });
  const masterVolume = soundSaveCategory.useSaveCategoryStorage("masterVolume", {
    defaultValue: DEFAULT_VOLUME,
    resetType: settingsResetType,
  });
  const channelVolumes = soundSaveCategory.useSaveCategoryStorage("channelVolumes", {
    defaultValue: {
      chest: DEFAULT_VOLUME,
      mapComp: DEFAULT_VOLUME,
      timer: DEFAULT_VOLUME,
    },
    resetType: settingsResetType,
  });

  function effectiveVolume(channel) {
    if (muted.value) return 0;
    const chVol = channelVolumes.value[channel] ?? 1.0;
    return masterVolume.value * chVol;
  }

  function toggleMute() {
    muted.value = !muted.value;
  }

  return { muted, masterVolume, channelVolumes, effectiveVolume, toggleMute };
});
