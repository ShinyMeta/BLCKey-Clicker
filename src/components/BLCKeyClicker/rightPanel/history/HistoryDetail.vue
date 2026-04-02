<template>
  <div class="history-detail pa-3">
    <div class="mb-3">
      <ChestPreviewCard :chest-config="props.chestHistoryEntry?.config" :drop-history="props.chestHistoryEntry?.opens" />
    </div>

    <div class="history-rows px-6 pt-2">
      <div v-if="!reverseDrops.length" class="text-body-2 text-medium-emphasis pa-4">
        No opens for this chest.
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
        <div v-for="(open, idx) in pagedDrops" :key="dropNumber(idx)" class="mb-3">
          <HistoryLootRow :items="open || []" :size="40" :label="`#${dropNumber(idx)}`" />
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
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import ChestPreviewCard from "@/components/BLCKeyClicker/shared/ChestPreviewCard.vue";
import HistoryLootRow from "@/components/BLCKeyClicker/rightPanel/history/HistoryLootRow.vue";

const props = defineProps({
  chestHistoryEntry: { type: Object, default: null },
});

const itemsPerPage = 15;
const currentPage = ref(1);

const reverseDrops = computed(() => {
  return props.chestHistoryEntry?.opens ? [...props.chestHistoryEntry.opens].reverse() : [];
});

const totalPages = computed(() => Math.max(1, Math.ceil(reverseDrops.value.length / itemsPerPage)));
const pageStart = computed(() => (currentPage.value - 1) * itemsPerPage);
const pagedDrops = computed(() => {
  return reverseDrops.value.slice(pageStart.value, pageStart.value + itemsPerPage);
});

const dropNumber = (indexOnPage) => {
  return reverseDrops.value.length - (pageStart.value + indexOnPage);
};

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages;
  }
});
</script>

<style scoped>

</style>
