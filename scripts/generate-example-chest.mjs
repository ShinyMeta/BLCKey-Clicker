import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { generateChestConfigFromCatalogs } from "../src/store/loot/generateChestConfigCore.mjs";
import chestNames from "../src/store/loot/config/sets/chestNames.json" with { type: "json" };
import guaranteedItemCatalog from "../src/store/loot/config/sets/guaranteedItems.json" with { type: "json" };
import exclusivesCatalog from "../src/store/loot/config/sets/exclusives.json" with { type: "json" };
import dyeKitsCatalog from "../src/store/loot/config/sets/dyeKits.json" with { type: "json" };
import weaponsCatalog from "../src/store/loot/config/sets/weapons.json" with { type: "json" };
import glyphsCatalog from "../src/store/loot/config/sets/glyphs.json" with { type: "json" };
import nodesCatalog from "../src/store/loot/config/sets/nodes.json" with { type: "json" };
import tonicsCatalog from "../src/store/loot/config/sets/tonics.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../src/store/loot/config/chests/example.json");

const chest = generateChestConfigFromCatalogs({
  name: "Example Chest",
  chestNames,
  guaranteedItemCatalog,
  exclusivesCatalog,
  dyeKitsCatalog,
  weaponsCatalog,
  glyphsCatalog,
  nodesCatalog,
  tonicsCatalog,
});

writeFileSync(outPath, JSON.stringify(chest, null, 2) + "\n");
console.log(`Wrote ${outPath}`);
