import chestNames from "./config/sets/chestNames.json";
import guaranteedItemCatalog from "./config/sets/guaranteedItems.json";
import exclusivesCatalog from "./config/sets/exclusives.json";
import dyeKitsCatalog from "./config/sets/dyeKits.json";
import weaponsCatalog from "./config/sets/weapons.json";
import glyphsCatalog from "./config/sets/glyphs.json";
import nodesCatalog from "./config/sets/nodes.json";
import tonicsCatalog from "./config/sets/tonics.json";
import { generateChestConfigFromCatalogs } from "./generateChestConfigCore.mjs";

/**
 * Generates a chest config from the app's bundled set catalogs.
 *
 * @returns {object} a chest config ready for lootStore.loadChest()
 */
export function generateChestConfig(previousChestConfig = null, seenExclusiveItemIds) {
  return generateChestConfigFromCatalogs({
    chestNames,
    guaranteedItemCatalog,
    exclusivesCatalog,
    dyeKitsCatalog,
    weaponsCatalog,
    glyphsCatalog,
    nodesCatalog,
    tonicsCatalog,
    previousChestConfig,
    seenExclusiveItemIds,
  });
}
