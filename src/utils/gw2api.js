import client from "gw2api-client";
import cacheMemory from "gw2api-client/src/cache/memory";

let api = client();
api.autoBatch();
api.cacheStorage(cacheMemory());

export async function fetchItemMetadata(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return [];
  try {
    return await api.items().many(itemIds);
  } catch (error) {
    console.error("Failed to load item metadata", error);
    return [];
  }
}

export async function fetchSkinMetadata(skinIds) {
  if (!Array.isArray(skinIds) || skinIds.length === 0) return [];
  try {
    return await api.skins().many(skinIds);
  } catch (error) {
    console.error("Failed to load skin metadata", error);
    return [];
  }
}

export async function fetchItemLikeMetadata(items = []) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const itemIds = new Set();
  const skinIds = new Set();

  for (const item of items) {
    if (item?.skinId != null) skinIds.add(item.skinId);
    else if (item?.itemId != null) itemIds.add(item.itemId);
    else if (item?.id != null) itemIds.add(item.id);
  }

  const [itemResults, skinResults] = await Promise.all([
    fetchItemMetadata([...itemIds]),
    fetchSkinMetadata([...skinIds]),
  ]);

  const itemLookup = Object.fromEntries(itemResults.map((r) => [r.id, r]));
  const skinLookup = Object.fromEntries(skinResults.map((r) => [r.id, r]));

  return items.map((item) => {
    if (item?.skinId != null) return skinLookup[item.skinId] ?? null;
    if (item?.itemId != null) return itemLookup[item.itemId] ?? null;
    if (item?.id != null) return itemLookup[item.id] ?? null;
    return null;
  });
}

export default api;
