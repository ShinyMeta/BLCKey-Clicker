import { defineStore } from "pinia";
import { ref, computed } from "vue";

const START_SECONDS = 5 // 60 * 5;

export const useTimerStore = defineStore("timer", () => {
  const remainingSeconds = ref(START_SECONDS);
  const isRunning = ref(false);
  const showEndDialog = ref(false);
  let intervalId = null;

  const minutes = computed(() => Math.floor(Math.max(0, remainingSeconds.value) / 60));
  const seconds = computed(() => Math.floor(Math.max(0, remainingSeconds.value) % 60));
  const formatted = computed(() => `${String(minutes.value).padStart(2, "0")}:${String(seconds.value).padStart(2, "0")}`);

  const isTimeUp = computed(() => remainingSeconds.value <= 0);

  function start() {
    if (isRunning.value) return;
    isRunning.value = true;
    intervalId = window.setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value -= 1;
      }

      if (remainingSeconds.value <= 0) {
        stop();
        showEndDialog.value = true;
      }
    }, 1000);
  }

  function stop() {
    isRunning.value = false;
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset() {
    stop();
    remainingSeconds.value = START_SECONDS;
    showEndDialog.value = false;
    start();
  }


  // start automatically when the store is first used
  start();

  return {
    remainingSeconds,
    formatted,
    isRunning,
    isTimeUp,
    start,
    stop,
    reset,
  };
});
