import chestNames from "./config/sets/chestNames.json";
import guaranteedItemCatalog from "./config/sets/guaranteedItems.json";
import exclusivesCatalog from "./config/sets/exclusives.json";
import dyeKitsCatalog from "./config/sets/dyeKits.json";
import weaponsCatalog from "./config/sets/weapons.json";
import glyphsCatalog from "./config/sets/glyphs.json";
import nodesCatalog from "./config/sets/nodes.json";
import tonicsCatalog from "./config/sets/tonics.json";

let chestPreviewKeyCounter = 0;

/**
 * Picks a random chest name from the catalog.
 * Appends "Chest" if the chosen name doesn't already contain it.
 */
function pickRandomChestName() {
  const name = chestNames[Math.floor(Math.random() * chestNames.length)];
  return /chest/i.test(name) ? name : `${name} Chest`;
}

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
function pickRandom(catalog, count, excludedIds = new Set()) {
  const pool = (catalog.items || []).filter((it) => {
    return !excludedIds.has(it.itemId);
  });
  const pickCount = Math.min(count, pool.length);
  return {
    items: pickCount > 0 ? sampleIndices(pool.length, pickCount).map((i) => pool[i]) : [],
  };
}

function pickRandomItem(items = []) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Picks a random weapon set name from the catalog, excluding any in `exclude`.
 */
function pickRandomWeaponSet(catalog, exclude = []) {
  const names = Object.keys(catalog.sets).filter((n) => !exclude.includes(n));
  const name = names[Math.floor(Math.random() * names.length)];
  const items = [...catalog.sets[name].items];
  return {
    name,
    items,
    previewItem: pickRandomItem(items),
  };
}

function createChestPreviewKey() {
  chestPreviewKeyCounter += 1;
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  return `chest-preview-${Date.now().toString(36)}-${chestPreviewKeyCounter}-${randomSuffix}`;
}

/**
 * Generates a chest config by randomly selecting from provided catalogs.
 *
 * Each catalog's `pickCount` (or implicit count for exclusives/weapons)
 * determines how many items are drawn. Picks are always unique within
 * a catalog, and the two weapon sets are guaranteed to be different.
 *
 * @param {object} options
 * @param {string} [options.name] - display name override (random if omitted)
 * @param {object} options.guaranteedItemCatalog - guaranteed-items catalog JSON
 * @param {object} options.exclusivesCatalog - exclusives catalog JSON
 * @param {object} options.dyeKitsCatalog - dye-kits catalog JSON
 * @param {object} options.weaponsCatalog - weapons catalog JSON
 * @param {object} options.glyphsCatalog - glyphs catalog JSON
 * @param {object} options.nodesCatalog - nodes catalog JSON
 * @param {object} options.tonicsCatalog - tonics catalog JSON
 * @returns {object} a chest config ready for lootStore.loadChest()
 */
export function generateChestConfigFromCatalogs({
  name,
  guaranteedItemCatalog,
  exclusivesCatalog,
  dyeKitsCatalog,
  weaponsCatalog,
  glyphsCatalog,
  nodesCatalog,
  tonicsCatalog,
  // New params for avoiding repeats
  previousChestConfig = null,
  exclusiveLookup = null,
}) {

  // Collect ids from previous chest to prevent duplicates across consecutive chests.
  const prevIds = new Set();
  const prevWeaponNames = [];

  if (previousChestConfig && previousChestConfig.sets) {
    const keysToCheck = ["guaranteedItem", "dyeKits", "glyphs", "nodes", "tonic"];
    keysToCheck.forEach((key) => {
      const set = previousChestConfig.sets[key];
      if (!set || !Array.isArray(set.items)) return; // overcautious check for expected structure
      set.items.forEach((it) => {
        prevIds.add(it.itemId);
      });
    });

    // Collect previous weapon set names to ensure new sets are different.
    ["uncommonWeapons", "rareWeapons"].forEach((key) => {
      const set = previousChestConfig.sets[key];
      if (!set || !set.name) return; // overcautious check for expected structure
      prevWeaponNames.push(set.name);
    });
  }
  const uncommon = pickRandomWeaponSet(weaponsCatalog, prevWeaponNames);
  const rare = pickRandomWeaponSet(weaponsCatalog, [uncommon.name, ...prevWeaponNames]);


  // Pick Exculsives
  const prevExclusiveIds = new Set();
  const nextExclusives = [];
  
  if (previousChestConfig && exclusiveLookup) {
    exclusiveLookup.keys().forEach((id) => {
      prevExclusiveIds.add(id);
    })
    const prevItem = previousChestConfig.sets.newExclusive.items[0];
    
    nextExclusives.push({items: [{...prevItem}]});
  }
  else {
    nextExclusives.push(pickRandom(exclusivesCatalog, 1, prevExclusiveIds));
  }
  nextExclusives.push(pickRandom(exclusivesCatalog, 1, prevExclusiveIds));


  return {
    __previewKey: createChestPreviewKey(),
    name: name ?? pickRandomChestName(),
    appearanceType: Math.floor(Math.random() * 4),
    sets: {
      guaranteedItem: pickRandom( guaranteedItemCatalog, guaranteedItemCatalog.pickCount, prevIds),
      returningExclusive: nextExclusives[0],
      newExclusive: nextExclusives[1],
      dyeKits: pickRandom(dyeKitsCatalog, dyeKitsCatalog.pickCount, prevIds),
      uncommonWeapons: uncommon,
      rareWeapons: rare,
      glyphs: pickRandom(glyphsCatalog, glyphsCatalog.pickCount, prevIds),
      nodes: pickRandom(nodesCatalog, nodesCatalog.pickCount, prevIds),
      tonic: pickRandom(tonicsCatalog, tonicsCatalog.pickCount, prevIds),
    },
  };
}

/**
 * Generates a chest config from the app's bundled set catalogs.
 *
 * @returns {object} a chest config ready for lootStore.loadChest()
 */
export function generateChestConfig(previousChestConfig = null, exclusiveLookup = null) {
  return generateChestConfigFromCatalogs({
    guaranteedItemCatalog,
    exclusivesCatalog,
    dyeKitsCatalog,
    weaponsCatalog,
    glyphsCatalog,
    nodesCatalog,
    tonicsCatalog,
    previousChestConfig,
    exclusiveLookup,
  });
}
