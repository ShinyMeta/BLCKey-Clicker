import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";

const STORAGE_KEY = "blc.devMenu.enabled";
const isProdBuild = import.meta.env.PROD;

// Keep prod default disabled on every load, while still allowing runtime toggles.
const runtimeEnabled = ref(false);
const storedEnabled = useStorage(STORAGE_KEY, !isProdBuild);

const isDevMenuEnabled = computed({
  get() {
    return isProdBuild ? runtimeEnabled.value : Boolean(storedEnabled.value);
  },
  set(value) {
    const nextValue = Boolean(value);

    if (isProdBuild) {
      runtimeEnabled.value = nextValue;
      return;
    }

    storedEnabled.value = nextValue;
  },
});

function setDevMenuEnabled(value) {
  const nextValue = Boolean(value);
  isDevMenuEnabled.value = nextValue;
  return nextValue;
}

function enableDevMenu() {
  return setDevMenuEnabled(true);
}

function disableDevMenu() {
  return setDevMenuEnabled(false);
}

function toggleDevMenu() {
  return setDevMenuEnabled(!isDevMenuEnabled.value);
}

let isConsoleApiRegistered = false;

function registerDevMenuConsoleApi() {
  if (isConsoleApiRegistered || typeof window === "undefined") {
    return;
  }

  window.blcDevMenu = {
    enable: enableDevMenu,
    disable: disableDevMenu,
    toggle: toggleDevMenu,
    status: () => isDevMenuEnabled.value,
  };

  isConsoleApiRegistered = true;
}

registerDevMenuConsoleApi();

export function useDevMenuController() {
  return {
    isDevMenuEnabled,
    setDevMenuEnabled,
    enableDevMenu,
    disableDevMenu,
    toggleDevMenu,
  };
}