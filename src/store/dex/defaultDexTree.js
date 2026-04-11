import exclusivesCatalog from "@/store/loot/config/sets/exclusives.json";
import glyphsCatalog from "@/store/loot/config/sets/glyphs.json";
import nodesCatalog from "@/store/loot/config/sets/nodes.json";
import tonicsCatalog from "@/store/loot/config/sets/tonics.json";
import weaponsCatalog from "@/store/loot/config/sets/weapons.json";
import template from "@/store/loot/config/template.json";

import { DEX_STATUS, newDexNode } from "@/store/dex/dexTree";
import * as DexTree from "@/store/dex/dexTree";

function injestFlatList(rootNode, {label, items, status = DEX_STATUS.UNKNOWN}) {
  const flatNode = newDexNode({ label, status });
  DexTree.addChildNode(rootNode, flatNode);
  items.forEach((item) => {
    DexTree.addChildNode(flatNode, newDexNode({ ...item, idKey: "itemId", status }));
  });
}

function injestWeaponsCatalog(rootNode, catalog) {
  const weaponsNode = newDexNode({ label: "weapons" });
  DexTree.addChildNode(rootNode, weaponsNode);

  catalog.sets.forEach(({items, ...set}) => {
    const collectionNode = newDexNode({ ...set, idKey: "achievementId" });
    DexTree.addChildNode(weaponsNode, collectionNode);

    items.forEach((item) => {
      const skinNode = newDexNode({ ...item, idKey: "skinId" });
      DexTree.addChildNode(collectionNode, skinNode);
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

function newDefaultDexTree() {
  const rootNode = newDexNode({ label: "root" });

  flatCatalogsToInjest.forEach((x) => injestFlatList(rootNode, x));
  injestWeaponsCatalog(rootNode, weaponsCatalog);
  DexTree.sortTree(rootNode);
  return rootNode;
}


export { newDefaultDexTree };