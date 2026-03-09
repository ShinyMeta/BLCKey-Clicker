<template>
  <div>
    <v-tabs v-model="activeVendorTab" bg-color="primary">
      <v-tab value="keys">Keys</v-tab>
      <v-tab value="statuettes">Statuettes</v-tab>
      <v-tab value="gems">Gemstore</v-tab>
      <v-tab value="achievements">Achievements</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeVendorTab">
      <v-tabs-window-item value="keys"> keys </v-tabs-window-item>
      <v-tabs-window-item value="statuettes"> Statuettes </v-tabs-window-item>
      <v-tabs-window-item value="gems"> Gemstore </v-tabs-window-item>
      <v-tabs-window-item value="achievements">
        Achievements
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup>
import { ref } from "vue";

const activeVendorTab = ref("keys");
</script>
<style></style>
