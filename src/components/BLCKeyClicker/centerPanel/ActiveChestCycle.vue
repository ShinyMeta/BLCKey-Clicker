<template>
  <section class="center-pane__top">
    <OpenChestPanel />
  </section>
  <section class="center-pane__bottom">
    <MapCompProgress />
  </section>
</template>

<script setup>
  import OpenChestPanel from "@/components/BLCKeyClicker/openChest/OpenChestPanel.vue";
  import MapCompProgress from "@/components/BLCKeyClicker/mapComp/MapCompProgress.vue";
</script>

<style scoped>


.center-pane__top {
  flex: 3;
}

.center-pane__bottom {
  flex: 6;
}

.center-pane__top,
.center-pane__bottom {
  min-height: 300px;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>