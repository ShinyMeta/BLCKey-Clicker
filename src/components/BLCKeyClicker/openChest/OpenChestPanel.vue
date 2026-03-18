<template>
  <div class="open-chest-panel">
    <div class="chest-controls" role="radiogroup" aria-label="Selected chest key">
      <button
        type="button"
        class="key-select-btn"
        :class="{
          selected: selectedKeyType === 'blcKeys',
          empty: inventory.blcKeys === 0,
        }"
        role="radio"
        :aria-checked="selectedKeyType === 'blcKeys'"
        @click="selectedKeyType = 'blcKeys'"
      >
        <img :src="blcKeyImg" alt="" class="key-select-image" />
        <span class="key-select-count">{{ inventory.blcKeys }}</span>
      </button>
      <div class="center-controls">
        <OpenChestButton
          ref="chestButton"
          :disabled="selectedKeyCount === 0"
          @click="handleChestClick"
        />
        <ChestPreviewDialog :chest-config="currentChestConfig">
          <template #activator="activatorProps">
            <v-btn
              v-bind="activatorProps"
              variant="tonal"
              color="primary"
              :disabled="!currentChestConfig"
            >
              <v-icon icon="mdi-eye" start />
              Chest Preview
            </v-btn>
          </template>
        </ChestPreviewDialog>
      </div>
      <button
        type="button"
        class="key-select-btn"
        :class="{
          selected: selectedKeyType === 'goldenKeys',
          empty: inventory.goldenKeys === 0,
        }"
        role="radio"
        :aria-checked="selectedKeyType === 'goldenKeys'"
        @click="selectedKeyType = 'goldenKeys'"
      >
        <img :src="goldenBlcKeyImg" alt="" class="key-select-image" />
        <span class="key-select-count">{{ inventory.goldenKeys }}</span>
      </button>
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
import api from "@/utils/gw2api";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import ChestPreviewDialog from "@/components/BLCKeyClicker/openChest/ChestPreviewDialog.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";
import { useLootStore } from "@/store/loot/lootStore";

const props = defineProps({
  lootRevealDelayMs: {
    type: Number,
    default: 600,
  },
});

const saveStore = useBLCKeyClickerSaveStore();
const lootStore = useLootStore();
const { inventory } = storeToRefs(saveStore);
const { currentChestConfig } = storeToRefs(lootStore);
const chestButton = ref(null);
const lootRow = ref(null);
const selectedKeyType = ref("blcKeys");
const selectedKeyCount = computed(
  () => inventory.value[selectedKeyType.value] ?? 0
);
let lootRevealTimeoutId = null;
let openSequenceId = 0;

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

  const drops = lootStore.open();
  const iconsPromise = resolveDropIcons(drops);
  const thisSequence = ++openSequenceId;

  lootRevealTimeoutId = window.setTimeout(async () => {
    lootRevealTimeoutId = null;
    const icons = await iconsPromise;
    if (thisSequence !== openSequenceId) return;
    lootRow.value?.displayLoot(icons);
  }, props.lootRevealDelayMs);
}

async function resolveDropIcons(drops) {
  const itemIds = [];
  const skinIds = [];

  for (const drop of drops) {
    if (drop.skinId != null) skinIds.push(drop.skinId);
    else if (drop.itemId != null) itemIds.push(drop.itemId);
  }

  try {
    const [items, skins] = await Promise.all([
      itemIds.length ? api.items().many(itemIds) : [],
      skinIds.length ? api.skins().many(skinIds) : [],
    ]);

    const iconById = {};
    for (const entry of items) iconById[`items:${entry.id}`] = entry.icon;
    for (const entry of skins) iconById[`skins:${entry.id}`] = entry.icon;

    return drops.map((drop) => {
      if (drop.skinId != null) return iconById[`skins:${drop.skinId}`] ?? unknownItem;
      if (drop.itemId != null) return iconById[`items:${drop.itemId}`] ?? unknownItem;
      return unknownItem;
    });
  } catch (error) {
    console.error("Failed to fetch drop icons", error);
    return drops.map(() => unknownItem);
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

.center-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.key-select-btn {
  all: unset;
  box-sizing: border-box;
  width: 88px;
  min-height: 132px;
  padding: 10px 8px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 18px;
  background: rgba(var(--v-theme-surface), 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease;
}

.key-select-btn:hover {
  transform: translateY(-2px);
}

.key-select-btn.selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 16px rgba(var(--v-theme-primary), 0.28);
}

.key-select-btn.empty {
  opacity: 0.7;
}

.key-select-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.key-select-count {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
}

.open-chest-panel :deep(.loot-row) {
  width: 100%;
  min-width: var(--loot-row-min-width);
}
</style>
