import { defineStore } from "pinia";
import { computed } from "vue";
import { useStorage } from "@vueuse/core";
import { DEFAULT_DEX_TREE } from "@/store/dex/defaultDexTree";
import { DEX_STATUS, DexTree } from "@/store/dex/dexTree";

const DEX_STORAGE_KEY = "dex.dexTree";

const CHEST_SET_KEYS = Object.freeze([
	"newExclusive",
	"returningExclusive",
	"glyphs",
	"nodes",
	"tonic",
]);

const WEAPON_SET_KEYS = Object.freeze(["uncommonWeapons", "rareWeapons"]);

export const useDexStore = defineStore("dex", () => {
	const dexTree = useStorage(DEX_STORAGE_KEY, DEFAULT_DEX_TREE, localStorage, {
    serializer: {
      read: (value) => {
        return value ? new DexTree(JSON.parse(value)) : null ;
      },
      write: (value) => {
        return JSON.stringify(value?.rawTreeObject() ?? null);
      },
    },
  });

  function getUniqueId({label, itemId, skinId, achievementId}) {
    if (achievementId) return `achievementId:${achievementId}`;
    if (skinId) return `skinId:${skinId}`;
    if (itemId) return `itemId:${itemId}`;
    return label;
  }

  function markSeenFromChestConfig(chestConfig) {
		const sets = chestConfig?.sets;
		if (!sets) {
			return false;
		}

		for (const setKey of CHEST_SET_KEYS) {
			for (const item of sets[setKey]?.items ?? []) {
        const uniqueId = getUniqueId(item);
				dexTree.value.markSeen(uniqueId);
			}
		}

		for (const weaponSetKey of WEAPON_SET_KEYS) {
			const uniqueId = getUniqueId(sets[weaponSetKey]);
      const weaponSetNode = dexTree.value.getNode(uniqueId);
      dexTree.value.forEachNode(weaponSetNode, (node)=> {
        dexTree.value.markSeen(node.uniqueId);
      });
		}
  }

	function markSeen(itemLike) {
		return dexTree.value.markSeen(getUniqueId(itemLike));
	}

	function markCollected(itemLike) {
		return dexTree.value.markCollected(getUniqueId(itemLike));
	}

	function hasCollected(itemLike) {
    const node = dexTree.value.getNode(getUniqueId(itemLike));
    return node?.status === DEX_STATUS.COLLECTED;
	}

	const seenExclusiveItemIds = computed(() => {
    const result = new Set();
		dexTree.value.getNode("exclusives")?.childNodes
			.filter((entry) => entry.status !== DEX_STATUS.UNKNOWN)
      .forEach(({itemId}) => result.add(itemId));
    return result;
  });

	function resetProgress() {
		dexTree.value = DEFAULT_DEX_TREE;
	}

	return {
    dexTree,
		seenExclusiveItemIds,
		markSeenFromChestConfig,
		markCollected,
		hasCollected,
		resetProgress,
	};
});
