<template>
  <div class="history-display pa-2">
    <div
      v-if="!reversedHistory.length"
      class="text-center text-medium-emphasis text-body-2 pa-4"
    >
      No chest history yet.
    </div>
    <div v-for="entry in reversedHistory" :key="entry.id" class="mb-3">
      <ChestPreviewCard :chest-config="entry.config" />
      <div class="text-caption text-medium-emphasis mt-1 px-1">
        Opened {{ entry.opens.length }} time{{ entry.opens.length === 1 ? "" : "s" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import ChestPreviewCard from "@/components/BLCKeyClicker/openChest/ChestPreviewCard.vue";
import { useLootStore } from "@/store/loot/lootStore";

const { chestHistory } = storeToRefs(useLootStore());

const reversedHistory = computed(() => [...chestHistory.value].reverse());
</script>

<style scoped>
.history-display {
  overflow-y: auto;
  max-height: calc(100dvh - 120px);
}
</style>
