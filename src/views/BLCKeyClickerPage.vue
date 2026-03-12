<template>
  <v-layout class="blc-clicker-layout">
    <v-navigation-drawer
      v-model="leftDrawerOpen"
      :permanent="lgAndUp"
      :temporary="!lgAndUp"
      location="left"
      :width="320"
    >
      <div class="pa-4">Left panel placeholder</div>
    </v-navigation-drawer>

    <v-main>
      <div class="center-pane">
        <section class="center-pane__top">
          <OpenChestPanel />
        </section>
        <section class="center-pane__bottom">
          <MapCompProgress />
        </section>
      </div>

      <template v-if="!lgAndUp">
        <v-btn
          icon
          variant="tonal"
          size="x-small"
          class="panel-tab panel-tab--left"
          aria-label="Toggle left panel"
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="tonal"
          size="x-small"
          class="panel-tab panel-tab--right"
          aria-label="Toggle right panel"
          @click="rightDrawerOpen = !rightDrawerOpen"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
    </v-main>

    <v-navigation-drawer
      v-model="rightDrawerOpen"
      :permanent="lgAndUp"
      :temporary="!lgAndUp"
      location="right"
      :width="320"
    >
      <div class="pa-4">Right panel placeholder</div>
    </v-navigation-drawer>
  </v-layout>
</template>

<script setup>
import { ref, watch } from "vue";
import { useDisplay } from "vuetify";
import MapCompProgress from "@/components/BLCKeyClicker/mapComp/MapCompProgress.vue";
import OpenChestPanel from "@/components/BLCKeyClicker/openChest/OpenChestPanel.vue";

const { lgAndUp } = useDisplay();
const leftDrawerOpen = ref(lgAndUp.value);
const rightDrawerOpen = ref(lgAndUp.value);

watch(lgAndUp, (isLarge) => {
  leftDrawerOpen.value = isLarge;
  rightDrawerOpen.value = isLarge;
});
</script>

<style scoped>
.blc-clicker-layout {
  height: calc(100dvh - 64px);
  overflow: hidden;
}

.center-pane {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.center-pane__top{
  flex: 3;
} 
.center-pane__bottom {
  flex: 6;
} 

.center-pane__top,
.center-pane__bottom {
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.panel-tab {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.panel-tab--left {
  left: 4px;
}

.panel-tab--right {
  right: 4px;
}
</style>
