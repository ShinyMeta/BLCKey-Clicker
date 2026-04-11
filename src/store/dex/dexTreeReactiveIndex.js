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
      const reactiveNodeReference = {
        node,
        // uniqueId: computed(() => getUniqueId(node)),
        statusTotals: computed(this.statusTotalFactory(node)),
      }
      this.treeIndex.set(uniqueId, reactiveNodeReference);
    });
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

  sort() {
    this.forEachNode(this.dexTreeRef.value, (node) => {
      node.childNodes.sort((a, b) => a.idValue - b.idValue || 
        a.label.localeCompare(b.label));
    });
  }

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

