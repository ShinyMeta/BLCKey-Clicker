<template>
  <v-card>
    <v-card-title>Tutorial / How to play</v-card-title>
    <v-divider />
    <v-card-text class="tutorial-text">
      <p>
        In BLCKey Clicker, you are a Guild Wars 2 player that is compelled to 
        collect every single Black Lion Chest Exclusive.
      </p>
      <p>
        To open the chest, you need keys. Click the "Map Comp" button <span class="important-text">{{ mapCompClicksToComp }}</span> times 
        to complete a map. This has a <span class="important-text">{{ formattedKeyDropChance }}</span> chance to reward a key. After earning 
        some keys, click the chest to open it and receive your loot!
      </p>
      <p>
        Each chest only lasts <span class="important-text">{{ formattedTimePerCycle }}</span>, so hurry to unlock the exclusives before 
        they rotate out on patch day!
      </p>
      <span class="text-h6">Controls / Keybinds:</span>
      <v-divider class="my-2" />
      <p>Clicking the timer or pressing <kbd>Esc</kbd> will pause the game.</p>
      <p>
        Hold <kbd>Ctrl</kbd> while right-clicking either key to toggle "auto-attack". 
        When auto-attack is turned on, the chest will automatically consume the selected 
        key until both exclusives are unlocked.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useMapCompStore } from '@/store/mapCompStore';
import { useTimerStore } from '@/store/timerStore';
import { storeToRefs } from 'pinia';


const mapCompStore = useMapCompStore();
const timerStore = useTimerStore();

const { mapCompClicksToComp, mapCompKeyDropChance } = storeToRefs(mapCompStore);
const formattedKeyDropChance = computed(() => {
  return `${Math.round(mapCompKeyDropChance.value * 100)}%`;
});

const { START_MS } = timerStore.getDefaults;
const formattedTimePerCycle = computed(() => {
  const minutes = Math.floor(START_MS / 60000);
  const seconds = Math.floor((START_MS % 60000) / 1000);
  return `${minutes} minutes` + (seconds ? ` ${seconds} seconds` : '');
})  
</script>

<style scoped>
.tutorial-text {
  max-height:60vh; 
  overflow:auto;
}

.tutorial-text p:not(:last-child) {
  margin-bottom: 1em;
}

kbd {
  color: rgb(var(--v-theme-primary));
}

.important-text {
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

</style>