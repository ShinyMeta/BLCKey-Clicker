<template>
  <v-btn
    class="chest-cycle-timer pa-4"
    :class="timerLabelClass"
    variant="tonal"
    :color="timerButtonColor"
    size="x-large"
    :prepend-icon="timerButtonIcon"
    @click="handleTimerButtonClick"
  >
    {{ timerLabel }}
  </v-btn>
</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";
import { computed } from "vue";

const timer = useTimerStore();
const controller = useBLCKeyClickerController();

const isBetweenChestCycles = computed(() => controller.isBetweenChestCycles);

const timerButtonIcon = computed(() => {
  if (isBetweenChestCycles.value) return "mdi-download";
  return controller.isPaused ? "mdi-play" : "mdi-pause";
});

const timerButtonColor = computed(() => {
  if (isBetweenChestCycles.value) return "primary";
  return timer.remainingMs < 30000 ? "error" : "primary";
});

const timerLabel = computed(() => {
  return isBetweenChestCycles.value ? "Patch" : timer.formatted;
});

const timerLabelClass = computed(() => {
  return isBetweenChestCycles.value ? "text-h3" : "text-h3";
});

function handleTimerButtonClick() {
  if (isBetweenChestCycles.value) {
    controller.startChestCycle("timerButton");
    return;
  }

  controller.togglePause();
}

</script>

<style scoped>
.chest-cycle-timer {
  height: auto
}

</style>