<template>
  <div class="position-relative">
    <span v-if="!hideName">
      {{ dropElement?.item?.name }}
    </span>
    <v-img
      :src="dropElement?.item?.icon ? dropElement.item.icon : `error`"
      height="64"
      min-width="64"
    >
      <div
        v-if="withCount"
        class="d-flex justify-center align-center countText text-h5"
      >
        <span>
          {{ dropElement.dropCount }}
        </span>
      </div>
      <template v-slot:error>
        <v-img
          src="https://render.guildwars2.com/file/71F657404DD26303EDBD62F82ABA1C736664F8D0/960286.png"
          height="64"
        ></v-img>
      </template>
    </v-img>
  </div>
</template>
<script setup>
defineProps(["dropElement", "withCount", "hideName"]);
</script>
<style scoped>
.countText {
  text-shadow: 2px 2px 3px black, -2px 2px 3px black, 2px -2px 3px black,
    -2px -2px 3px black;
  height: 100%;
}
</style>
