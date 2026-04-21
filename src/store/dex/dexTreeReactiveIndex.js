import { DEX_STATUS, getUniqueId } from "@/store/dex/dexTree";
import * as DexTree from "@/store/dex/dexTree";
import { computed } from "vue";




export class DexTreeReactiveIndex {
  constructor(dexTreeRef) {
    this.dexTreeRef = dexTreeRef;
    this.treeIndex = new Map();
    this.buildIndex();
  }
  
  statusTotalFactory(node) {
    return () => {
      const totals = {
        [DEX_STATUS.UNKNOWN]: 0,
        [DEX_STATUS.SEEN]: 0,
        [DEX_STATUS.COLLECTED]: 0,
      };
      if (node.childNodes.length === 0) {
        totals[node.status] = 1;
      } else {
        node.childNodes.forEach((child) => {
          const childUniqueId = getUniqueId(child);
          const childReactiveReference = this.treeIndex.get(childUniqueId);
          if (childReactiveReference) {
            const childTotals = childReactiveReference.statusTotals.value;
            totals[DEX_STATUS.UNKNOWN] += childTotals[DEX_STATUS.UNKNOWN];
            totals[DEX_STATUS.SEEN] += childTotals[DEX_STATUS.SEEN];
            totals[DEX_STATUS.COLLECTED] += childTotals[DEX_STATUS.COLLECTED];
          }
        });
      }
      return totals
    }
  }

  buildIndex() {
    this.treeIndex.clear();
    this.forEachNode(this.dexTreeRef.value, (node) => {
      const uniqueId = getUniqueId(node)
      const statusTotals = computed(this.statusTotalFactory(node));
      const reactiveNodeReference = {
        node,
        uniqueId: computed(() => getUniqueId(node)),
        statusTotals,
        isLeaf: computed(() => (node.childNodes?.length ?? 0) === 0),
        isUnknown: computed(() => node.status === DEX_STATUS.UNKNOWN),
        isCollected: computed(() => node.status === DEX_STATUS.COLLECTED),
        collectedCount: computed(() => statusTotals.value[DEX_STATUS.COLLECTED] ?? 0),
        seenOnlyCount: computed(() => statusTotals.value[DEX_STATUS.SEEN] ?? 0),
        unknownCount: computed(() => statusTotals.value[DEX_STATUS.UNKNOWN] ?? 0),
        seenCount: computed(() =>
          (statusTotals.value[DEX_STATUS.COLLECTED] ?? 0) + (statusTotals.value[DEX_STATUS.SEEN] ?? 0)
        ),
        totalCount: computed(() => {
          const t = statusTotals.value;
          return (t[DEX_STATUS.COLLECTED] ?? 0) + (t[DEX_STATUS.SEEN] ?? 0) + (t[DEX_STATUS.UNKNOWN] ?? 0);
        }),
        reactiveChildNodes: computed(() =>
          node.childNodes.map((child) => this.treeIndex.get(getUniqueId(child))).filter(Boolean)
        ),
        dexNumber: 0,
      }
      this.treeIndex.set(uniqueId, reactiveNodeReference);
    });

    this.assignDexNumbers();
  }

  assignDexNumbers() {
    this.forEachNode(this.dexTreeRef.value, (node) => {
      node.childNodes.forEach((child, index) => {
        const childRef = this.treeIndex.get(getUniqueId(child));
        if (childRef) {
          childRef.dexNumber = index + 1;
        }
      });
    }, false);
  }

  getNode(nodeLike) {
    const reactiveNode = this.getReactiveNode(nodeLike);
    return reactiveNode?.node;
  }

  getReactiveNode(nodeLike) {
    const uniqueId = getUniqueId(nodeLike);
    if (!uniqueId) return;
    return this.treeIndex.get(uniqueId);
  }

  markSeen(nodeLike) {
    const reactiveNode = this.getReactiveNode(nodeLike);
    this.forEachNode(reactiveNode?.node, (node) => {
      if (node.status === DEX_STATUS.UNKNOWN) {
        node.status = DEX_STATUS.SEEN;
      }
    });
  }

  markCollected(nodeLike) {
    const reactiveNode = this.getReactiveNode(nodeLike);
    this.forEachNode(reactiveNode?.node, (node) => {
      if (node.status !== DEX_STATUS.COLLECTED) {
        node.status = DEX_STATUS.COLLECTED;
      }
    });
  }

  // sort() {
  //   this.forEachNode(this.dexTreeRef.value, (node) => {
  //     const childNodes = node.childNodes;
  //     if (childNodes.length < 2) {
  //       return;
  //     }

  //     const canSortById = childNodes.every((child) => Number.isFinite(child?.idValue));
  //     if (!canSortById) {
  //       return;
  //     }

  //     childNodes.sort((a, b) => a.idValue - b.idValue);
  //   });
  //   this.assignDexNumbers();
  // }

  forEachNode(node, callback, leavesFirst = true) {
    if (!node) return;
    DexTree.forEachNode(node, callback, leavesFirst);
  }

  forEachLeaf(node, callback) {
    if (!node) return;
    DexTree.forEachLeaf(node, callback);
  }

  resetProgress(newTree) {
    //clear index, change tree, then rebuild index
    this.treeIndex.clear();
    this.dexTreeRef.value = newTree;
    this.buildIndex();
  }

}

