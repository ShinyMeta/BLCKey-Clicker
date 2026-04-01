<template>
  <v-app-bar>
    <div>
      <RouterLink to="/BLCKeyClicker">
        <v-img src="@/assets/item/BLChest.png" min-width="64"
      /></RouterLink>
    </div>
    <v-app-bar-title>
      <span> Black Lion Chest Simulator</span>
    </v-app-bar-title>
  </v-app-bar>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>
