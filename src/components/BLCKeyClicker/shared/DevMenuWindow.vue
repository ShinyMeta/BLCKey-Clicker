<template>
  <div
    v-if="isDevMenuEnabled"
    ref="windowEl"
    class="dev-menu-window"
    :style="windowStyle"
  >
    <v-card
      class="dev-menu-window__card d-flex flex-column overflow-hidden"
      border
      rounded="lg"
    >
      <v-card-title
        class="dev-menu-window__titlebar d-flex align-center justify-space-between ga-2 px-3 py-2"
        @pointerdown="startDrag"
      >
        <span class="text-uppercase text-caption font-weight-bold">Dev Menu</span>
        <div class="d-inline-flex align-center ga-1 flex-shrink-0">
          <v-btn
            icon
            variant="text"
            density="compact"
            size="x-small"
            :aria-label="isCollapsed ? 'Expand dev menu' : 'Collapse dev menu'"
            @click.stop="toggleCollapsed"
          >
            <v-icon size="16">
              {{ isCollapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
            </v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-expand-transition>
        <div
          v-if="!isCollapsed"
          class="dev-menu-window__body d-flex flex-column flex-grow-1"
        >
          <v-list
            density="compact"
            class="bg-transparent overflow-y-auto pa-2"
          >
            <v-list-item
              v-for="(action) in actions"
              :key="action.label"
              @click="action.run"
            >
              {{ action.label }}
            </v-list-item>
          </v-list>

          <v-card-text class="pt-0 pb-3 text-caption text-medium-emphasis">
            window.blcDevMenu.enable()
          </v-card-text>

          <div
            class="dev-menu-window__resize-handle"
            role="separator"
            aria-label="Resize dev menu"
            @pointerdown.stop="startResize"
          />
        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useStorage } from "@vueuse/core";
import { useInventoryStore } from "@/store/inventoryStore";
import { useTimerStore } from "@/store/timerStore";
import { useDexStore } from "@/store/dex/dexStore";
import { useLootStore } from "@/store/loot/lootStore";
import { useDevMenuController } from "@/services/dev/devMenuController";

const STORAGE_KEY = "blc.devMenu.windowState";
const EDGE_PADDING = 8;
const TITLE_BAR_HEIGHT = 44;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 180;

const DEFAULT_WINDOW_STATE = {
  x: 16,
  y: 84,
  width: 320,
  height: 260,
  collapsed: false,
};

const inventoryStore = useInventoryStore();
const timerStore = useTimerStore();
const dexStore = useDexStore();
const lootStore = useLootStore();
const { isDevMenuEnabled } = useDevMenuController();

const persistedWindowState = useStorage(
  STORAGE_KEY,
  { ...DEFAULT_WINDOW_STATE },
  undefined,
  { mergeDefaults: true },
);

const windowEl = ref(null);
const positionX = ref(asFiniteNumber(persistedWindowState.value.x, DEFAULT_WINDOW_STATE.x));
const positionY = ref(asFiniteNumber(persistedWindowState.value.y, DEFAULT_WINDOW_STATE.y));
const windowWidth = ref(asFiniteNumber(persistedWindowState.value.width, DEFAULT_WINDOW_STATE.width));
const windowHeight = ref(asFiniteNumber(persistedWindowState.value.height, DEFAULT_WINDOW_STATE.height));
const isCollapsed = ref(asBoolean(persistedWindowState.value.collapsed, DEFAULT_WINDOW_STATE.collapsed));

const windowStyle = computed(() => {
  const style = {
    left: `${positionX.value}px`,
    top: `${positionY.value}px`,
    width: `${windowWidth.value}px`,
  };

  if (!isCollapsed.value) {
    style.height = `${windowHeight.value}px`;
  }

  return style;
});

const dragState = {
  active: false,
  pointerId: null,
  offsetX: 0,
  offsetY: 0,
};

const resizeState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
};

const actions = [
  {
    label: "+999 blcKey",
    run: () => inventoryStore.adjustInventory("blcKey", 999),
  },
  {
    label: "+999 goldenKey",
    run: () => inventoryStore.adjustInventory("goldenKey", 999),
  },
  {
    label: "Set timer to 0",
    run: () => timerStore.stop(),
  },
  {
    label: "Unlock both Exclusives",
    run: () => unlockBothExclusives(),
  },
];

function unlockBothExclusives() {
  const sets = lootStore.currentChestConfig?.sets;
  if (!sets) {
    return;
  }

  for (const setKey of ["newExclusive", "returningExclusive"]) {
    const entry = sets[setKey]?.items?.[0];
    if (!entry) {
      continue;
    }

    dexStore.markCollected(entry);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function asFiniteNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function asBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function persistWindowState() {
  persistedWindowState.value = {
    x: positionX.value,
    y: positionY.value,
    width: windowWidth.value,
    height: windowHeight.value,
    collapsed: isCollapsed.value,
  };
}

function getCurrentWindowHeightForBounds() {
  return isCollapsed.value ? TITLE_BAR_HEIGHT : windowHeight.value;
}

function applyViewportConstraints() {
  if (typeof window === "undefined") {
    return;
  }

  const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - EDGE_PADDING * 2);
  const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - EDGE_PADDING * 2);
  windowWidth.value = clamp(windowWidth.value, MIN_WIDTH, maxWidth);
  windowHeight.value = clamp(windowHeight.value, MIN_HEIGHT, maxHeight);

  const maxX = Math.max(EDGE_PADDING, window.innerWidth - windowWidth.value - EDGE_PADDING);
  const maxY = Math.max(
    EDGE_PADDING,
    window.innerHeight - getCurrentWindowHeightForBounds() - EDGE_PADDING,
  );

  positionX.value = clamp(positionX.value, EDGE_PADDING, maxX);
  positionY.value = clamp(positionY.value, EDGE_PADDING, maxY);
}

