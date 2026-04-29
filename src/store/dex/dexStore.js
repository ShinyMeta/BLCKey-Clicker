import { defineStore } from "pinia";
import { computed } from "vue";
import { useSaveManager } from "@/store/saveManager";
import { newDefaultDexTree } from "@/store/dex/defaultDexTree";
import { DexTreeReactiveIndex } from "@/store/dex/dexTreeReactiveIndex";
import { DEX_STATUS } from "@/store/dex/dexTree";
import * as DexTree from "@/store/dex/dexTree";

const CHEST_SET_KEYS = Object.freeze([
	"newExclusive",
	"returningExclusive",
	"glyphs",
	"nodes",
	"tonic",
]);

const WEAPON_SET_KEYS = Object.freeze([
  "uncommonWeapons",
  "rareWeapons"
]);

const DEFAULT_DEX_TREE = newDefaultDexTree();

export const useDexStore = defineStore("dex", () => {
	const saveManager = useSaveManager();
	const dexSaveCategory = saveManager.useSaveCategory("dex");

	// load from storage
	const dexTree = dexSaveCategory.useSaveCategoryStorage("dexTree", {
		defaultValue: DEFAULT_DEX_TREE,
		resetType: saveManager.resetTypes.SOFT,
		reset: () => {
			resetProgress();
		},
	});
  // merge/patch with a fresh default tree to ensure new entries are added
  dexTree.value = DexTree.patchTree(newDefaultDexTree(), dexTree.value);
  // sort for ordering in the UI
  DexTree.sortTree(dexTree.value);
  // establish reactive status totals and stuff
  const dexTreeReactiveIndex = new DexTreeReactiveIndex(dexTree);

  const getDexTreeReactiveIndex = computed(() => dexTreeReactiveIndex);

	const seenExclusiveItemIds = computed(() => {
    const result = new Set();
		dexTreeReactiveIndex.getNode({ label: "exclusives" })?.childNodes
			.filter((entry) => entry.status !== DEX_STATUS.UNKNOWN)
      .forEach(({itemId}) => result.add(itemId));
    return result;
  });

  function getUniqueId(nodeLike) {
    return DexTree.getUniqueId(nodeLike);
  }

  function markSeenFromChestConfig(chestConfig) {
		const sets = chestConfig?.sets;
		if (!sets) {
			return false;
		}

		for (const setKey of CHEST_SET_KEYS) {
			for (const item of sets[setKey]?.items ?? []) {
				markSeen(item);
			}
		}

		for (const weaponSetKey of WEAPON_SET_KEYS) {
      markSeen(sets[weaponSetKey]);
		}
  }

	function markSeen(nodeLike) {
		return dexTreeReactiveIndex.markSeen(nodeLike);
	}

	function markCollected(nodeLike) {
		return dexTreeReactiveIndex.markCollected(nodeLike);
	}

	function hasCollected(nodeLike) {
    const node = dexTreeReactiveIndex.getNode(nodeLike);
    return node?.status === DEX_STATUS.COLLECTED;
	}

	function resetProgress() {
		dexTreeReactiveIndex.resetProgress(newDefaultDexTree());
	}

	return {
    dexTree,
    getDexTreeReactiveIndex,
		seenExclusiveItemIds,
		markSeenFromChestConfig,
		markCollected,
		hasCollected,
		resetProgress,
	};
});
