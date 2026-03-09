<template>
  <div class="open-chest-panel">
    <OpenChestButton ref="chestButton" @click="handleChestClick" />
    <LootRow ref="lootRow" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import noRewardImg from "@/assets/noRewardItem.png";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";

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

const chestButton = ref(null);
const lootRow = ref(null);
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

.open-chest-panel :deep(.loot-row) {
  width: 100%;
  min-width: var(--loot-row-min-width);
}
</style>
