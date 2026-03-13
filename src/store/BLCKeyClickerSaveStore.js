// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";
import { generateChestConfig } from "@/loot/generateChestConfig";
import guaranteedItemCatalog from "@/loot/config/sets/guaranteedItems.json";
import exclusivesCatalog from "@/loot/config/sets/exclusives.json";
import dyeKitsCatalog from "@/loot/config/sets/dyeKits.json";
import weaponsCatalog from "@/loot/config/sets/weapons.json";
import glyphsCatalog from "@/loot/config/sets/glyphs.json";
import nodesCatalog from "@/loot/config/sets/nodes.json";
import tonicsCatalog from "@/loot/config/sets/tonics.json";

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
    const currentChestConfig = ref(null);
    const mapCompKeyDropChance = ref(0.3);
    let nextMapCompCompletionEventId = 0;
    // const achievements = ref();

    function setCurrentChestConfig(chestConfig) {
      currentChestConfig.value = chestConfig;
    }

    function generateCurrentChestConfig() {
      currentChestConfig.value = generateChestConfig({
        name: "Current Black Lion Chest",
        guaranteedItemCatalog,
        exclusivesCatalog,
        dyeKitsCatalog,
        weaponsCatalog,
        glyphsCatalog,
        nodesCatalog,
        tonicsCatalog,
      });

      return currentChestConfig.value;
    }

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
      currentChestConfig,
      mapCompKeyDropChance,
      setCurrentChestConfig,
      generateCurrentChestConfig,
      grantMapCompReward,
      advanceMapCompletion,
    };
  }
);
