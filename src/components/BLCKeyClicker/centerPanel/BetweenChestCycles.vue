<template>
  <div class="between-chest-cycles d-flex flex-column align-center ga-4">
    <v-btn
      prepend-icon="mdi-play"
      color="primary"
      variant="tonal"
      @click="beginChestCycle"
    >
      Begin Chest Cycle
    </v-btn>

  </div>
</template>


<script setup>
import { useTimerStore } from "@/store/timerStore";
import { emitSoundEvent } from "@/services/sound";
import { useLootStore } from "@/store/loot/lootStore";

const timer = useTimerStore();
const lootStore = useLootStore();

function beginChestCycle() {
  lootStore.generateCurrentChestConfig();
  timer.reset();
  emitSoundEvent('timerStart');
}



</script>

<style scoped>
</style>