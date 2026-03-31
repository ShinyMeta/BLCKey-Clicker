import { defineStore } from "pinia";
import { useInventoryStore } from "@/store/inventoryStore";
import { useLootStore } from "@/store/loot/lootStore";
import { useMapCompStore } from "@/store/mapCompStore";
import { useStatStore } from "@/store/statStore";

export const useBLCKeyClickerController = defineStore(
  "blcKeyClickerController",
  () => {
    const inventoryStore = useInventoryStore();
    const lootStore = useLootStore();
    const mapCompStore = useMapCompStore();
    const statStore = useStatStore();

    function advanceMapCompletion(source = "unknown") {
      const reward = mapCompStore.advanceMapCompletion(source);
      if (!reward) {
        return null;
      }

      if (reward.type) {
        inventoryStore.adjustInventory(reward.type, 1);
      }

      return reward;
    }

    function openChest(keyType = "blcKey") {
      const spentKey = inventoryStore.spendInventory(keyType, 1);
      if (!spentKey) {
        return null;
      }

      statStore.addKeySpent(keyType);      

      return lootStore.open(keyType);
    }

    return {
      inventoryStore,
      lootStore,
      mapCompStore,
      advanceMapCompletion,
      openChest,
    };
  }
);
