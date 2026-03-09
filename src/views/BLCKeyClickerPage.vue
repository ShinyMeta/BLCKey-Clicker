<template>
  <v-container>
    <v-row align="start" justify="center">
      <v-col cols="auto" class="d-flex justify-center">
        <MapCompButton />
      </v-col>
      <v-col cols="auto" class="d-flex justify-center">
        <LootChestButton />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <VendorTabs />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import VendorTabs from "@/components/BLCKeyClicker/VendorTabs.vue";
import MapCompButton from "@/components/BLCKeyClicker/MapCompButton.vue";
import LootChestButton from "@/components/BLCKeyClicker/LootChestButton.vue";
</script>
<style></style>
