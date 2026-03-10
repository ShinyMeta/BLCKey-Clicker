// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBLCKeyClickerSaveStore = defineStore(
  "BLCKeyClickerSave",
  () => {
    const mapCompletionClicksToComp = ref(10);
    const mapCompletionProgress = ref(0);
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
    const mapCompletionKeyDropChance = ref(0.3);
    // const achievements = ref();

    function grantMapCompletionReward() {
      const rewardType =
        Math.random() < mapCompletionKeyDropChance.value
          ? "key"
          : "transmutationCharge";

      if (rewardType === "key") {
        inventory.value.blcKeys += 1;
      } else {
        inventory.value.transmutationCharges += 1;
      }

      return { type: rewardType };
    }

    function registerMapCompletionClick() {
      mapCompletionProgress.value += 1;

      if (mapCompletionProgress.value < mapCompletionClicksToComp.value) {
        return null;
      }

      mapCompletionProgress.value = 0;
      return grantMapCompletionReward();
    }

    return {
      mapCompletionClicksToComp,
      mapCompletionProgress,
      inventory,
      mapCompletionKeyDropChance,
      grantMapCompletionReward,
      registerMapCompletionClick,
    };
  }
);
