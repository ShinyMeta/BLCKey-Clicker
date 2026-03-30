<template>
  <div class="between-chest-cycles d-flex flex-column align-center ga-4">
    
    <v-btn
      v-if="timer.isTimeUp"
      prepend-icon="mdi-play"
      color="primary"
      variant="tonal"
      @click="beginChestCycle"
    >
      Begin Chest Cycle
    </v-btn>

    <v-card-title>{{ resultStrings.title }}</v-card-title>
    <v-card-text>
      <div>{{ resultStrings.text }}</div>
    </v-card-text>
  </div>
</template>


<script setup>
import { computed, } from "vue";
import { useTimerStore } from "@/store/timerStore";
import { useLootStore } from "@/store/loot/lootStore";
import { storeToRefs } from "pinia";

const lootStore = useLootStore();
const timer = useTimerStore();

function beginChestCycle() {
  lootStore.generateCurrentChestConfig();
  timer.reset();
}

const resultStrings = computed(() => {
  return didYouWin.value ? 
    { title: 'You Win!', text: 'Both exclusives dropped.' } 
  : { title: 'Game Over', text: 'Not all exclusives dropped.' };
});

const didYouWin = computed(() => {
  const loot = useLootStore();
  const { currentChestConfig } = storeToRefs(loot);
  if (!currentChestConfig) return false;

  const exclusives = loot.currentExclusives || [];
  if (exclusives.length === 0) return false;

  const allDropped = exclusives.every((it) => loot.hasExclusiveDropped(it.itemId));
  return allDropped ? true : false;
});

</script>