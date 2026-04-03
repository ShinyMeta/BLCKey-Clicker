<template>
  <div class="new-game d-flex flex-column align-center ga-4 mt-8">
    <p class="text-h4">
      Welcome to BLCKey Clicker!
    </p>

    <p>
      If its your first time, 
      <v-btn
        density="comfortable"
        variant="tonal"
        @click="openTutorial = true"
      >
        click here
      </v-btn> 
      to view the tutorial. You can also find it later in the Help menu.
    </p>
    <p>I'll start you out with a few keys before your first chest. After that, you're on your own! </p>
    <v-btn
      prepend-icon="mdi-play"
      color="primary"
      variant="tonal"
      @click="beginChestCycle"
    >
      Start New Game
    </v-btn>
    
    <v-dialog
      v-model="openTutorial"
      max-width="800"
    >
      <Tutorial />
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Tutorial from "@/components/BLCKeyClicker/rightPanel/help/BLCKeyClickerTutorial.vue";
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";

const controller = useBLCKeyClickerController();

const openTutorial = ref(false);

function beginChestCycle() {
  controller.startChestCycle("newGame");
}
</script>