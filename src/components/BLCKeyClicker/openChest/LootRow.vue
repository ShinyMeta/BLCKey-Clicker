<template>
  <div class="loot-row">
    <div v-for="index in slotIndices" :key="index" class="loot-slot-container" :class="{
      'loot-slot-container--extra': index >= BASE_SLOT_COUNT,
      'loot-slot-container--show':
        index >= BASE_SLOT_COUNT &&
        index < lootItems.length,
    }">
      <div class="loot-placeholder">
        <ItemImage :item="getPlaceholderItem(index)" :size="64" rounded="0" :tooltip="false" :text-overlay="false"
          class="loot-item-image" />
      </div>

      <div class="loot-overlay" :class="{ revealed: showLoot && lootItems[index] != null }"
        :style="{ '--fly-delay': `${computeFlyDelay(index, lootItems.length)}ms` }">
        <div class="loot-overlay__content" :class="{ fading: isFading }">
          <ItemImage v-if="lootItems[index]" :ref="(el) => setLootImageRef(index, el)" :item="lootItems[index]"
            :size="64" rounded="0" text-overlay-style="shadow" text-overlay-position="bottom-center"
            class="loot-item-image" />
        </div>
      </div>
    </div>

    <!-- PASSIVE variant moved to HistoryLootRow.vue -->
  </div>
</template>

<script setup>
import ItemImage from "@/components/BLCKeyClicker/ItemImage.vue";
import { emitSoundEvent } from "@/services/sound";
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useLootStore } from "@/store/loot/lootStore";
import statuetteImg from "@/assets/item/statuette.png";
import d6PlaceholderImg from "@/assets/BLCOpenUI/d6PlaceHolder.png";

const BASE_SLOT_COUNT = 4;
const LOOT_BASE_DELAY_MS = 350;
const LOOT_FADE_DELAY_MS = 2500;
const FADE_DURATION_MS = 600;
const LOOT_SOUND_DELAY_MS = 50;
const FLY_OUT_ANIM_MS = 350;

const SHINE_COLORS = {
  uncommon: "#33CC11",
  rare: "#FFDD22",
  exclusive: "#FFAA00",
  superRare: "#9933FF",
};

const props = defineProps({
  maxDrops: {
    type: Number,
    default: 5,
  },
});

const slotIndices = computed(() =>
  Array.from({ length: props.maxDrops }, (_, i) => i),
);

const lootStore = useLootStore();
const { currentChestConfig } = storeToRefs(lootStore);

const lootItems = ref([]);
const showLoot = ref(false);
const isFading = ref(false);


const guaranteedItem = computed(() =>
  currentChestConfig.value?.sets?.guaranteedItem?.items?.[0] ?? null,
);

function getPlaceholderItem(index) {
  if (index === 0) {
    return { name: "Black Lion Statuette", icon: statuetteImg };
  }
  if (index === 1 && guaranteedItem.value) {
    return guaranteedItem.value;
  }
  return { name: "Random Drop", icon: d6PlaceholderImg };
}

const lootImageRefs = {};
function setLootImageRef(index, el) {
  if (el) {
    lootImageRefs[index] = el;
  } else {
    delete lootImageRefs[index];
  }
}

function computeFlyDelay(index, totalItems) {
  if (totalItems <= BASE_SLOT_COUNT) {
    return index * 150;
  }
  if (index < BASE_SLOT_COUNT) {
    return index * 100;
  }
  return (BASE_SLOT_COUNT - 1) * 100 + 400 + (index - BASE_SLOT_COUNT) * 150;
}

let fadeTimeoutId = null;
let clearTimeoutId = null;
let flyoutCompleteTimeoutId = null;
let shineTimeoutIds = [];
let lootFallTimeoutIds = [];
let currentDisplayId = 0;

function clearTimers() {
  if (fadeTimeoutId !== null) {
    window.clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }
  if (clearTimeoutId !== null) {
    window.clearTimeout(clearTimeoutId);
    clearTimeoutId = null;
  }
  if (flyoutCompleteTimeoutId !== null) {
    window.clearTimeout(flyoutCompleteTimeoutId);
    flyoutCompleteTimeoutId = null;
  }
  shineTimeoutIds.forEach((id) => window.clearTimeout(id));
  shineTimeoutIds = [];
  lootFallTimeoutIds.forEach((id) => window.clearTimeout(id));
  lootFallTimeoutIds = [];
}

