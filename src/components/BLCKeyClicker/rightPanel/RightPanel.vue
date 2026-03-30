<template>
  <div class="right-panel">
    <v-breadcrumbs :items="breadcrumbItems" density="compact" class="pa-3 pb-2">
      <template #divider>
        <v-icon icon="mdi-chevron-right" size="x-small" />
      </template>
      <template #item="{ item }">
        <v-breadcrumbs-item
          :disabled="item.disabled"
          :class="{ 'breadcrumb-link': !item.disabled }"
          @click="!item.disabled && rightPanelStore.navigateTo(item.path)"
        >
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <v-divider class="mb-1" />

    <div class="right-panel__content">
      <v-list v-if="currentMenu" density="compact" nav>
        <v-list-item
          v-for="entry in currentMenu"
          :key="entry.title"
          :prepend-icon="entry.icon"
          :title="entry.title"
          @click="rightPanelStore.navigateTo(entry.path)"
        />
      </v-list>
  
      <template v-else>
        <GraphicsSettings v-if="currentView === 'graphics'" />
        <SoundSettings v-else-if="currentView === 'sound'" />
        <HistoryDisplay v-else-if="currentView === 'history'" />
        <HistoryDetail v-else-if="currentView === 'drops'" 
          :chestHistoryEntry="pageMetaData.selectedHistoryEntry" />
        <RightPanelHelp v-else-if="currentView === 'help'" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import GraphicsSettings from "./settings/GraphicsSettings.vue";
import SoundSettings from "./settings/SoundSettings.vue";
import HistoryDisplay from "./history/HistoryDisplay.vue";
import HistoryDetail from "./history/HistoryDetail.vue";
import RightPanelHelp from "./help/RightPanelHelp.vue";

import { useRightPanelStore } from "@/store/RightPanelStore";

const MENUS = {
  root: [
    { icon: "mdi-cog-outline", title: "Settings", path: ["settings"] },
    { icon: "mdi-history", title: "History", path: ["history"] },
    { icon: "mdi-help-circle", title: "Help", path: ["help"] },
  ],
  settings: [
    { icon: "mdi-volume-high", title: "Sound", path: ["settings", "sound"] },
    { icon: "mdi-monitor", title: "Graphics", path: ["settings", "graphics"] },
  ],
};

const LABELS = Object.fromEntries([
  ...Object.values(MENUS).flat().map((e) => [e.path[e.path.length - 1], e.title]),
  ["drops", "Drops"],
]);

const rightPanelStore = useRightPanelStore();
const { path, currentView, pageMetaData } = storeToRefs(rightPanelStore);

const currentMenu = computed(() => MENUS[currentView.value] ?? null);

const breadcrumbItems = computed(() => {
  const items = [{ title: "Menu", path: [], disabled: path.value.length === 0 }];
  for (let i = 0; i < path.value.length; i++) {
    items.push({
      title: LABELS[path.value[i]] || path.value[i],
      path: path.value.slice(0, i + 1),
      disabled: i === path.value.length - 1,
    });
  }
  return items;
});

</script>

<style scoped>
.breadcrumb-link {
  cursor: pointer;
  opacity: 0.8;
}

.breadcrumb-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.right-panel__content {
  height: calc(100dvh - 110px);
  overflow-y: auto;
}
</style>
