<template>
  <v-dialog max-width="1000">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps">
        <v-icon icon="mdi-cog" size="large" start />
        Chest Config
      </v-btn>
    </template>

    <template v-slot:default="{}">
      <chest-config></chest-config>
    </template>
  </v-dialog>
</template>
<script setup>
import ChestConfig from "@/components/BLCSimulator/ChestConfig.vue";
</script>
<style></style>