function getWindowRect() {
  const fallbackWidth = windowWidth.value;
  const fallbackHeight = getCurrentWindowHeightForBounds();
  const rect = windowEl.value?.getBoundingClientRect();

  return {
    left: rect?.left ?? positionX.value,
    top: rect?.top ?? positionY.value,
    width: rect?.width ?? fallbackWidth,
    height: rect?.height ?? fallbackHeight,
  };
}

function startDrag(event) {
  if (event.button !== 0) {
    return;
  }

  const targetIsControl = event.target instanceof Element && event.target.closest("button");
  if (targetIsControl) {
    return;
  }

  event.preventDefault();

  const rect = getWindowRect();
  dragState.active = true;
  dragState.pointerId = event.pointerId;
  dragState.offsetX = event.clientX - rect.left;
  dragState.offsetY = event.clientY - rect.top;

  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", stopDrag, { once: false });
  window.addEventListener("pointercancel", stopDrag, { once: false });
}

function onDragMove(event) {
  if (!dragState.active) {
    return;
  }

  if (dragState.pointerId !== null && event.pointerId !== dragState.pointerId) {
    return;
  }

  const rect = getWindowRect();
  const maxX = Math.max(EDGE_PADDING, window.innerWidth - rect.width - EDGE_PADDING);
  const maxY = Math.max(EDGE_PADDING, window.innerHeight - rect.height - EDGE_PADDING);

  positionX.value = clamp(event.clientX - dragState.offsetX, EDGE_PADDING, maxX);
  positionY.value = clamp(event.clientY - dragState.offsetY, EDGE_PADDING, maxY);
}

function stopDrag(event) {
  if (
    dragState.pointerId !== null &&
    event?.pointerId !== undefined &&
    event.pointerId !== dragState.pointerId
  ) {
    return;
  }

  dragState.active = false;
  dragState.pointerId = null;

  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", stopDrag);
  window.removeEventListener("pointercancel", stopDrag);

  persistWindowState();
}

function startResize(event) {
  if (event.button !== 0 || isCollapsed.value) {
    return;
  }

  event.preventDefault();

  resizeState.active = true;
  resizeState.pointerId = event.pointerId;
  resizeState.startX = event.clientX;
  resizeState.startY = event.clientY;
  resizeState.startWidth = windowWidth.value;
  resizeState.startHeight = windowHeight.value;

  window.addEventListener("pointermove", onResizeMove);
  window.addEventListener("pointerup", stopResize, { once: false });
  window.addEventListener("pointercancel", stopResize, { once: false });
}

function onResizeMove(event) {
  if (!resizeState.active) {
    return;
  }

  if (resizeState.pointerId !== null && event.pointerId !== resizeState.pointerId) {
    return;
  }

  const deltaX = event.clientX - resizeState.startX;
  const deltaY = event.clientY - resizeState.startY;

  const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - positionX.value - EDGE_PADDING);
  const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - positionY.value - EDGE_PADDING);

  windowWidth.value = clamp(resizeState.startWidth + deltaX, MIN_WIDTH, maxWidth);
  windowHeight.value = clamp(resizeState.startHeight + deltaY, MIN_HEIGHT, maxHeight);
}

function stopResize(event) {
  if (
    resizeState.pointerId !== null &&
    event?.pointerId !== undefined &&
    event.pointerId !== resizeState.pointerId
  ) {
    return;
  }

  resizeState.active = false;
  resizeState.pointerId = null;

  window.removeEventListener("pointermove", onResizeMove);
  window.removeEventListener("pointerup", stopResize);
  window.removeEventListener("pointercancel", stopResize);

  persistWindowState();
}

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value;
  applyViewportConstraints();
  persistWindowState();
}

function handleWindowResize() {
  applyViewportConstraints();
  persistWindowState();
}

onMounted(() => {
  applyViewportConstraints();
  persistWindowState();
  window.addEventListener("resize", handleWindowResize);
});

onBeforeUnmount(() => {
  stopDrag();
  stopResize();

  window.removeEventListener("resize", handleWindowResize);
});
</script>

<style scoped>
.dev-menu-window {
  position: fixed;
  z-index: 6000;
}

.dev-menu-window__card {
  width: 100%;
  height: 100%;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(4px);
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.45);
}

.dev-menu-window__titlebar {
  cursor: grab;
  user-select: none;
  border-bottom: 1px solid rgba(203, 213, 225, 0.22);
  background: linear-gradient(90deg, rgba(71, 85, 105, 0.75), rgba(30, 41, 59, 0.8));
}

.dev-menu-window__titlebar:active {
  cursor: grabbing;
}

.dev-menu-window__body {
  position: relative;
  min-height: 0;
}

.dev-menu-window__resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
}

.dev-menu-window__resize-handle::before {
  content: "";
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 9px;
  height: 9px;
  border-right: 2px solid rgba(226, 232, 240, 0.7);
  border-bottom: 2px solid rgba(226, 232, 240, 0.7);
  opacity: 0.9;
}
</style>