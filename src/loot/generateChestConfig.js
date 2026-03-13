/**
 * Picks `count` unique random indices from an array of the given `length`.
 * Uses Fisher-Yates partial shuffle to avoid duplicates.
 */
function sampleIndices(length, count) {
  const pool = Array.from({ length }, (_, i) => i);
  const picked = [];
  for (let i = 0; i < count; i++) {
    const roll = i + Math.floor(Math.random() * (length - i));
    [pool[i], pool[roll]] = [pool[roll], pool[i]];
    picked.push(pool[i]);
  }
  return picked;
}

/**
 * Picks `count` unique random items from a catalog's `items` array.
 */
function pickRandom(catalog, count) {
  return {
    items: sampleIndices(catalog.items.length, count).map((i) => catalog.items[i]),
  };
}

/**
 * Picks a random weapon set name from the catalog, excluding any in `exclude`.
 */
function pickRandomWeaponSet(catalog, exclude = []) {
  const names = Object.keys(catalog.sets).filter((n) => !exclude.includes(n));
  const name = names[Math.floor(Math.random() * names.length)];
  return { name, items: [...catalog.sets[name].items] };
}

/**
 * Generates a chest config by randomly selecting from catalog files.
 *
 * Each catalog's `pickCount` (or implicit count for exclusives/weapons)
 * determines how many items are drawn. Picks are always unique within
 * a catalog, and the two weapon sets are guaranteed to be different.
 *
 * @param {object} options
 * @param {string} options.name - display name for the chest
 * @param {object} options.guaranteedItemCatalog  - guaranteed-items catalog JSON
 * @param {object} options.exclusivesCatalog      - exclusives catalog JSON
 * @param {object} options.dyeKitsCatalog         - dye-kits catalog JSON
 * @param {object} options.weaponsCatalog          - weapons catalog JSON
 * @param {object} options.glyphsCatalog           - glyphs catalog JSON
 * @param {object} options.nodesCatalog            - nodes catalog JSON
 * @param {object} options.tonicsCatalog           - tonics catalog JSON
 * @returns {object} a chest config ready for lootStore.loadChest()
 */
export function generateChestConfig({
  name,
  guaranteedItemCatalog,
  exclusivesCatalog,
  dyeKitsCatalog,
  weaponsCatalog,
  glyphsCatalog,
  nodesCatalog,
  tonicsCatalog,
}) {
  const [newIdx, retIdx] = sampleIndices(exclusivesCatalog.items.length, 2);

  const uncommon = pickRandomWeaponSet(weaponsCatalog);
  const rare = pickRandomWeaponSet(weaponsCatalog, [uncommon.name]);

  return {
    name,
    sets: {
      guaranteedItem: pickRandom(
        guaranteedItemCatalog,
        guaranteedItemCatalog.pickCount,
      ),
      newExclusive: { items: [exclusivesCatalog.items[newIdx]] },
      returningExclusive: { items: [exclusivesCatalog.items[retIdx]] },
      dyeKits: pickRandom(dyeKitsCatalog, dyeKitsCatalog.pickCount),
      uncommonWeapons: uncommon,
      rareWeapons: rare,
      glyphs: pickRandom(glyphsCatalog, glyphsCatalog.pickCount),
      nodes: pickRandom(nodesCatalog, nodesCatalog.pickCount),
      tonic: pickRandom(tonicsCatalog, tonicsCatalog.pickCount),
    },
  };
}
