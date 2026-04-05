const fs = require("fs");

function readExistingCatalog(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.warn(`\n⚠ Could not parse existing file at ${filePath}; continuing with fetched data only.`);
    console.warn(error);
    return {};
  }
}

// a bit inefficient, it adds fetched first, then appends existing that werent't fetched
// this ensures that existing is never overwritten, but means you have to check existing twice.
function mergeItemsByNumericKey(existingItems, fetchedItems, key) {
  const existingById = new Map();
  const existingList = Array.isArray(existingItems) ? existingItems : [];
  for (const item of existingList) {
    const id = Number(item?.[key]);
    if (Number.isFinite(id)) {
      existingById.set(id, { ...item, [key]: id });
    }
  }

  const fetchedIds = new Set();
  const mergedFetched = [];
  const fetchedList = Array.isArray(fetchedItems) ? fetchedItems : [];
  for (const item of fetchedList) {
    const id = Number(item?.[key]);
    if (!Number.isFinite(id) || fetchedIds.has(id)) {
      continue;
    }

    fetchedIds.add(id);
    mergedFetched.push({
      ...(existingById.get(id) ?? {}),
      ...item,
      [key]: id,
    });
  }

  const preservedExisting = [];
  for (const [id, item] of existingById.entries()) {
    if (!fetchedIds.has(id)) {
      preservedExisting.push(item);
    }
  }

  return [...mergedFetched, ...preservedExisting];
}

module.exports = {
  readExistingCatalog,
  mergeItemsByNumericKey,
};