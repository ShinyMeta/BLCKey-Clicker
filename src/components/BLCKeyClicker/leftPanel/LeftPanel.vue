<template>
  <div class="left-panel pa-4 d-flex flex-column ga-3">
  
    <v-divider class="timer-label">Patch Day Countdown</v-divider>
    <ChestCycleTimer />
    <v-divider class="current-chest-label">Current Chest Details</v-divider>
    <ChestPreviewCard />
      
  </div>
</template>

<script setup>
import ChestPreviewCard from "@/components/BLCKeyClicker/shared/ChestPreviewCard.vue";
import ChestCycleTimer from "./ChestCycleTimer.vue";



</script>

<style scoped>  

</style>