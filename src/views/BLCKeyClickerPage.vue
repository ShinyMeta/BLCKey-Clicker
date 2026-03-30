<template>
    <v-navigation-drawer
      v-model="leftDrawerOpen"
      :permanent="lgAndUp"
      :temporary="!lgAndUp"
      location="left"
      :width="320"
    >
      <LeftPanel />
    </v-navigation-drawer>

      <CenterPanel />

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

    <v-navigation-drawer
      v-model="rightDrawerOpen"
      :permanent="lgAndUp"
      :temporary="!lgAndUp"
      location="right"
      :width="320"
    >
      <RightPanel />
    </v-navigation-drawer>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import CenterPanel from "@/components/BLCKeyClicker/centerPanel/CenterPanel.vue";
import RightPanel from "@/components/BLCKeyClicker/rightPanel/RightPanel.vue";
import LeftPanel from "@/components/BLCKeyClicker/leftPanel/LeftPanel.vue";
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
