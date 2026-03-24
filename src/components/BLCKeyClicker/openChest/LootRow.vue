<template>
  <div class="loot-row">
    <!-- ACTIVE variant: persistent placeholder slots with loot overlays -->
    <template v-if="isActive">
      <div
        v-for="index in slotIndices"
        v-show="index < BASE_SLOT_COUNT || index < lootItems.length"
        :key="index"
        class="loot-slot-container"
        :class="{ 'loot-slot-container--extra': index >= BASE_SLOT_COUNT }"
      >
        <div class="loot-placeholder">
          <ItemImage
            :item="getPlaceholderItem(index)"
            :size="64"
            rounded="0"
            :tooltip="false"
            :text-overlay="false"
            class="loot-item-image"
          />
        </div>

        <div
          class="loot-overlay"
          :class="{ revealed: showLoot && lootItems[index] != null }"
          :style="{ '--fly-delay': `${computeFlyDelay(index, lootItems.length)}ms` }"
        >
          <div class="loot-overlay__content" :class="{ fading: isFading }">
            <ItemImage
              v-if="lootItems[index]"
              :ref="(el) => setLootImageRef(index, el)"
              :item="lootItems[index]"
              :size="64"
              rounded="0"
              text-overlay-style="shadow"
              text-overlay-position="bottom-center"
              class="loot-item-image"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- PASSIVE variant: immediate display, no animations or placeholders -->
    <template v-else>
      <div
        v-for="(item, index) in lootItems"
        :key="index"
        class="loot-slot loot-slot--passive"
      >
        <ItemImage
          :item="item"
          :size="64"
          rounded="0"
          text-overlay-style="shadow"
          text-overlay-position="bottom-center"
          class="loot-item-image"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import ItemImage from "@/components/BLCKeyClicker/ItemImage.vue";
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useLootStore } from "@/store/loot/lootStore";
import statuetteImg from "@/assets/item/statuette.png";
import d6PlaceholderImg from "@/assets/BLCOpenUI/d6PlaceHolder.png";

const BASE_SLOT_COUNT = 4;
const LOOT_DISPLAY_MS = 2500;
const FADE_DURATION_MS = 600;

const props = defineProps({
  variant: {
    type: String,
    default: "active",
    validator: (v) => ["active", "passive"].includes(v),
  },
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

const isActive = computed(() => props.variant === "active");

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
let shineTimeoutIds = [];
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
  shineTimeoutIds.forEach((id) => window.clearTimeout(id));
  shineTimeoutIds = [];
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
      return img.decode().catch(() => {});
    }),
  );
}

async function displayLoot(items = []) {
  clearTimers();
  isFading.value = false;
  showLoot.value = false;
  const thisDisplayId = ++currentDisplayId;

  if (isActive.value) {
    await preloadImages(items);
    if (thisDisplayId !== currentDisplayId) return;

    lootItems.value = [...items];

    // Double-rAF: the browser paints one frame without the `revealed` class,
    // guaranteeing that re-adding it restarts every fly-out animation.
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    if (thisDisplayId !== currentDisplayId) return;

    showLoot.value = true;

    for (let i = BASE_SLOT_COUNT; i < items.length; i++) {
      const settleMs = computeFlyDelay(i, items.length) + 550;
      const id = window.setTimeout(() => {
        if (thisDisplayId !== currentDisplayId) return;
        lootImageRefs[i]?.shine?.();
      }, settleMs);
      shineTimeoutIds.push(id);
    }

    const lastDelay =
      items.length > 0 ? computeFlyDelay(items.length - 1, items.length) : 0;
    const totalFlyInMs = lastDelay + 550;

    fadeTimeoutId = window.setTimeout(() => {
      fadeTimeoutId = null;
      isFading.value = true;

      clearTimeoutId = window.setTimeout(() => {
        clearTimeoutId = null;
        showLoot.value = false;
        isFading.value = false;
        lootItems.value = [];
      }, FADE_DURATION_MS);
    }, totalFlyInMs + LOOT_DISPLAY_MS);
  } else {
    lootItems.value = [...items];
    showLoot.value = true;
  }
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
}

/* --- Active variant: slot containers with placeholder + overlay --- */

.loot-slot-container {
  position: relative;
  width: 64px;
  height: 64px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.2);
  box-sizing: content-box;
  flex-shrink: 0;
}

.loot-slot-container--extra {
  border-color: rgba(var(--v-theme-on-surface), 0.5);
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
  transform: translateY(-120px) scale(0);
}

.loot-overlay.revealed {
  animation: fly-out 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--fly-delay);
}

.loot-overlay__content {
  transition: opacity var(--fade-duration, 0.6s) ease-out;
}

.loot-overlay__content.fading {
  opacity: 0;
}

/* --- Passive variant: static display --- */

.loot-slot--passive {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loot-item-image {
  display: block;
}

@keyframes fly-out {
  0% {
    opacity: 0;
    transform: translateY(-120px) scale(0);
  }
  35% {
    opacity: 1;
    transform: translateY(-15px) scale(1.12);
  }
  65% {
    transform: translateY(6px) scale(0.96);
  }
  85% {
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
