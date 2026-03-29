import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

const DEFAULT_VOLUME = 0.8;

export const useSoundSettingsStore = defineStore("soundSettings", () => {
  const muted = useStorage("sound.muted", false);
  const masterVolume = useStorage("sound.masterVolume", DEFAULT_VOLUME);
  const channelVolumes = useStorage("sound.channelVolumes", {
    chest: DEFAULT_VOLUME,
    mapComp: DEFAULT_VOLUME,
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
