// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBLCKeyClickerSaveStore = defineStore(
  "BLCKeyClickerSave",
  () => {
    const inventory = ref({
      keys: 0,
      goldenKeys: 0,
      statuettes: 0,
      // gold: 0,
      // gems: 0, not sure about these
      transmutationCharges: 0,
      blackLionWeaponTickets: 0,
      giftOfExploration: 0,
      giftOfBattle: 0,
    });
    // const achievements = ref();

    return { inventory };
  }
);
