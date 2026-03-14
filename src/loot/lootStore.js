import { defineStore } from "pinia";
import { shallowRef, ref } from "vue";
import { mergeTemplateWithConfig, buildLootTable, openChest } from "@/loot/lootService";

export const useLootStore = defineStore("loot", () => {
  const lootTable = shallowRef(null);
  const chestName = ref("");

  /**
   * Load a specific chest by providing the template and a chest config.
   * The chest config's `sets` map contains inline item arrays, so no
   * file-path resolution is needed — pass them straight through.
   *
   * @param {object} template   - parsed template.json
   * @param {object} chestConfig - generated chest config with inline sets
   */
  function loadChest(template, chestConfig) {
    const merged = mergeTemplateWithConfig(template, chestConfig);
    lootTable.value = buildLootTable(merged);
    chestName.value = chestConfig.name ?? "";
  }

  /**
   * Open one chest and return the array of drops.
   * The chest must be loaded first via `loadChest()`.
   *
   * @returns {Array<{ itemId: number, label: string, quantity: number, category: string }>}
   */
  function open() {
    if (!lootTable.value) {
      throw new Error("No chest loaded — call loadChest() first");
    }
    return openChest(lootTable.value);
  }

  return { lootTable, chestName, loadChest, open };
});
