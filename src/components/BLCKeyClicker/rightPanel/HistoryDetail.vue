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
        <div v-for="(open, idx) in reverseDrops" :key="reverseDrops.length - (idx)" class="mb-3">
          <HistoryLootRow :items="open || []" size="40" :label="`#${reverseDrops.length - (idx)}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ChestPreviewCard from "@/components/BLCKeyClicker/openChest/ChestPreviewCard.vue";
import HistoryLootRow from "@/components/BLCKeyClicker/rightPanel/HistoryLootRow.vue";

const props = defineProps({
  chestHistoryEntry: { type: Object, default: null },
});

const reverseDrops = computed(() => {
  return props.chestHistoryEntry?.opens ? [...props.chestHistoryEntry.opens].reverse() : [];
});
</script>

<style scoped>

.history-detail {
  overflow-y: auto;
  max-height: calc(100dvh - 120px);
}
</style>
