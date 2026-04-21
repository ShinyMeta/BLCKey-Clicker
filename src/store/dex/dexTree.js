const DEX_STATUS = Object.freeze({
	UNKNOWN: "unknown",
	SEEN: "seen",
	COLLECTED: "collected",
});

function getUniqueId({label, itemId, skinId, achievementId} = {}) {
  if (achievementId) return `achievementId:${achievementId}`;
  if (skinId) return `skinId:${skinId}`;
  if (itemId) return `itemId:${itemId}`;
  return label;
}

function getIdKey({itemId, skinId, achievementId} = {}) {
  if (achievementId) return "achievementId";
  if (skinId) return "skinId";
  if (itemId) return "itemId";
  return null;
}


function newDexNode({ label, idKey, idValue, status, childNodes, icon, ...rest }) {
  const thisNode = {}
  thisNode.label = label;
  thisNode.idKey = idKey ?? getIdKey(rest);
  thisNode.idValue = idValue ?? (thisNode.idKey ? rest[thisNode.idKey] : null);
  thisNode.status = status ?? DEX_STATUS.UNKNOWN;
  thisNode.childNodes = childNodes ?? [];
  thisNode.icon = icon ?? null;
  if (thisNode.idKey) {
    thisNode[thisNode.idKey] = thisNode.idValue;
  }
  return thisNode;
}

function addChildNode(parentNode, childNode) {
  parentNode.childNodes.push(childNode);
}

function forEachNode(thisNode, callback, leavesFirst = true) {
  if (leavesFirst) {
    thisNode.childNodes.forEach((child) => forEachNode(child, callback, leavesFirst));
    callback(thisNode);
  } else {
    callback(thisNode);
    thisNode.childNodes.forEach((child) => forEachNode(child, callback, leavesFirst));
  }
}

function forEachLeaf(thisNode, callback) {
  const childNodes = thisNode.childNodes;
  if (childNodes.length === 0) {
    callback(thisNode);
  } else {
    childNodes.forEach((child) => forEachLeaf(child, callback));
  }
}

function sortTree(thisNode) {
  forEachNode(thisNode, (node) => {
    const childNodes = node.childNodes;
    if (childNodes.length < 2) {
      return;
    }

    const canSortById = childNodes.every((child) => Number.isFinite(child?.idValue));
    if (!canSortById) {
      return;
    }

    childNodes.sort((a, b) => a.idValue - b.idValue);
  });
}

function patchTree(newTree, existingTree) {
  const newTreeIndex = new Map();
  forEachNode(newTree, (node) => {
    newTreeIndex.set(getUniqueId(node), node);
  });
  forEachNode(existingTree, (node) => {
    const uniqueId = getUniqueId(node);
    const nodeFromNewTree = newTreeIndex.get(uniqueId);
    if (nodeFromNewTree) {
      nodeFromNewTree.status = node.status;
    }
  });
  return newTree;
}

export  {
  DEX_STATUS,
  getUniqueId,
  newDexNode,
  addChildNode,
  forEachNode,
  forEachLeaf,
  sortTree,
  patchTree,
}