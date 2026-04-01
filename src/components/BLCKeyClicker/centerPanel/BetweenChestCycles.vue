<template>
  <div class="d-flex flex-column align-center ma-4">
    <div class="between-chest-cycles d-flex flex-column ga-4">
      <StatsDisplay />
      <BLCKeyDexExclusives />
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
import { useTimerStore } from "@/store/timerStore";
import { emitSoundEvent } from "@/services/sound";
import { useLootStore } from "@/store/loot/lootStore";
import BLCKeyDexExclusives from "./BLCKeyDexExclusives.vue";

const timer = useTimerStore();
const lootStore = useLootStore();

function beginChestCycle() {
  lootStore.generateCurrentChestConfig();
  timer.reset();
  emitSoundEvent('timerStart');
}



</script>

<style scoped>
.between-chest-cycles {
  max-width: 500px;
}
</style>