function reset() {
  clearTimers();
  currentDisplayId++;
  showLoot.value = false;
  isFading.value = false;
  lootItems.value = [];
}

async function preloadImages(items) {
  await Promise.all(
    items.map((item) => {
      if (!item?.icon) return;
      const img = new Image();
      img.src = item.icon;
      return img.decode().catch(() => { });
    }),
  );
}

async function displayLoot(items = [], { onFadeStart, onFlyoutComplete } = {}) {
  clearTimers();
  isFading.value = false;
  showLoot.value = false;
  const thisDisplayId = ++currentDisplayId;

  // Overlap the LOOT_BASE_DELAY_MS animation hold with image preloading so the
  // total wait is max(preload, LOOT_BASE_DELAY_MS) 
  await Promise.all([
    preloadImages(items),
    new Promise((r) => setTimeout(r, LOOT_BASE_DELAY_MS)),
  ]);
  if (thisDisplayId !== currentDisplayId) return;

  lootItems.value = [...items];

  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  );
  if (thisDisplayId !== currentDisplayId) return;

  showLoot.value = true;

  items.forEach((_, index) => {
    const settleMs = computeFlyDelay(index, items.length) + LOOT_SOUND_DELAY_MS;
    const id = window.setTimeout(() => {
      if (thisDisplayId !== currentDisplayId) return;
      emitSoundEvent("chestLootFall");
    }, settleMs);
    lootFallTimeoutIds.push(id);
  });

  for (let i = BASE_SLOT_COUNT; i < items.length; i++) {
    const shineMs = computeFlyDelay(i, items.length);
    const color = SHINE_COLORS[items[i]?.category] ?? "white";
    const id = window.setTimeout(() => {
      if (thisDisplayId !== currentDisplayId) return;
      lootImageRefs[i]?.shine?.(color);
    }, shineMs);
    shineTimeoutIds.push(id);
  }

  const lastDelay =
    items.length > 0 ? computeFlyDelay(items.length - 1, items.length) : 0;
  const totalFlyInMs = lastDelay;

  if (onFlyoutComplete) {
    flyoutCompleteTimeoutId = window.setTimeout(() => {
      flyoutCompleteTimeoutId = null;
      if (thisDisplayId !== currentDisplayId) return;
      onFlyoutComplete();
    }, totalFlyInMs + FLY_OUT_ANIM_MS);
  }

  fadeTimeoutId = window.setTimeout(() => {
    fadeTimeoutId = null;
    onFadeStart?.();
    isFading.value = true;

    clearTimeoutId = window.setTimeout(() => {
      clearTimeoutId = null;
      showLoot.value = false;
      isFading.value = false;
      lootItems.value = [];
    }, FADE_DURATION_MS);
  }, totalFlyInMs + LOOT_FADE_DELAY_MS);

}

defineExpose({ displayLoot, reset });

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped>
.loot-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  min-height: 68px;
  user-select: none;
}

.loot-slot-container {
  position: relative;
  width: 64px;
  height: 64px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.2);
  box-sizing: content-box;
  flex-shrink: 0;
}

.loot-slot-container--extra {
  width: 0;
  border-width: 0;
  border-color: rgba(var(--v-theme-on-surface), 0.5);
  margin-left: -8px;
  opacity: 0;
  transition:
    width 0.35s cubic-bezier(.08, .71, .36, 1),
    border-width 0.35s cubic-bezier(.08, .71, .36, 1),
    margin-left 0.35s cubic-bezier(.08, .71, .36, 1),
    opacity 0.35s ease-out;
}

.loot-slot-container--extra.loot-slot-container--show {
  width: 64px;
  border-width: 2px;
  margin-left: 0;
  opacity: 1;
}

.loot-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.34;
  filter: grayscale(1) brightness(0.65);
}

.loot-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-100px) scale(0.3);
}

.loot-overlay.revealed {
  animation: fly-out 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  animation-delay: var(--fly-delay);
}

.loot-overlay__content {
  transition: opacity var(--fade-duration, 0.6s) ease-out;
}

.loot-overlay__content.fading {
  opacity: 0;
}

/* --- Passive variant moved to HistoryLootRow.vue --- */

.loot-item-image {
  display: block;
}

@keyframes fly-out {
  0% {
    opacity: 0;
    transform: translateY(-100px) scale(0.3);
  }

  60% {
    opacity: 1;
    transform: translateY(2px) scale(1.02);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
