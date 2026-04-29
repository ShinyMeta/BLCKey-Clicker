import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

const SAVE_RESET_TYPES = Object.freeze({
  SOFT: "SOFT",
  HARD: "HARD",
  SETTINGS: "SETTINGS",
});

const VALID_RESET_TYPES = new Set(Object.values(SAVE_RESET_TYPES));

function normalizeResetType(resetType, fallback = SAVE_RESET_TYPES.SOFT) {
  if (typeof resetType !== "string") {
    return fallback;
  }

  const normalized = resetType.toUpperCase();
  return VALID_RESET_TYPES.has(normalized) ? normalized : fallback;
}

function shouldResetForType(entryResetType, requestedResetType) {
  switch (requestedResetType) {
    case SAVE_RESET_TYPES.SETTINGS:
      return entryResetType === SAVE_RESET_TYPES.SETTINGS;
    case SAVE_RESET_TYPES.HARD:
      return (
        entryResetType === SAVE_RESET_TYPES.HARD ||
        entryResetType === SAVE_RESET_TYPES.SOFT
      );
    case SAVE_RESET_TYPES.SOFT:
    default:
      return entryResetType === SAVE_RESET_TYPES.SOFT;
  }
}

function resolveDefaultValue(config) {
  const defaultValue = config.defaultValue;

  if (defaultValue != null && typeof defaultValue === "object") {
    return structuredClone(defaultValue);
  }

  return defaultValue;
}

function normalizeConfig(options = {}) {
  return {
    ...options,
    defaultValue: options?.defaultValue ?? null,
    storage: options?.storage,
    useStorageOptions: options?.useStorageOptions,
    resetType: normalizeResetType(options?.resetType),
    reset: typeof options?.reset === "function" ? options.reset : null,
  };
}

export const useSaveManager = defineStore("saveManager", () => {
  const storageByStorageKey = new Map();
  const storageKeysByCategoryKey = new Map();

  function ensureCategory(categoryKey) {
    if (!storageKeysByCategoryKey.has(categoryKey)) {
      storageKeysByCategoryKey.set(categoryKey, new Set());
    }

    return storageKeysByCategoryKey.get(categoryKey);
  }

  function useSaveStorage(storageKey, options) {
    if (!storageByStorageKey.has(storageKey)) {
      const config = normalizeConfig(options);
      const storageRef = useStorage(
        storageKey,
        resolveDefaultValue(config),
        config.storage,
        config.useStorageOptions,
      );

      storageByStorageKey.set(storageKey, {
        config,
        storageRef,
      });
    }

    return storageByStorageKey.get(storageKey).storageRef;
  }

  function reset(storageKey, resetType = SAVE_RESET_TYPES.SOFT) {
    const saveEntry = storageByStorageKey.get(storageKey);
    if (!saveEntry) {
      return false;
    }

    const normalizedResetType = normalizeResetType(resetType);
    if (!shouldResetForType(saveEntry.config.resetType, normalizedResetType)) {
      return false;
    }

    const defaultValue = resolveDefaultValue(saveEntry.config);
    if (typeof saveEntry.config.reset === "function") {
      saveEntry.config.reset({
        storageKey,
        resetType: normalizedResetType,
        storageRef: saveEntry.storageRef,
        defaultValue,
        config: saveEntry.config,
      });
      return true;
    }

    saveEntry.storageRef.value = defaultValue;
    return true;
  }

  function useSaveCategory(categoryKey) {
    const categoryStorageKeys = ensureCategory(categoryKey);

    function useSaveCategoryStorage(propertyKey, options) {
      const storageKey = `${categoryKey}.${propertyKey}`;
      categoryStorageKeys.add(storageKey);
      return useSaveStorage(storageKey, options);
    }

    function resetCategory(resetType = SAVE_RESET_TYPES.SOFT) {
      for (const storageKey of categoryStorageKeys) {
        reset(storageKey, resetType);
      }
    }

    return {
      useSaveCategoryStorage,
      resetCategory,
    };
  }

  function resetAllCategories(resetType = SAVE_RESET_TYPES.SOFT) {
    const normalizedResetType = normalizeResetType(resetType);
    let resetCount = 0;

    for (const categoryStorageKeys of storageKeysByCategoryKey.values()) {
      for (const storageKey of categoryStorageKeys) {
        if (reset(storageKey, normalizedResetType)) {
          resetCount += 1;
        }
      }
    }

    return resetCount;
  }

  return {
    useSaveCategory,
    resetAllCategories,
    resetTypes: SAVE_RESET_TYPES,
  };
});
