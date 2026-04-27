import { defineStore } from "pinia";
import { ref } from "vue";
import { useStatStore } from "@/store/statStore";
import { useSaveManager } from "@/store/saveManager";

const MAX_MAP_COMP_COMPLETION_EVENTS = 10;
export const useMapCompStore = defineStore("mapComp", () => {
  const saveManager = useSaveManager();
  const mapCompSaveCategory = saveManager.useSaveCategory("mapComp");

  const mapCompClicksToComp = ref(5);
  const mapCompProgress = mapCompSaveCategory.useSaveCategoryStorage("mapCompProgress", {
    defaultValue: 0,
  });
  const mapCompCompletionEvents = ref([]);
  const mapCompKeyDropChance = ref(0.3);
  let nextMapCompCompletionEventId = 0;

  const statStore = useStatStore();

  function rollReward() {
    if (Math.random() < mapCompKeyDropChance.value) {
      return {
        type: "blcKey",
      };
    }

    return {
      type: "transmutationCharge",
    };
  }

  function appendMapCompletionEvent(reward, source = "unknown") {
    mapCompCompletionEvents.value.push({
      id: nextMapCompCompletionEventId++,
      reward,
      source,
    });

    if (mapCompCompletionEvents.value.length > MAX_MAP_COMP_COMPLETION_EVENTS) {
      mapCompCompletionEvents.value.splice(
        0,
        mapCompCompletionEvents.value.length - MAX_MAP_COMP_COMPLETION_EVENTS
      );
    }
  }

  function advanceMapCompletion(source = "unknown") {
    mapCompProgress.value += 1;
    if (mapCompProgress.value < mapCompClicksToComp.value) {
      return null;
    }

    const reward = rollReward();
    mapCompProgress.value = 0;
    appendMapCompletionEvent(reward, source);
    // increment global stat for map completions
    statStore.incrementTotalMapComps();
    
    return reward;
  }

  function resetMapComp() {
    mapCompSaveCategory.resetCategory();
    mapCompCompletionEvents.value = [];
  }

  return {
    mapCompClicksToComp,
    mapCompProgress,
    mapCompCompletionEvents,
    mapCompKeyDropChance,
    advanceMapCompletion,
    resetMapComp,
  };
});
