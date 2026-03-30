<template>
  <div class="left-panel pa-4 d-flex flex-column ga-3">
  
    <v-divider class="timer-label">Patch Day Countdown</v-divider>
    <ChestCycleTimer />
    <v-divider class="current-chest-label">Current Chest Details</v-divider>
    <ChestPreviewCard v-if="currentChestConfig" :chest-config="currentChestConfig" />
      
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import ChestPreviewCard from "@/components/BLCKeyClicker/shared/ChestPreviewCard.vue";
import ChestCycleTimer from "./ChestCycleTimer.vue";
import { useLootStore } from "@/store/loot/lootStore";

const lootStore = useLootStore();
const { currentChestConfig } = storeToRefs(lootStore);


</script>

<style scoped>  

</style>