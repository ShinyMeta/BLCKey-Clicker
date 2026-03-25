<template>
  <div class="open-chest-panel">
    <div class="chest-controls">
      <div class="chest-controls__side chest-controls__side--left">
        <v-btn-toggle
          model-value="chest"
          mandatory
          class="item-toggle"
        >
          <v-btn value="chest" class="item-select-btn">
            <div class="item-select-content">
              <ItemImage
                :item="{ name: 'Black Lion Chest', icon: blcChestImg }"
                :size="52"
                :tooltip="false"
                :text-overlay="false"
                class="item-select-image"
              />
            </div>
          </v-btn>
        </v-btn-toggle>
      </div>

      <OpenChestButton
        ref="chestButton"
        :disabled="selectedKeyCount === 0"
        @click="handleChestClick"
      />

      <div class="chest-controls__side chest-controls__side--right">
        <v-btn-toggle
          v-model="selectedKeyType"
          mandatory
          class="item-toggle"
        >
          <v-btn
            v-for="(key, index) in keyTypes"
            :key="key.value"
            :value="key.value"
            class="item-select-btn"
            :class="{ empty: inventory[key.value] === 0 }"
          >
            <div class="item-select-content">
              <ItemImage
                :item="{
                  name: key.name,
                  icon: key.icon,
                  quantity: inventory[key.value],
                }"
                :size="52"
                :tooltip="false"
                :text-overlay="String(inventory[key.value])"
                text-overlay-style="shadow"
                :text-overlay-position="keyTextOverlayPosition(index)"
                class="item-select-image"
              />
            </div>
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>
    <LootRow ref="lootRow" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import blcChestImg from "@/assets/item/BLChest.png";
import blcKeyImg from "@/assets/item/BLCKey.png";
import goldenBlcKeyImg from "@/assets/item/goldenBLCKey.png";
import unknownItem from "@/assets/item/unknown.png";
import ItemImage from "@/components/BLCKeyClicker/ItemImage.vue";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";
import { useInventoryStore } from "@/store/inventoryStore";
import { fetchItemLikeMetadata } from "@/utils/gw2api";

const props = defineProps({
  lootRevealDelayMs: {
    type: Number,
    default: 600,
  },
});

const controller = useBLCKeyClickerController();
const inventoryStore = useInventoryStore();
const { inventory } = storeToRefs(inventoryStore);
const chestButton = ref(null);
const lootRow = ref(null);
const keyTypes = [
  { value: "blcKey", name: "Black Lion Chest Key", icon: blcKeyImg },
  { value: "goldenKey", name: "Golden Black Lion Chest Key", icon: goldenBlcKeyImg },
];
const selectedKeyType = ref("blcKey");
const selectedKeyCount = computed(
  () => inventory.value[selectedKeyType.value] ?? 0
);
let lootRevealTimeoutId = null;
let openSequenceId = 0;

function keyTextOverlayPosition(index)  {
  if (index === 0) return "bottom-right";
  if (index === keyTypes.length - 1) return "bottom-left";
  return "bottom-center";
}

function clearTimers() {
  if (lootRevealTimeoutId !== null) {
    window.clearTimeout(lootRevealTimeoutId);
    lootRevealTimeoutId = null;
  }
}

function handleChestClick() {
  clearTimers();
  lootRow.value?.reset();

  const drops = controller.openChest(selectedKeyType.value);
  if (!drops) {
    return;
  }
  const displayLootPromise = resolveDisplayLoot(drops);
  const thisSequence = ++openSequenceId;

  lootRevealTimeoutId = window.setTimeout(async () => {
    lootRevealTimeoutId = null;
    const displayLoot = await displayLootPromise;
    if (thisSequence !== openSequenceId) return;
    lootRow.value?.displayLoot(displayLoot, {
      onFadeStart: () => chestButton.value?.close(),
    });
  }, props.lootRevealDelayMs);
}

async function resolveDisplayLoot(drops) {
  try {
    const metadata = await fetchItemLikeMetadata(drops);
    return drops.map((drop, index) => ({
      ...drop,
      name: metadata[index]?.name ?? drop.label,
      icon: metadata[index]?.icon ?? unknownItem,
    }));
  } catch (error) {
    console.error("Failed to fetch drop metadata", error);
    return drops.map((drop) => ({
      ...drop,
      name: drop.label,
      icon: unknownItem,
    }));
  }
}

function reset() {
  clearTimers();
  chestButton.value?.reset();
  lootRow.value?.reset();
}

defineExpose({ reset });

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped>
.open-chest-panel {
  --loot-row-min-width: calc((68px * 5) + (8px * 4));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: var(--loot-row-min-width);
}

.chest-controls {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.chest-controls__side--left {
  justify-self: end;
}

.chest-controls__side--right {
  justify-self: start;
}

/* --- shared item toggle (chest & key groups) --- */

.item-toggle {
  height: auto !important;
}

.item-toggle :deep(.v-btn) {
  padding: 6px;
  height: auto !important;
  min-width: 0 !important;
  overflow: hidden;
}

.item-toggle :deep(.v-btn:first-child),
.item-toggle :deep(.v-btn:first-child .item-image__img) {
  border-radius: 50% 0 0 50%;
}

.item-toggle :deep(.v-btn:last-child),
.item-toggle :deep(.v-btn:last-child .item-image__img) {
  border-radius: 0 50% 50% 0;
}

.item-toggle :deep(.v-btn:only-child),
.item-toggle :deep(.v-btn:only-child .item-image__img) {
  border-radius: 50%;
}

.item-toggle :deep(.v-avatar) {
  background: none;
}

.item-toggle :deep(.v-btn.empty) {
  opacity: 0.7;
}

.item-select-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.open-chest-panel :deep(.item-select-image .item-image__img) {
  object-fit: contain;
}

.open-chest-panel :deep(.loot-row) {
  width: 100%;
  min-width: var(--loot-row-min-width);
}
</style>
