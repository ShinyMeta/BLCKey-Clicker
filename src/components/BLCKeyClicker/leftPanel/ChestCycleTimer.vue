<template>
  <v-btn class="chest-cycle-timer text-h3 pa-4" variant="tonal" :color="pauseButtonColor" size="x-large"
    :prepend-icon="pauseButtonIcon" 
    @click="controller.togglePause"
  >
      {{ timer.formatted }}
  </v-btn>
</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";
import { computed, } from "vue";

const timer = useTimerStore();
const controller = useBLCKeyClickerController();

const pauseButtonIcon = computed(() => controller.isPaused ? 'mdi-play' : 'mdi-pause');
const pauseButtonColor = computed(() => timer.remainingMs < 10000 ? 'error' : 'primary');

</script>

<style scoped>
.chest-cycle-timer {
  height: auto
}

</style>