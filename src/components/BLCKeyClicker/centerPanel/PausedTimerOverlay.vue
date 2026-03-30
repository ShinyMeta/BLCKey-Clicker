<template>
  <v-overlay v-model="timer.isPaused" contained persistent class="align-center justify-center">
    <v-card class="d-flex flex-column align-center text-h5 ga-4 pa-4" elevation="5">
      <span>Game Paused</span>
      <v-btn @click="timer.togglePause" color="primary" variant="tonal" size="x-large">Unpause</v-btn>
    </v-card>
  </v-overlay>
</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";

const timer = useTimerStore();
</script>