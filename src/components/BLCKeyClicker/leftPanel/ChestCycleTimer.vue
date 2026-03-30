<template>
  <div class="timer-display">
    <v-chip color="primary" text-color="white" outlined>
      {{ timer.formatted }}
    </v-chip>
  </div>

</template>

<script setup>
import { useTimerStore } from "@/store/timerStore";

const timer = useTimerStore();


</script>

