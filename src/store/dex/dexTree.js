export const DEX_STATUS = Object.freeze({
	UNKNOWN: "unknown",
	SEEN: "seen",
	COLLECTED: "collected",
});

export class DexTree {
  //DexTree holds the root node and the map index, with methods for stuff
  constructor(root) {
    this.root = root ?? newDexNode({ label: "root", status: DEX_STATUS.UNKNOWN });
    this.root.uniqueId = "root";
    this.treeIndex = new Map();
    forEachNode(this.root, (node) => {
      this.treeIndex.set(node.uniqueId, node);
    });
  }

  addNode(parentUniqueId, { label, idKey, idValue, status, ...rest }) {
    let uniqueId;
    let _idValue = idValue ?? rest[idKey];
    if (_idValue === undefined) {
      uniqueId = label;
    } else {
      uniqueId = `${idKey}:${_idValue}`;
    }

    const parentNode = this.getNode(parentUniqueId);
    const existingNode = this.getNode(uniqueId);
    if (!parentNode || existingNode) { 
      return;
    }

    const newNode = newDexNode({ label, idKey, idValue: _idValue, status });
    newNode.uniqueId = uniqueId;
    parentNode.entries.push(newNode);
    this.treeIndex.set(newNode.uniqueId, newNode);
  }

  getNode(uniqueId) {
    return this.treeIndex.get(uniqueId);
  }

  markSeen(uniqueId) {
    const node = this.getNode(uniqueId);
    if (node && node.status === DEX_STATUS.UNKNOWN) {
      node.status = DEX_STATUS.SEEN;
    }
  }

  markCollected(uniqueId) {
    const node = this.getNode(uniqueId);  
    if (node && node.status !== DEX_STATUS.COLLECTED) {
      node.status = DEX_STATUS.COLLECTED;
    }
  }

  sort() {
    forEachNode(this.root, (node) => {
      node.entries.sort((a, b) => a.idValue - b.idValue || 
        a.label.localeCompare(b.label));
    });
  }

  forEachNode(node = this.root, callback) {
    forEachNode(node, callback);
  }

  forEachLeaf(node = this.root, callback) {
    forEachLeaf(node, callback);
  }

  rawTreeObject() {
    return this.root;
  }

}



function newDexNode({ label, idKey, idValue, status, entries }) {
  const thisNode = {}
  thisNode.label = label;
  thisNode.idKey = idKey;
  thisNode.idValue = idValue;
  thisNode.status = status ?? DEX_STATUS.UNKNOWN;
  thisNode.entries = entries ?? [];
  if (idKey) {
    thisNode[idKey] = idValue;
  }
  return thisNode;
}

function forEachNode(thisNode, callback) {
  callback(thisNode);
  thisNode.entries.forEach((child) => forEachNode(child, callback));
}

function forEachLeaf(thisNode, callback) {
  if (thisNode.entries.length === 0) {
    callback(thisNode);
  } else {
    thisNode.entries.forEach((child) => forEachLeaf(child, callback));
  }
}
