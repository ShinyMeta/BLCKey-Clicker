<template>
  <div class="pa-4 text-medium-emphasis text-body-2 text-center">
    <!-- <v-icon icon="mdi-volume-high" size="48" class="mb-2 d-block mx-auto" /> -->
    <v-btn :icon="muteButtonIcon" @click="soundSettings.toggleMute" size="x-large" variant="outlined" 
      :color="muted ? 'error' : 'success'"/>
    
    <volume-slider v-model="masterVolume" label="All Sound" :prepend-icon="masterVolumeIcon" />
    <volume-slider v-model="channelVolumes.chest" label="Chest" prepend-icon="mdi-treasure-chest-outline" />
    <volume-slider v-model="channelVolumes.mapComp" label="Map Completion" prepend-icon="mdi-map-check-outline" />
    <volume-slider v-model="channelVolumes.timer" label="Timer" prepend-icon="mdi-timer-outline" />
  </div>
</template>

<script setup>
import VolumeSlider from './VolumeSlider.vue';
import { useSoundSettingsStore } from '@/services/sound';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const soundSettings = useSoundSettingsStore();
const { masterVolume, channelVolumes, muted } = storeToRefs(soundSettings);


const muteButtonIcon = computed(() => muted.value ? 'mdi-volume-mute' : 'mdi-volume-high');
const masterVolumeIcon = computed(() => {
  if (muted.value || masterVolume.value === 0) return 'mdi-volume-mute';
  if (masterVolume.value < 0.2) return 'mdi-volume-low';
  if (masterVolume.value < 0.6) return 'mdi-volume-medium';
  return 'mdi-volume-high';
});

</script>

<style scoped>

</style>