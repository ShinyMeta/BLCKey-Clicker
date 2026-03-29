<template>
  <v-card>
    <v-card-title>Tutorial / How to play</v-card-title>
    <v-divider />
    <v-card-text class="tutorial-text" >
      <p>In BLCKey Clicker, you are a Guild Wars 2 player that is compelled to collect every single Black Lion Chest Exclusive.</p>
      <p>To open the chest, you need keys. Click the star-shaped button 10 times to complete a map. This has a 30% chance to reward a key. After earning some keys, click the chest to open it and receive your loot!</p>
      <p>Each chest only lasts 5 minutes, so hurry to unlock the exclusives before they rotate out!</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
</script>

<style scoped>
.tutorial-text {
  max-height:60vh; 
  overflow:auto;
}

.tutorial-text p:not(:last-child) {
  margin-bottom: 1em;
}

</style>