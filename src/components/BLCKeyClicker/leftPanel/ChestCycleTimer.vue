<template>
  <!-- <v-card class="chest-cycle-timer d-flex align-center ga-2 justify-center pa-3" variant="outlined" >
    <v-btn :icon="pauseButtonIcon" @click="timer.togglePause" color="primary"/>
    <span class="text-h3">
      {{ timer.formatted }}
    </span>
  </v-card> -->
  <v-btn class="chest-cycle-timer text-h3 pa-4" variant="tonal" color="primary" size="x-large"
    :prepend-icon="pauseButtonIcon" 
    @click="timer.togglePause"
  >
      {{ timer.formatted }}
  </v-btn>
</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";
import { computed } from "vue";

const timer = useTimerStore();

const pauseButtonIcon = computed(() => timer.isPaused ? 'mdi-play' : 'mdi-pause');
</script>

<style scoped>
.chest-cycle-timer {
  height: auto
}

</style>