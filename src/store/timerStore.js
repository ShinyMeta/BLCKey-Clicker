import { emitSoundEvent } from "@/services/sound";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSaveManager } from "@/store/saveManager";

export const useTimerStore = defineStore("timer", () => {
  const saveManager = useSaveManager();
  const timerSaveCategory = saveManager.useSaveCategory("timer");

  // Default to 5 minutes
  const START_MS = 5 * 60 * 1000;
  const TICK_MS = 10; // interval timer
  const SNAPSHOT_WRITE_INTERVAL_MS = 500;
  const getDefaults = computed(() => {
    return {
      START_MS,
      TICK_MS,
    };
  });

  const persistedSnapshot = timerSaveCategory.useSaveCategoryStorage("snapshot", {
    defaultValue: {
      remainingMs: 0,
      isPaused: false,
    },
    reset: () => {
      stop();
    },
  });

  const remainingMs = ref(0);
  const isPaused = ref(false);

  let intervalId = null;
  let lastTick = 0;
  let lastSnapshotWriteAt = 0;

  const isActiveChestCycle = computed(() => remainingMs.value > 0);
  const isBetweenChestCycles = computed(() => remainingMs.value <= 0);

  const formatted = computed(() => {
    const totalMs = Math.max(0, remainingMs.value);
    const minutes = Math.floor(totalMs / 60 / 1000);
    const seconds = Math.floor(totalMs / 1000) % 60;
    const milliseconds = (totalMs % 1000);
    const tenths = Math.floor(milliseconds / 100);

    if (totalMs < 10000) {
      // show seconds.milliseconds as x.xxx
      return `${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
  });

  function writeSnapshot({ force = false } = {}) {
    const now = Date.now();
    if (!force && now - lastSnapshotWriteAt < SNAPSHOT_WRITE_INTERVAL_MS) {
      return;
    }

    lastSnapshotWriteAt = now;
    persistedSnapshot.value = {
      remainingMs: Math.max(0, Math.round(remainingMs.value)),
      isPaused: Boolean(isPaused.value && remainingMs.value > 0),
    };
  }

  function hydrateFromSnapshot() {
    const snapshot = persistedSnapshot.value ?? {};
    const persistedRemaining = Number(snapshot.remainingMs ?? 0);
    const persistedPaused = Boolean(snapshot.isPaused);

    const clampedRemaining = Number.isFinite(persistedRemaining)
      ? Math.max(0, persistedRemaining)
      : 0;

    remainingMs.value = clampedRemaining;
    isPaused.value = clampedRemaining > 0 ? persistedPaused : false;

    if (remainingMs.value > 0 && !isPaused.value) {
      lastTick = Date.now();
      intervalId = window.setInterval(tick, TICK_MS);
    }

    writeSnapshot({ force: true });
  }

  function tick() {
    const now = Date.now();
    if (!lastTick) lastTick = now;
    const delta = now - lastTick;
    lastTick = now;

    if (remainingMs.value > 0) {
      remainingMs.value = Math.max(0, remainingMs.value - delta);
      writeSnapshot();
    }

    if (remainingMs.value <= 0) {
      remainingMs.value = 0;
      emitSoundEvent("timerHitZero");
      stop();
    }
  }

  function start() {
    if (isActiveChestCycle.value) return;
    isPaused.value = false;
    remainingMs.value = START_MS;
    lastTick = Date.now();
    intervalId = window.setInterval(tick, TICK_MS);
    writeSnapshot({ force: true });
  }

  // clears interval, resets lastTick, really only used internally
  function stop() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    lastTick = 0;
    remainingMs.value = 0;
    isPaused.value = false;
    writeSnapshot({ force: true });
  }

  function restart() {
    stop();
    start();
  }

  function togglePause() {
    emitSoundEvent("timerPause");
    isPaused.value = !isPaused.value;
    // if we're pausing, clear the interval. If we're unpausing, start a new interval and reset lastTick
    if (isPaused.value) {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
        lastTick = 0;
      }
    } else {
      lastTick = Date.now();
      intervalId = window.setInterval(tick, TICK_MS);
    }

    writeSnapshot({ force: true });
  }

  hydrateFromSnapshot();

  return {
    // constants getters
    getDefaults,

    // state
    remainingMs,
    formatted,
    isPaused,
    isActiveChestCycle,
    isBetweenChestCycles,

    // actions
    start,
    stop,
    restart,
    togglePause,
  };
});
