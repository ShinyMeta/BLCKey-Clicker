<template>
  <v-overlay v-model="timer.isPaused" contained persistent class="align-center justify-center">
    <v-card class="d-flex flex-column align-center ga-4 pa-4">
      <span>Timer Paused</span>
      <v-btn @click="timer.togglePause" color="primary">Unpause</v-btn>
    </v-card>
  </v-overlay>
</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";

const timer = useTimerStore();
</script>