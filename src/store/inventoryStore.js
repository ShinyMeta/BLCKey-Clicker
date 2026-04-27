import { defineStore } from "pinia";
import { useSaveManager } from "@/store/saveManager";

const DEFAULT_INVENTORY = {
  blcKey: 25,
  goldenKey: 5,
  statuette: 0,
  // gold: 0,
  // gems: 0, not sure about these
  transmutationCharge: 0,
  blackLionWeaponTicket: 0,
  // giftOfExploration: 0,
  // giftOfBattle: 0,
};

function roundInventoryAmount(value) {
  return Math.round(value * 10) / 10;
}

export const useInventoryStore = defineStore("inventory", () => {
  const saveManager = useSaveManager();
  const inventorySaveCategory = saveManager.useSaveCategory("inventory");
  const inventory = inventorySaveCategory.useSaveCategoryStorage("inventory", {
    defaultValue: { ...DEFAULT_INVENTORY },
  });

  /**
   * Add a numeric amount to an inventory field, rounding to one
   * decimal place to prevent floating-point drift (e.g. ticket scraps).
   * @param {string} key - inventory property name
   * @param {number} amount
   * @returns {number} the updated value
   */
  function adjustInventory(key, amount) {
    const currentValue = inventory.value[key] ?? 0;
    const nextValue = roundInventoryAmount(currentValue + amount);
    inventory.value[key] = nextValue;
    return nextValue;
  }

  function hasInventory(key, amount = 1) {
    return (inventory.value[key] ?? 0) >= amount;
  }

  function spendInventory(key, amount = 1) {
    if (!hasInventory(key, amount)) {
      return false;
    }

    adjustInventory(key, -amount);
    return true;
  }

  function resetInventory() {
    inventorySaveCategory.resetCategory();
  }

  return {
    inventory,
    adjustInventory,
    hasInventory,
    spendInventory,
    resetInventory,
  };
});
