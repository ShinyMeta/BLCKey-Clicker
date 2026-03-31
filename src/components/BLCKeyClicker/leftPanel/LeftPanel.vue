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
import { useLootStore } from "@/store/loot/lootStore";
import { useTimerStore } from "@/store/timerStore";

const lootStore = useLootStore();
const timer = useTimerStore();
const { currentChestConfig } = storeToRefs(lootStore);

const chestLabel = computed(() => {
  return timer.isActiveChestCycle ?
    "Current Chest Details" 
  : "Previous Chest Details";
});

</script>

<style scoped>  

</style>