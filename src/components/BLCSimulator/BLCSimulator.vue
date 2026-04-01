<template>
  <v-container class="align-center text-center">
    <v-row>
      <v-col cols="12"><chest-display /></v-col>
      <v-col><chest-config-modal-button></chest-config-modal-button></v-col>
      <v-col cols="12">
        <ChestHistory></ChestHistory>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import ChestDisplay from "@/components/BLCSimulator/ChestDisplay.vue";
import ChestConfigModalButton from "@/components/BLCSimulator/ChestConfigModalButton.vue";
import ChestHistory from "./ChestHistory.vue";
</script>
