<template>
  <v-layout>
    <v-navigation-drawer
      v-model="leftDrawerOpen"
      :permanent="lgAndUp"
      :temporary="!lgAndUp"
      location="left"
      :width="320"
    >
      <div class="pa-4">
        <ChestPreviewCard />
        <v-btn
          block
          class="mt-3"
          prepend-icon="mdi-refresh"
          color="primary"
          variant="tonal"
          @click="lootStore.generateCurrentChestConfig()"
        >
          New Random Chest
        </v-btn>
      </div>
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
      <RightPanel />
    </v-navigation-drawer>
  </v-layout>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import ChestPreviewCard from "@/components/BLCKeyClicker/shared/ChestPreviewCard.vue";
import MapCompProgress from "@/components/BLCKeyClicker/mapComp/MapCompProgress.vue";
import OpenChestPanel from "@/components/BLCKeyClicker/openChest/OpenChestPanel.vue";
import RightPanel from "@/components/BLCKeyClicker/rightPanel/RightPanel.vue";
import { useLootStore } from "@/store/loot/lootStore";

const { lgAndUp } = useDisplay();
const leftDrawerOpen = ref(lgAndUp.value);
const rightDrawerOpen = ref(lgAndUp.value);
const lootStore = useLootStore();

watch(lgAndUp, (isLarge) => {
  leftDrawerOpen.value = isLarge;
  rightDrawerOpen.value = isLarge;
});

onMounted(() => {
  lootStore.generateCurrentChestConfig();
});
</script>

<style scoped>
.center-pane {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 64px);
}

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

.panel-tab {
  position: fixed;
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
