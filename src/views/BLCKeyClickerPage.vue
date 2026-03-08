<template>
  <v-container>
    <v-row>
      <v-col class="d-flex justify-center">
        <MapCompButton />
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
</script>
<style></style>
