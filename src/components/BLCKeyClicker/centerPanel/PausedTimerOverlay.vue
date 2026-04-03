<template>
  <v-overlay
    :model-value="controller.isPaused"
    contained
    persistent
    class="align-center justify-center"
  >
    <v-card
      class="d-flex flex-column align-center text-h5 ga-4 pa-4"
      elevation="5"
    >
      <span>Game Paused</span>
      <v-btn
        color="primary"
        variant="tonal"
        size="x-large"
        @click="controller.togglePause"
      >
        Unpause
      </v-btn>
    </v-card>
  </v-overlay>
</template>

<script setup>
import { useBLCKeyClickerController } from "@/store/BLCKeyClickerController";

const controller = useBLCKeyClickerController();
</script>