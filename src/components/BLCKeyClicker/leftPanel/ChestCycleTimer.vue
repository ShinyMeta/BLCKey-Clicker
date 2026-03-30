<template>
  <div class="chest-cycle-timer d-flex align-center ga-2 justify-center">
    <v-btn :icon="pauseButtonIcon" @click="timer.togglePause" color="primary"/>
    <v-chip color="primary" text-color="white" outlined>
      {{ timer.formatted }}
    </v-chip>
  </div>

</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";
import { computed } from "vue";

const timer = useTimerStore();

const pauseButtonIcon = computed(() => timer.isPaused ? 'mdi-play' : 'mdi-pause');
</script>

<style scoped>

</style>