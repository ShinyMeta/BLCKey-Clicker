<template>
  <div class="d-flex flex-column align-center ma-4">
    <div class="between-chest-cycles d-flex flex-column ga-4">
      <StatsDisplay />
      <!-- <BLCKeyDexExclusives /> -->
      <v-btn
        prepend-icon="mdi-play"
        color="primary"
        variant="tonal"
        @click="beginChestCycle"
      >
        Start Next Chest Cycle
      </v-btn>
    </div>
  </div>
</template>


<script setup>
import StatsDisplay from "./StatsDisplay.vue";
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";
// import BLCKeyDexExclusives from "./BLCKeyDexExclusives.vue";

const controller = useBLCKeyClickerController();

function beginChestCycle() {
  controller.startChestCycle("betweenChestCycles");
}



</script>

<style scoped>
.between-chest-cycles {
  max-width: 500px;
}
</style>