<template>
  <div class="open-chest-panel">
    <div class="chest-controls">
      <ChestPreviewCard />

      <OpenChestButton
        ref="chestButton"
        :disabled="selectedKeyCount === 0"
        @click="handleChestClick"
      />

      <v-btn-toggle
        v-model="selectedKeyType"
        mandatory
        class="key-toggle"
      >
        <v-btn
          v-for="(key, index) in keyTypes"
          :key="key.value"
          :value="key.value"
          class="key-select-btn"
          :class="{ empty: inventory[key.value] === 0 }"
        >
          <div class="key-select-content">
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
              class="key-select-image"
            />
          </div>
        </v-btn>
      </v-btn-toggle>
    </div>
    <LootRow ref="lootRow" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import blcKeyImg from "@/assets/item/BLCKey.png";
import goldenBlcKeyImg from "@/assets/item/goldenBLCKey.png";
import unknownItem from "@/assets/item/unknown.png";
import ItemImage from "@/components/BLCKeyClicker/ItemImage.vue";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import ChestPreviewCard from "@/components/BLCKeyClicker/openChest/ChestPreviewCard.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";
import { useLootStore } from "@/store/loot/lootStore";
import { fetchItemLikeMetadata } from "@/utils/gw2api";

const props = defineProps({
  lootRevealDelayMs: {
    type: Number,
    default: 600,
  },
});

const saveStore = useBLCKeyClickerSaveStore();
const lootStore = useLootStore();
const { inventory } = storeToRefs(saveStore);
const chestButton = ref(null);
const lootRow = ref(null);
const keyTypes = [
  { value: "blcKeys", name: "Black Lion Chest Key", icon: blcKeyImg },
  { value: "goldenKeys", name: "Golden Black Lion Chest Key", icon: goldenBlcKeyImg },
];
const selectedKeyType = ref("blcKeys");
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

  inventory.value[selectedKeyType.value] -= 1;

  const drops = lootStore.open(selectedKeyType.value);
  const displayLootPromise = resolveDisplayLoot(drops);
  const thisSequence = ++openSequenceId;

  lootRevealTimeoutId = window.setTimeout(async () => {
    lootRevealTimeoutId = null;
    const displayLoot = await displayLootPromise;
    if (thisSequence !== openSequenceId) return;
    lootRow.value?.displayLoot(displayLoot);
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
  --loot-row-min-width: calc((64px * 5) + (8px * 4));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: var(--loot-row-min-width);
}

.chest-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

/* --- key toggle --- */

.key-toggle {
  height: auto !important;
}

.key-toggle :deep(.v-btn) {
  padding: 6px;
  height: auto !important;
  min-width: 0 !important;
  overflow: hidden;
}

.key-toggle :deep(.v-btn:first-child),
.key-toggle :deep(.v-btn:first-child .item-image__img) {
  border-radius: 50% 0 0 50%;
}

.key-toggle :deep(.v-btn:last-child),
.key-toggle :deep(.v-btn:last-child .item-image__img) {
  border-radius: 0 50% 50% 0;
}

.key-toggle :deep(.v-avatar) {
  background: none;
}

.key-toggle :deep(.v-btn.empty) {
  opacity: 0.7;
}

.key-select-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.open-chest-panel :deep(.key-select-image .item-image__img) {
  object-fit: contain;
}

.open-chest-panel :deep(.loot-row) {
  width: 100%;
  min-width: var(--loot-row-min-width);
}
</style>
