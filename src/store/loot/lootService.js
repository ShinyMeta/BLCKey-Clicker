/**
 * Resolves a single template category by combining its fixed items with
 * items injected from set configs via slot declarations.  Preserves the
 * slot grouping so that consumers (e.g. a preview UI) can display items
 * by slot while still having resolved weights.
 *
 * Slot weight resolution (first match wins):
 *  1. Item's own `weight` property (from the set config)
 *  2. Slot's `weightPerItem` — fixed weight assigned to every item
 *  3. Slot's `totalWeight` — divided evenly among all items in the set
 *
 * @param {{ items?: object[], slots?: object[] }} category
 * @param {Record<string, { name?: string, items: object[] }>} sets
 * @returns {{ items: object[], slots: object[] }}
 */
function resolveCategory(category, sets) {
  const items = (category.items ?? []).map((item) => ({
    ...item,
    quantity: item.quantity ?? 1,
  }));

  const slots = [];

  for (const slot of category.slots ?? []) {
    const setConfig = sets[slot.setKey];
    if (!setConfig?.items?.length) {
      continue;
    }

    const perItemWeight =
      slot.weightPerItem ??
      (slot.totalWeight != null
        ? slot.totalWeight / setConfig.items.length
        : undefined);

    const resolvedItems = setConfig.items.map((item) => ({
      ...item,
      quantity: item.quantity ?? 1,
      weight: item.weight ?? perItemWeight,
    }));

    slots.push({
      setKey: slot.setKey,
      name: setConfig.name,
      items: resolvedItems,
    });
  }

  return { items, slots };
}

/**
 * Merges a loot-table template with a chest config, resolving every
 * category's fixed items and slot-injected items while preserving the
 * per-category / per-slot grouping.
 *
 * This is the shared intermediate representation used by both the
 * preview UI (which needs the grouping) and `buildLootTable` (which
 * flattens it further for rolling).
 *
 * @param {object} template - parsed template.json
 * @param {object} chestConfig - chest config with a `sets` map
 * @returns {object} merged config keyed by category
 */
export function mergeTemplateWithConfig(template, chestConfig) {
  const { sets } = chestConfig;

  return {
    fifthDropChance: template.fifthDropChance,
    guaranteed: resolveCategory(template.guaranteed, sets),
    commonLeft: resolveCategory(template.commonLeft, sets),
    commonRight: resolveCategory(template.commonRight, sets),
    exclusive: resolveCategory(template.exclusive, sets),
    uncommon: resolveCategory(template.uncommon, sets),
    rare: resolveCategory(template.rare, sets),
    superRare: resolveCategory(template.superRare, sets),
  };
}

/**
 * Flattens a resolved category into a plain item array, tagging each
 * item with its category name for downstream identification.
 */
function flattenCategory(resolved, categoryName) {
  const items = resolved.items.map((item) => ({
    ...item,
    category: categoryName,
  }));

  for (const slot of resolved.slots) {
    for (const item of slot.items) {
      items.push({ ...item, category: categoryName });
    }
  }

  return items;
}

/**
 * Flattens a merged config (from `mergeTemplateWithConfig`) into a
 * loot table ready for rolling.
 *
 * The resulting table has four sections:
 *  - `guaranteed`   – items always received (no weighting)
 *  - `commonLeft`   – first common drop pool (one draw)
 *  - `commonRight`  – second common drop pool (one draw)
 *  - `fifthDrop`    – single pool combining exclusive/uncommon/rare/superRare,
 *                      drawn once with probability `fifthDropChance`
 *
 * @param {object} mergedConfig - output of mergeTemplateWithConfig()
 * @returns {object} resolved loot table
 */
export function buildLootTable(mergedConfig) {
  return {
    fifthDropChance: mergedConfig.fifthDropChance,

    guaranteed: flattenCategory(mergedConfig.guaranteed, "guaranteed"),

    commonLeft: flattenCategory(mergedConfig.commonLeft, "commonLeft"),
    commonRight: flattenCategory(mergedConfig.commonRight, "commonRight"),

    fifthDrop: [
      ...flattenCategory(mergedConfig.exclusive, "exclusive"),
      ...flattenCategory(mergedConfig.uncommon, "uncommon"),
      ...flattenCategory(mergedConfig.rare, "rare"),
      ...flattenCategory(mergedConfig.superRare, "superRare"),
    ],
  };
}

/**
 * Weighted random selection from a list of items.
 * Each item must have a numeric `weight` property.
 *
 * @param {Array<{ weight: number }>} items
 * @returns {object} the selected item
 */
function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= item.weight;
    if (roll < 0) return item;
  }

  return items[items.length - 1];
}

/**
 * Simulates opening one Black Lion Chest.
 *
 * Returns an array of 4–5 drop results:
 *  1. Black Lion Statuette (guaranteed)
 *  2. Guaranteed Rotating Item (guaranteed)
 *  3. Common left draw
 *  4. Common right draw
 *  5. (10% chance) One item from the exclusive/uncommon/rare/superRare pool
 *
 * Each result is a plain object with:
 *  `{ itemId, label, quantity, category }`
 *
 * @param {object} lootTable - resolved table from buildLootTable()
 * @param {string} [keyType="blcKey"] - "blcKey" for normal odds, "goldenKey" for a guaranteed 5th drop
 * @returns {Array<{ itemId: number, label: string, quantity: number, category: string }>}
 */
export function openChest(lootTable, keyType = "blcKey") {
  const drops = [];

  function pluck(item) {
    return {
      itemId: item.itemId,
      skinId: item.skinId,
      label: item.label,
      quantity: item.quantity,
      category: item.category,
    };
  }

  for (const item of lootTable.guaranteed) {
    drops.push(pluck(item));
  }

  drops.push(pluck(weightedRandom(lootTable.commonLeft)));
  drops.push(pluck(weightedRandom(lootTable.commonRight)));

  if (keyType === "goldenKey" || Math.random() < lootTable.fifthDropChance) {
    drops.push(pluck(weightedRandom(lootTable.fifthDrop)));
  }

  return drops;
}

/**
 * Convenience factory: merges a template with a chest config, builds
 * the loot table, and returns a service object with a single
 * `openChest()` method bound to that table.
 *
 * @param {object} template
 * @param {object} chestConfig - chest config with a `sets` map
 * @returns {{ lootTable: object, openChest: () => object[] }}
 */
export function createLootService(template, chestConfig) {
  const merged = mergeTemplateWithConfig(template, chestConfig);
  const lootTable = buildLootTable(merged);
  return {
    lootTable,
    openChest: () => openChest(lootTable),
  };
}
