import { defineStore } from "pinia";
import { shallowRef, ref } from "vue";
import { mergeTemplateWithConfig, buildLootTable, openChest } from "@/store/loot/lootService";
import { generateChestConfig } from "@/store/loot/generateChestConfig";
import template from "@/store/loot/config/template.json";
import guaranteedItemCatalog from "@/store/loot/config/sets/guaranteedItems.json";
import exclusivesCatalog from "@/store/loot/config/sets/exclusives.json";
import dyeKitsCatalog from "@/store/loot/config/sets/dyeKits.json";
import weaponsCatalog from "@/store/loot/config/sets/weapons.json";
import glyphsCatalog from "@/store/loot/config/sets/glyphs.json";
import nodesCatalog from "@/store/loot/config/sets/nodes.json";
import tonicsCatalog from "@/store/loot/config/sets/tonics.json";

export const useLootStore = defineStore("loot", () => {
  const lootTable = shallowRef(null);
  const chestName = ref("");
  const currentChestConfig = ref(null);
  const lastDrops = shallowRef([]);

  /**
   * Load a specific chest by providing a chest config.
   * Merges the config with the shared template, builds the loot table,
   * and stores the config for downstream consumers (e.g. ChestPreviewDialog).
   *
   * @param {object} chestConfig - generated chest config with inline sets
   */
  function loadChest(chestConfig) {
    const merged = mergeTemplateWithConfig(template, chestConfig);
    lootTable.value = buildLootTable(merged);
    chestName.value = chestConfig.name ?? "";
    currentChestConfig.value = chestConfig;
  }

  /**
   * Randomly generate a new chest config from the catalogs and load it
   * so the loot table is immediately ready for `open()`.
   *
   * @returns {object} the generated chest config
   */
  function generateCurrentChestConfig() {
    const config = generateChestConfig({
      name: "Current Black Lion Chest",
      guaranteedItemCatalog,
      exclusivesCatalog,
      dyeKitsCatalog,
      weaponsCatalog,
      glyphsCatalog,
      nodesCatalog,
      tonicsCatalog,
    });

    loadChest(config);
    return config;
  }

  /**
   * Open one chest and return the array of drops.
   * The chest must be loaded first via `loadChest()` or
   * `generateCurrentChestConfig()`.
   *
   * @returns {Array<{ itemId: number, skinId?: number, label: string, quantity: number, category: string }>}
   */
  function open() {
    if (!lootTable.value) {
      throw new Error("No chest loaded — call loadChest() first");
    }
    const drops = openChest(lootTable.value);
    lastDrops.value = drops;
    return drops;
  }

  return {
    lootTable,
    chestName,
    currentChestConfig,
    lastDrops,
    loadChest,
    generateCurrentChestConfig,
    open,
  };
});
