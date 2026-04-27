import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

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

  function reset(storageKey) {
    const saveEntry = storageByStorageKey.get(storageKey);
    if (!saveEntry) {
      return false;
    }

    saveEntry.storageRef.value = resolveDefaultValue(saveEntry.config);
    return true;
  }

  function useSaveCategory(categoryKey) {
    const categoryStorageKeys = ensureCategory(categoryKey);

    function useSaveCategoryStorage(propertyKey, options) {
      const storageKey = `${categoryKey}.${propertyKey}`;
      categoryStorageKeys.add(storageKey);
      return useSaveStorage(storageKey, options);
    }

    function resetCategory() {
      for (const storageKey of categoryStorageKeys) {
        reset(storageKey);
      }
    }

    return {
      useSaveCategoryStorage,
      resetCategory,
    };
  }

  return {
    useSaveCategory,
  };
});