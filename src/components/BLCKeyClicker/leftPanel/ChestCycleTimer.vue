<template>
  <v-btn class="chest-cycle-timer text-h3 pa-4" variant="tonal" :color="pauseButtonColor" size="x-large"
    :prepend-icon="pauseButtonIcon" 
    @click="timer.togglePause"
  >
      {{ timer.formatted }}
  </v-btn>
</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";
import { computed, } from "vue";

const timer = useTimerStore();

const pauseButtonIcon = computed(() => timer.isPaused ? 'mdi-play' : 'mdi-pause');
const pauseButtonColor = computed(() => timer.remainingMs < 10000 ? 'error' : 'primary');

</script>

<style scoped>
.chest-cycle-timer {
  height: auto
}

</style>