import { defineStore } from "pinia";
import { shallowRef, ref, computed } from "vue";
import { mergeTemplateWithConfig, buildLootTable, openChest } from "@/store/loot/lootService";
import { generateChestConfig } from "@/store/loot/generateChestConfig";
import { LootHandler } from "@/store/loot/lootHandler";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";
import template from "@/store/loot/config/template.json";
import guaranteedItemCatalog from "@/store/loot/config/sets/guaranteedItems.json";
import exclusivesCatalog from "@/store/loot/config/sets/exclusives.json";
import dyeKitsCatalog from "@/store/loot/config/sets/dyeKits.json";
import weaponsCatalog from "@/store/loot/config/sets/weapons.json";
import glyphsCatalog from "@/store/loot/config/sets/glyphs.json";
import nodesCatalog from "@/store/loot/config/sets/nodes.json";
import tonicsCatalog from "@/store/loot/config/sets/tonics.json";

const ITEM_ID = {
  STATUETTE: 86694,
  TRANSMUTATION_CHARGE: 64736,
  GOLDEN_KEY: 80967,
  WEAPON_TICKET: 43992,
  TICKET_SCRAP: 43998,
};

export const useLootStore = defineStore("loot", () => {
  const baseLootTable = shallowRef(null);
  const chestName = ref("");
  const currentChestConfig = ref(null);
  const lastDrops = shallowRef([]);
  const chestHistory = ref([]);
  const exclusiveLookup = shallowRef(new Map());

  const lootTable = computed(() => {
    if (!baseLootTable.value) return null;
    const lookup = exclusiveLookup.value;
    return {
      ...baseLootTable.value,
      fifthDrop: baseLootTable.value.fifthDrop.filter(
        (item) => item.category !== "exclusive" || !lookup.get(item.itemId)?.dropped,
      ),
    };
  });

  const saveStore = useBLCKeyClickerSaveStore();
  const lootHandler = new LootHandler();

  const currentHistoryEntry = computed(() =>
    chestHistory.value.length > 0
      ? chestHistory.value[chestHistory.value.length - 1]
      : null,
  );

  lootHandler
    .onItemId(ITEM_ID.STATUETTE, (drop) => saveStore.addToInventory("statuettes", drop.quantity))
    .onItemId(ITEM_ID.TRANSMUTATION_CHARGE, (drop) => saveStore.addToInventory("transmutationCharges", drop.quantity))
    .onItemId(ITEM_ID.GOLDEN_KEY, (drop) => saveStore.addToInventory("goldenKeys", drop.quantity))
    .onItemId(ITEM_ID.WEAPON_TICKET, (drop) => saveStore.addToInventory("blackLionWeaponTickets", drop.quantity))
    .onItemId(ITEM_ID.TICKET_SCRAP, () => saveStore.addToInventory("blackLionWeaponTickets", 0.1))
    .onCategory("exclusive", (drop) => {
      lootHandler.markExclusiveDropped(drop.itemId);
      exclusiveLookup.value = new Map(lootHandler.exclusiveLookup);
    });

  /**
   * Load a specific chest by providing a chest config.
   * Merges the config with the shared template, builds the loot table,
   * stores the config for downstream consumers (e.g. ChestPreviewDialog),
   * and starts a new chest-history entry for this config.
   *
   * @param {object} chestConfig - generated chest config with inline sets
   */
  function loadChest(chestConfig) {
    const merged = mergeTemplateWithConfig(template, chestConfig);
    baseLootTable.value = buildLootTable(merged);
    chestName.value = chestConfig.name ?? "";
    currentChestConfig.value = chestConfig;

    const exclusiveItems = baseLootTable.value.fifthDrop.filter(
      (item) => item.category === "exclusive",
    );
    lootHandler.initExclusives(exclusiveItems);
    exclusiveLookup.value = new Map(lootHandler.exclusiveLookup);

    chestHistory.value.push({
      config: structuredClone(chestConfig),
      opens: [],
    });
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
   * Each drop is run through the loot handler (updating inventory, etc.)
   * and appended to the current history entry.
   *
   * @param {string} [keyType="blcKeys"] - "blcKeys" for normal odds, "goldenKeys" for a guaranteed 5th drop
   * @returns {Array<{ itemId: number, skinId?: number, label: string, quantity: number, category: string }>}
   */
  function open(keyType = "blcKeys") {
    if (!lootTable.value) {
      throw new Error("No chest loaded — call loadChest() first");
    }
    const drops = openChest(lootTable.value, keyType);
    lastDrops.value = drops;

    lootHandler.processDrops(drops);

    if (currentHistoryEntry.value) {
      currentHistoryEntry.value.opens.push(drops);
    }

    return drops;
  }

  function hasExclusiveDropped(itemId) {
    return exclusiveLookup.value.get(itemId)?.dropped ?? false;
  }

  return {
    lootTable,
    chestName,
    currentChestConfig,
    lastDrops,
    chestHistory,
    currentHistoryEntry,
    hasExclusiveDropped,
    lootHandler,
    loadChest,
    generateCurrentChestConfig,
    open,
  };
});
