import client from "gw2api-client";
import cacheMemory from "gw2api-client/src/cache/memory";

let api = client();
api.cacheStorage(cacheMemory());

export async function fetchItemMetadata(itemId) {
  if (itemId == null) {
    return null;
  }

  try {
    return (await api.items().get(itemId)) ?? null;
  } catch (error) {
    console.error("Failed to load item metadata", error);
    return null;
  }
}

export async function fetchSkinMetadata(skinId) {
  if (skinId == null) {
    return null;
  }

  try {
    return (await api.skins().get(skinId)) ?? null;
  } catch (error) {
    console.error("Failed to load skin metadata", error);
    return null;
  }
}

export function fetchItemLikeMetadata(item = {}) {
  if (item?.skinId != null) {
    return fetchSkinMetadata(item.skinId);
  }

  if (item?.itemId != null) {
    return fetchItemMetadata(item.itemId);
  }

  if (item?.id != null) {
    return fetchItemMetadata(item.id);
  }

  return Promise.resolve(null);
}

export default api;
