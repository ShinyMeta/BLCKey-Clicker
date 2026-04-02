<template>
  <div class="left-panel pa-4 d-flex flex-column ga-3">
  
    <v-divider class="timer-label">Patch Day Countdown</v-divider>
    <ChestCycleTimer />
    <v-divider class="current-chest-label"  v-if="currentChestConfig">{{ chestLabel }}</v-divider>
    <ChestPreviewCard v-show="currentChestConfig" :chest-config="currentChestConfig" />
      
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
const { currentChestConfig } = storeToRefs(lootStore);

const chestLabel = computed(() => {
  return controller.isActiveChestCycle ?
    "Current Chest Details" 
  : "Previous Chest Details";
});

</script>

<style scoped>  

</style>