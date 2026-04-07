import exclusivesCatalog from "@/store/loot/config/sets/exclusives.json";
import glyphsCatalog from "@/store/loot/config/sets/glyphs.json";
import nodesCatalog from "@/store/loot/config/sets/nodes.json";
import tonicsCatalog from "@/store/loot/config/sets/tonics.json";
import weaponsCatalog from "@/store/loot/config/sets/weapons.json";
import template from "@/store/loot/config/template.json";

import { DEX_STATUS, DexTree } from "./dexTree";

const DEFAULT_DEX_TREE = new DexTree();

function injestFlatList({label, items, parentId = "root", status = DEX_STATUS.UNKNOWN}) {
  DEFAULT_DEX_TREE.addNode(parentId, { label, status })
  items.forEach((item) => {
    DEFAULT_DEX_TREE.addNode(label, { ...item, idKey: "itemId", status });
  });
}

function injestWeaponsCatalog(catalog) {
  DEFAULT_DEX_TREE.addNode("root", { label: "weapons" })
  catalog.sets.forEach(({items, ...set}) => {
    DEFAULT_DEX_TREE.addNode("weapons", { ...set, idKey: "achievementId" });
    items.forEach((item) => {
      DEFAULT_DEX_TREE.addNode(`achievementId:${set.achievementId}`, { ...item, idKey: "skinId" });
    });
  });
}

const flatCatalogsToInjest = [
  { label: "exclusives", items: exclusivesCatalog.items },
  { label: "glyphs", items: glyphsCatalog.items },
  { label: "nodes", items: nodesCatalog.items },
  { label: "tonics", items: tonicsCatalog.items },
  { label: "contracts", items: template.superRare.items, status: DEX_STATUS.SEEN },
];

flatCatalogsToInjest.forEach(injestFlatList);
injestWeaponsCatalog(weaponsCatalog);
DEFAULT_DEX_TREE.sort();


export { DEFAULT_DEX_TREE };