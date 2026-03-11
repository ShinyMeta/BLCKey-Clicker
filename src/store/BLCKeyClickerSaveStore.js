// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBLCKeyClickerSaveStore = defineStore(
  "BLCKeyClickerSave",
  () => {
    const mapCompClicksToComp = ref(10);
    const mapCompProgress = ref(0);
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

    function stepMapCompProgress() {
      mapCompProgress.value += 1;

      if (mapCompProgress.value < mapCompClicksToComp.value) {
        return null;
      }

      mapCompProgress.value = 0;
      return grantMapCompReward();
    }

    return {
      mapCompClicksToComp,
      mapCompProgress,
      inventory,
      mapCompKeyDropChance,
      grantMapCompReward,
      stepMapCompProgress,
    };
  }
);
