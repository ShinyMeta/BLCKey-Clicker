import { defineStore } from "pinia";
import { ref } from "vue";

const DEFAULT_VOLUME = 0.8;

export const useSoundSettingsStore = defineStore("soundSettings", () => {
  const muted = ref(false);
  const masterVolume = ref(DEFAULT_VOLUME);
  const channelVolumes = ref({
    chest: DEFAULT_VOLUME,
    mapComp: DEFAULT_VOLUME,
  });

  function effectiveVolume(channel) {
    if (muted.value) return 0;
    const chVol = channelVolumes.value[channel] ?? 1.0;
    return masterVolume.value * chVol;
  }

  return { muted, masterVolume, channelVolumes, effectiveVolume };
});
