<template>
  <div class="right-panel">
    <v-breadcrumbs :items="breadcrumbItems" density="compact" class="px-3 pt-2 pb-0">
      <template #divider>
        <v-icon icon="mdi-chevron-right" size="x-small" />
      </template>
      <template #item="{ item }">
        <v-breadcrumbs-item
          :disabled="item.disabled"
          :class="{ 'breadcrumb-link': !item.disabled }"
          @click="!item.disabled && navigateTo(item.path)"
        >
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <v-divider class="mb-1" />

    <v-list v-if="currentMenu" density="compact" nav>
      <v-list-item
        v-for="entry in currentMenu"
        :key="entry.title"
        :prepend-icon="entry.icon"
        :title="entry.title"
        @click="navigateTo(entry.path)"
      />
    </v-list>

    <template v-else>
      <GraphicsSettings v-if="currentView === 'graphics'" />
      <SoundSettings v-else-if="currentView === 'sound'" />
      <HistoryDisplay v-else-if="currentView === 'history'" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import GraphicsSettings from "./GraphicsSettings.vue";
import SoundSettings from "./SoundSettings.vue";
import HistoryDisplay from "./HistoryDisplay.vue";

const MENUS = {
  root: [
    { icon: "mdi-cog-outline", title: "Settings", path: ["settings"] },
    { icon: "mdi-history", title: "History", path: ["history"] },
  ],
  settings: [
    { icon: "mdi-monitor", title: "Graphics", path: ["settings", "graphics"] },
    { icon: "mdi-volume-high", title: "Sound", path: ["settings", "sound"] },
  ],
};

const LABELS = Object.fromEntries(
  Object.values(MENUS).flat().map((e) => [e.path[e.path.length - 1], e.title]),
);

const path = ref([]);

const currentView = computed(() =>
  path.value.length === 0 ? "root" : path.value[path.value.length - 1],
);

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

function navigateTo(newPath) {
  path.value = [...newPath];
}
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
</style>
