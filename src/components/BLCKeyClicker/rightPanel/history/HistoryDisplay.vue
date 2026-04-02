<template>
  <div class="history-display pa-2">
    <div
      v-if="!reversedHistory.length"
      class="text-center text-medium-emphasis text-body-2 pa-4"
    >
      No chest history yet.
    </div>
    <div v-else>
      <div v-if="totalPages > 1" class="d-flex justify-center mb-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="3"
          density="compact"
        />
      </div>
      <div v-for="entry in pagedHistory" :key="entry.id" class="mb-3">
        <ChestPreviewCard
          :chest-history-entry="entry"
          @view-drop-history="viewDropHistory"
        />
      </div>
      <div v-if="totalPages > 1" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="3"
          density="compact"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ChestPreviewCard from "@/components/BLCKeyClicker/shared/ChestPreviewCard.vue";
import { useLootStore } from "@/store/loot/lootStore";
import { useRightPanelStore } from "@/store/RightPanelStore";

const { chestHistory } = storeToRefs(useLootStore());
const rightPanelStore = useRightPanelStore();

function viewDropHistory(selectedHistoryEntry) {
  rightPanelStore.setPageMetadata({ selectedHistoryEntry });
  rightPanelStore.navigateTo(["history", "drops"]);
}

const itemsPerPage = 10;
const currentPage = ref(1);

const reversedHistory = computed(() => [...chestHistory.value].reverse());
const totalPages = computed(() => Math.max(1, Math.ceil(reversedHistory.value.length / itemsPerPage)));
const pagedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return reversedHistory.value.slice(start, start + itemsPerPage);
});

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages;
  }
});
</script>

<style scoped>

</style>
