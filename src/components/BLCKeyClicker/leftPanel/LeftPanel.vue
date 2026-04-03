<template>
  <div class="left-panel pa-4 d-flex flex-column ga-3">
    <v-divider class="timer-label">
      Patch Day Countdown
    </v-divider>
    <ChestCycleTimer />

    <template
      v-for="card in previewCards"
      :key="card.key"
    >
      <v-divider :class="card.labelClass">
        {{ card.label }}
      </v-divider>
      <ChestPreviewCard :chest-config="card.config" />
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import ChestPreviewCard from "@/components/BLCKeyClicker/shared/ChestPreviewCard.vue";
import ChestCycleTimer from "./ChestCycleTimer.vue";
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";
import { useLootStore } from "@/store/loot/lootStore";

const controller = useBLCKeyClickerController();
const lootStore = useLootStore();
const { currentChestConfig, nextChestConfig } = storeToRefs(lootStore);

function getPreviewCardKey(config) {
  if (!config) return "";
  return config.__previewKey ?? `${config.name ?? "Black Lion Chest"}:${config.appearanceType ?? 0}`;
}

const chestLabel = computed(() => {
  return controller.isActiveChestCycle ?
    "Current Chest Details" 
  : "Previous Chest Details";
});

const previewCards = computed(() => {
  const cards = [];

  if (currentChestConfig.value) {
    cards.push({
      key: getPreviewCardKey(currentChestConfig.value),
      labelClass: "current-chest-label",
      label: chestLabel.value,
      config: currentChestConfig.value,
    });
  }

  if (controller.isBetweenChestCycles && nextChestConfig.value) {
    cards.push({
      key: getPreviewCardKey(nextChestConfig.value),
      labelClass: "next-chest-label",
      label: "Next Chest Details",
      config: nextChestConfig.value,
    });
  }

  return cards;
});

</script>

<style scoped>  

</style>