// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBLCKeyClickerSaveStore = defineStore(
  "BLCKeyClickerSave",
  () => {
    const MAX_MAP_COMP_COMPLETION_EVENTS = 10;
    const mapCompClicksToComp = ref(10);
    const mapCompProgress = ref(0);
    const mapCompCompletionEvents = ref([]);
    const inventory = ref({
      blcKeys: 0,
      goldenKeys: 0,
      statuettes: 0,
      // gold: 0,
      // gems: 0, not sure about these
      transmutationCharges: 0,
      blackLionWeaponTickets: 0,
      giftOfExploration: 0,
      giftOfBattle: 0,
    });
    const mapCompKeyDropChance = ref(0.3);
    let nextMapCompCompletionEventId = 0;
    // const achievements = ref();

    function grantMapCompReward() {
      const rewardType =
        Math.random() < mapCompKeyDropChance.value
          ? "blcKey"
          : "transmutationCharge";

      if (rewardType === "blcKey") {
        inventory.value.blcKeys += 1;
      } else {
        inventory.value.transmutationCharges += 1;
      }

      return { type: rewardType };
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
        return;
      }

      const reward = grantMapCompReward();
      mapCompProgress.value = 0;
      appendMapCompletionEvent(reward, source);
    }

    return {
      mapCompClicksToComp,
      mapCompProgress,
      mapCompCompletionEvents,
      inventory,
      mapCompKeyDropChance,
      grantMapCompReward,
      advanceMapCompletion,
    };
  }
);
