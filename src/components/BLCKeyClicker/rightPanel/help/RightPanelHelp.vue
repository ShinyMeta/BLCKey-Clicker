<template>
  <v-list nav density="compact">
    <v-list-item 
      prepend-icon="mdi-school" 
      title="Tutorial / How to play" 
      @click="openTutorial = true"
    />
    <v-list-item
      prepend-icon="fa:fab fa-discord"
      title="Discord Server"
      href="https://discord.gg/DAj7xMEVRc"
      target="_blank"
      rel="noopener"
    />
    <v-list-item
      prepend-icon="mdi-github"
      title="GitHub"
      href="https://github.com/ShinyMeta/GW2-BLC-Simulator"
      target="_blank"
      rel="noopener"
    />

  </v-list>
    
  <v-dialog v-model="openTutorial" max-width="800">
    <Tutorial />
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import Tutorial from "./BLCKeyClickerTutorial.vue";


const openTutorial = ref(false);
</script>

<style scoped>

</style>