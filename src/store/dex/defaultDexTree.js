import exclusivesCatalog from "@/store/loot/config/sets/exclusives.json";
import glyphsCatalog from "@/store/loot/config/sets/glyphs.json";
import nodesCatalog from "@/store/loot/config/sets/nodes.json";
import tonicsCatalog from "@/store/loot/config/sets/tonics.json";
import weaponsCatalog from "@/store/loot/config/sets/weapons.json";
import template from "@/store/loot/config/template.json";

import iconExclusives from "@/assets/Achievement/exclusives.png";
import iconGlyphs from "@/assets/Achievement/glyphs.png";
import iconNodes from "@/assets/Achievement/nodes.png";
import iconTonics from "@/assets/Achievement/tonics.png";
import iconContracts from "@/assets/Achievement/contracts.png";
import iconWeaponCollections from "@/assets/Achievement/weaponCollections.png";
import iconWeaponSet from "@/assets/Achievement/weaponSet.png";

import { DEX_STATUS, newDexNode } from "@/store/dex/dexTree";
import * as DexTree from "@/store/dex/dexTree";

const ROOT_LABEL = "BlckéDex";

function injestFlatList(rootNode, {label, items, status = DEX_STATUS.UNKNOWN, icon}) {
  const flatNode = newDexNode({ label, status, icon });
  DexTree.addChildNode(rootNode, flatNode);
  items.forEach((item) => {
    DexTree.addChildNode(flatNode, newDexNode({ ...item, idKey: "itemId", status }));
  });
}

function injestWeaponsCatalog(rootNode, catalog) {
  const weaponsNode = newDexNode({ label: "weapons", icon: iconWeaponCollections });
  DexTree.addChildNode(rootNode, weaponsNode);

  catalog.sets.forEach(({items, ...set}) => {
    const collectionNode = newDexNode({ ...set, idKey: "achievementId", icon: iconWeaponSet });
    DexTree.addChildNode(weaponsNode, collectionNode);

    items.forEach((item) => {
      const skinNode = newDexNode({ ...item, idKey: "skinId" });
      DexTree.addChildNode(collectionNode, skinNode);
    });
  });
}

const catalogsToInjest = [
  { label: "exclusives", items: exclusivesCatalog.items, icon: iconExclusives },
  { weaponsCatalog },
  { label: "glyphs", items: glyphsCatalog.items, icon: iconGlyphs },
  { label: "nodes", items: nodesCatalog.items, icon: iconNodes },
  { label: "tonics", items: tonicsCatalog.items, icon: iconTonics },
  { label: "contracts", items: template.superRare.items, status: DEX_STATUS.SEEN, icon: iconContracts },
];

function newDefaultDexTree() {
  const rootNode = newDexNode({ label: ROOT_LABEL });

  catalogsToInjest.forEach((x) => {
    if (x.weaponsCatalog) {
      injestWeaponsCatalog(rootNode, x.weaponsCatalog);
    } else {
      injestFlatList(rootNode, x);
    }
  });
  DexTree.sortTree(rootNode);
  return rootNode;
}


export { newDefaultDexTree, ROOT_LABEL };