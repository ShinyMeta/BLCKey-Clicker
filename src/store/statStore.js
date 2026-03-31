import { defineStore } from "pinia";
import { ref } from "vue";

export const useStatStore = defineStore("stat", () => {
  const totalMapComps = ref(0);
  const totalKeysSpent = ref({blcKey: 0, goldenKey: 0});
  const chestsSinceLastFifthDrop = ref(0);
  const unluckiestStreak = ref(0);

  function incrementTotalMapComps() {
    totalMapComps.value += 1;
  }

  function addKeySpent(keyType) {
    // currently we only track total keys spent (regardless of type)
    totalKeysSpent.value[keyType] += 1;
  }

  function recordChestDropCount(dropCount) {
    // If there are 5 or more drops, reset the counter
    if (dropCount >= 5) {
      chestsSinceLastFifthDrop.value = 0;
      return;
    }

    // Increment only when there are exactly 4 drops
    if (dropCount === 4) {
      chestsSinceLastFifthDrop.value += 1;
      // update unluckiestStreak if current streak is larger
      if (chestsSinceLastFifthDrop.value > unluckiestStreak.value) {
        unluckiestStreak.value = chestsSinceLastFifthDrop.value;
      }
    }
  }

  return {
    totalMapComps,
    totalKeysSpent,
    chestsSinceLastFifthDrop,
    unluckiestStreak,
    incrementTotalMapComps,
    addKeySpent,
    recordChestDropCount,
  };
});
