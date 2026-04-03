<template>
  <v-card
    class="chest-preview-card"
    color="surface-lighten-1"
    variant="elevated"
  >
    <v-card-title class="chest-preview-card__header">
      <div style="flex: 1; min-width: 0;">
        <div class="chest-preview-card__title text-subtitle-2">
          {{ resolvedConfig?.name || "Black Lion Chest" }}
        </div>
        <div
          v-if="chestHistoryEntry"
          class="text-caption text-medium-emphasis chest-preview-card__subtitle"
        >
          Opened {{ openedCount }} time{{ openedCount === 1 ? "" : "s" }}
        </div>
      </div>
      <v-btn
        v-tooltip:top="'View Drop History'"
        v-if="chestHistoryEntry"
        icon="mdi-history"
        variant="text"
        color="primary"
        size="small"
        :disabled="!resolvedConfig || openedCount === 0"
        @click="handleViewDropHistoryClick"
      />
      <ChestPreviewDialog v-else :chest-config="resolvedConfig">
        <template #activator="activatorProps">
          <v-btn
            v-tooltip:top="'Open Chest Preview'"
            v-bind="activatorProps"
            icon="mdi-eye"
            variant="text"
            color="primary"
            size="small"
            :disabled="!resolvedConfig"
            @click="handlePreviewClick"
          />
        </template>
      </ChestPreviewDialog>
    </v-card-title>

    <v-divider />

    <v-progress-linear
      v-if="isLoadingMetadata"
      indeterminate
      color="primary"
      height="4"
      class="mb-2"
    />

    <v-card-text class="chest-preview-card__content">
      <div class="chest-preview-card__group">
        <ItemImage
          v-for="item in exclusiveItems"
          :key="item.itemId"
          :item="item"
          :size="50"
          rounded="lg"
          :text-overlay="false"
          :badge-text="item.badgeText"
          :avatar-props="{ class: 'chest-preview-card__icon' }"
        />
      </div>

      <v-divider vertical class="chest-preview-card__separator" />

      <div class="chest-preview-card__group">
        <ItemImage
          v-for="item in weaponPreviewItems"
          :key="item.key"
          :item="item"
          :size="50"
          rounded="lg"
          :text-overlay="false"
          :tooltip="item.collection"
          :avatar-props="{ class: 'chest-preview-card__icon' }"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import ItemImage from "@/components/BLCKeyClicker/shared/ItemImage.vue";
import { emitSoundEvent } from "@/services/sound";
import ChestPreviewDialog from "./ChestPreviewDialog.vue";
import { useLootStore } from "@/store/loot/lootStore";
import { fetchItemLikeMetadata } from "@/utils/gw2api";

const props = defineProps({
  chestConfig: { type: Object, default: null },
  chestHistoryEntry: { type: Object, default: null },
});

const emit = defineEmits(["view-drop-history"]);

const lootStore = useLootStore();
const { currentChestConfig } = storeToRefs(lootStore);

const resolvedConfig = computed(
  () => props.chestHistoryEntry?.config ?? props.chestConfig ?? currentChestConfig.value,
);

const resolvedConfigKey = computed(() => {
  const config = resolvedConfig.value;
  if (!config) return "";
  if (config.__previewKey) return String(config.__previewKey);
  return `${config.name ?? "Black Lion Chest"}:${config.appearanceType ?? 0}`;
});

const dropHistory = computed(() => 
  props.chestHistoryEntry?.opens ?? [],
);

const openedCount = computed(() => {
  if (dropHistory.value == null) return 0;
  return Array.isArray(dropHistory.value)
    ? dropHistory.value.length
    : Number(dropHistory.value) || 0;
});

function handlePreviewClick() {
  emitSoundEvent("chestPreviewOpened");
}

function handleViewDropHistoryClick(){
  emit("view-drop-history", props.chestHistoryEntry);
}

const exclusiveItems = computed(() => {
  const config = resolvedConfig.value;
  if (!config?.sets) return [];
  
  return lootStore.exclusivesFromConfig(config);
});

const weaponPreviewItems = computed(() => {
  const config = resolvedConfig.value;
  if (!config?.sets) return [];
  const items = [];

  for (const setKey of ["uncommonWeapons", "rareWeapons"]) {
    const weaponSet = config.sets[setKey];
    if (!weaponSet?.items?.length) continue;

    const previewItem = weaponSet.previewItem ?? weaponSet.items[0];
    if (!previewItem) continue;

    items.push({ ...previewItem, key: setKey, collection: weaponSet.name });
  }

  return items;
});

const isLoadingMetadata = ref(false);

const previewItems = computed(() => {
  return [...exclusiveItems.value, ...weaponPreviewItems.value];
});


watch(
  resolvedConfigKey,
  async () => {
    const chestConfig = resolvedConfig.value;
    if (!chestConfig) {
      isLoadingMetadata.value = false;
      return;
    }

    const itemsToResolve = previewItems.value.filter(Boolean);
    if (!itemsToResolve.length) {
      isLoadingMetadata.value = false;
      return;
    }

    isLoadingMetadata.value = true;
    try {
      await fetchItemLikeMetadata(itemsToResolve);
    } catch (error) {
      console.error("ChestPreviewCard: failed to fetch item metadata", error);
    } finally {
      isLoadingMetadata.value = false;
    }
  },
  { immediate: true },
);

</script>

<style scoped>
.chest-preview-card {
  width: 100%;
}

.chest-preview-card__header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 6px 8px 12px;
}

.chest-preview-card__title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.chest-preview-card__content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.chest-preview-card__group {
  flex: 1;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.chest-preview-card__separator {
  align-self: stretch;
  margin: 0 2px;
}

.chest-preview-card :deep(.chest-preview-card__icon) {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
