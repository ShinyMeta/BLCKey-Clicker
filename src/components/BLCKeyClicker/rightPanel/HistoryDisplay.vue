<template>
  <div class="history-display pa-2">
    <div
      v-if="!reversedHistory.length"
      class="text-center text-medium-emphasis text-body-2 pa-4"
    >
      No chest history yet.
    </div>
    <div v-for="entry in reversedHistory" :key="entry.id" class="mb-3">
      <ChestPreviewCard
        :chest-history-entry="entry"
        @view-drop-history="viewDropHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import ChestPreviewCard from "@/components/BLCKeyClicker/openChest/ChestPreviewCard.vue";
import { useLootStore } from "@/store/loot/lootStore";
import { useRightPanelStore } from "@/store/RightPanelStore";

const { chestHistory } = storeToRefs(useLootStore());
const rightPanelStore = useRightPanelStore();

function viewDropHistory(selectedHistoryEntry) {
  rightPanelStore.setPageMetadata({ selectedHistoryEntry });
  rightPanelStore.navigateTo(["history", "drops"]);
}

const reversedHistory = computed(() => [...chestHistory.value].reverse());
</script>

<style scoped>
.history-display {
  overflow-y: auto;
  max-height: calc(100dvh - 120px);
}
</style>
