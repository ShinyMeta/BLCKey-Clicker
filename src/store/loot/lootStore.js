import { defineStore } from "pinia";
import { shallowRef, ref, computed, toRaw } from "vue";
import { mergeTemplateWithConfig, buildLootTable, openChest } from "@/store/loot/lootService";
import { generateChestConfig } from "@/store/loot/generateChestConfig";
import { LootHandler } from "@/store/loot/lootHandler";
import { useInventoryStore } from "@/store/inventoryStore";
import template from "@/store/loot/config/template.json";

const ITEM_ID = {
  STATUETTE: 86694,
  TRANSMUTATION_CHARGE: 64736,
  GOLDEN_KEY: 80967,
  WEAPON_TICKET: 43992,
  TICKET_SCRAP: 43998,
};

export const useLootStore = defineStore("loot", () => {
  const baseLootTable = shallowRef(null);
  const currentChestConfig = ref(null);
  const nextChestConfig = ref(null);
  const lastDrops = shallowRef([]);
  const chestHistory = ref([]);
  const exclusiveLookup = ref(new Map());
  let historyIdCounter = 0;

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

  const inventoryStore = useInventoryStore();
  const lootHandler = new LootHandler();

  const currentHistoryEntry = computed(() =>
    chestHistory.value.length > 0
      ? chestHistory.value[chestHistory.value.length - 1]
      : null,
  );

  const currentExclusives = computed(() => {
    return exclusivesFromConfig(currentChestConfig.value);
  });

  function ensureChestPreviewKey(config) {
    if (!config || typeof config !== "object") {
      return config;
    }

    if (!config.__previewKey) {
      const randomSuffix = Math.random().toString(36).slice(2, 10);
      config.__previewKey = `chest-preview-${Date.now().toString(36)}-${randomSuffix}`;
    }

    return config;
  }

  function exclusivesFromConfig(config) {
    if (!config?.sets) return [];
    const items = [];
    for (const setKey of ["newExclusive", "returningExclusive"]) {
      const entry = config.sets[setKey]?.items?.[0];
      if (!entry) continue;
      const obtained = hasExclusiveDropped(entry.itemId);
      items.push({
        itemId: entry.itemId,
        label: entry.label,
        setKey,
        obtained,
        badgeText: setKey === "newExclusive" && !obtained ? "NEW" : "",
      });
    }
    return items;
  }

  lootHandler
    .onItemId(ITEM_ID.STATUETTE, (drop) => inventoryStore.adjustInventory("statuette", drop.quantity))
    .onItemId(
      ITEM_ID.TRANSMUTATION_CHARGE,
      (drop) => inventoryStore.adjustInventory("transmutationCharge", drop.quantity)
    )
    .onItemId(ITEM_ID.GOLDEN_KEY, (drop) => inventoryStore.adjustInventory("goldenKey", drop.quantity))
    .onItemId(
      ITEM_ID.WEAPON_TICKET,
      (drop) => inventoryStore.adjustInventory("blackLionWeaponTicket", drop.quantity)
    )
    .onItemId(
      ITEM_ID.TICKET_SCRAP,
      () => inventoryStore.adjustInventory("blackLionWeaponTicket", 0.1)
    )
    .onCategory("exclusive", (drop) => {
      markExclusiveDropped(drop.itemId);
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
    // structuredClone cannot clone Vue proxies, so normalize to plain data first.
    const normalizedConfig = ensureChestPreviewKey(structuredClone(toRaw(chestConfig)));
    const merged = mergeTemplateWithConfig(template, normalizedConfig);
    baseLootTable.value = buildLootTable(merged);
    currentChestConfig.value = normalizedConfig;

    const exclusiveItems = baseLootTable.value.fifthDrop.filter(
      (item) => item.category === "exclusive",
    );
    trackNewExclusives(exclusiveItems);

    chestHistory.value.push({
      id: ++historyIdCounter,
      config: structuredClone(normalizedConfig),
      opens: [],
    });
  }

  /**
   * Randomly generate a new chest config from the catalogs and load it
   * so the loot table is immediately ready for `open()`. If a next chest
   * config was prepared during BETWEEN_CHEST_CYCLES, it is consumed.
   *
   * @returns {object} the generated chest config
   */
  function generateCurrentChestConfig() {
    const config =
      nextChestConfig.value ??
      generateChestConfig(currentChestConfig.value, exclusiveLookup.value);

    nextChestConfig.value = null;
    loadChest(config);
    return currentChestConfig.value;
  }

  /**
   * Pre-generate the next chest config so UI can preview it while between cycles.
   * If one is already prepared, return it as-is.
   *
   * @returns {object} the prepared next chest config
   */
  function prepareNextChestConfig() {
    if (nextChestConfig.value) {
      return nextChestConfig.value;
    }

    nextChestConfig.value = generateChestConfig(
      currentChestConfig.value,
      exclusiveLookup.value,
    );

    return nextChestConfig.value;
  }

  /**
   * Open one chest and return the array of drops.
   * The chest must be loaded first via `loadChest()` or
   * `generateCurrentChestConfig()`.
   *
   * Each drop is run through the loot handler (updating inventory, etc.)
   * and appended to the current history entry.
   *
   * @param {string} [keyType="blcKey"] - "blcKey" for normal odds, "goldenKey" for a guaranteed 5th drop
   * @returns {Array<{ itemId: number, skinId?: number, label: string, quantity: number, category: string }>}
   */
  function open(keyType = "blcKey") {
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

  function trackNewExclusives(items) {
    for (const item of items) {
      if (exclusiveLookup.value.has(item.itemId)) {
        continue;
      } else {
        exclusiveLookup.value.set(item.itemId, {
          itemId: item.itemId,
          label: item.label,
          dropped: false,
        });
      }
    }
  }

  function markExclusiveDropped(itemId) {
    const entry = exclusiveLookup.value.get(itemId);
    if (entry) {
      entry.dropped = true;
      return true;
    }
    return false;
  }

  function hasExclusiveDropped(itemId) {
    return exclusiveLookup.value.get(itemId)?.dropped ?? false;
  }

  function resetLootStore() {
    //reset history and exclusive lookup
    chestHistory.value = [];
    exclusiveLookup.value.clear();
    //reset current config and loot table
    currentChestConfig.value = null;
    nextChestConfig.value = null;
    baseLootTable.value = null;
  }

  return {
    lootTable,
    currentChestConfig,
    nextChestConfig,
    lastDrops,
    chestHistory,
    currentHistoryEntry,
    currentExclusives,
    lootHandler,
    exclusivesFromConfig,
    hasExclusiveDropped,
    exclusiveLookup,
    loadChest,
    prepareNextChestConfig,
    generateCurrentChestConfig,
    open,
    resetLootStore
  };
});
