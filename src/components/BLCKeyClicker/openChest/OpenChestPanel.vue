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
        <ChestPreviewButton />
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
import noRewardImg from "@/assets/noRewardItem.png";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import ChestPreviewButton from "@/components/BLCKeyClicker/openChest/ChestPreviewButton.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";

const props = defineProps({
  lootSources: {
    type: Array,
    default: () => Array(5).fill(noRewardImg),
  },
  lootRevealDelayMs: {
    type: Number,
    default: 600,
  },
});

const saveStore = useBLCKeyClickerSaveStore();
const { inventory } = storeToRefs(saveStore);
const chestButton = ref(null);
const lootRow = ref(null);
const selectedKeyType = ref("blcKeys");
const selectedKeyCount = computed(
  () => inventory.value[selectedKeyType.value] ?? 0
);
let lootRevealTimeoutId = null;

function clearTimers() {
  if (lootRevealTimeoutId !== null) {
    window.clearTimeout(lootRevealTimeoutId);
    lootRevealTimeoutId = null;
  }
}

function handleChestClick() {
  clearTimers();
  lootRow.value?.reset();

  lootRevealTimeoutId = window.setTimeout(() => {
    lootRow.value?.displayLoot(props.lootSources);
    lootRevealTimeoutId = null;
  }, props.lootRevealDelayMs);
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
