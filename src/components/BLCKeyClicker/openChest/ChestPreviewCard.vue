<template>
  <v-card class="chest-preview-card" variant="outlined">
    <div class="chest-preview-card__header">
      <div class="chest-preview-card__title text-subtitle-2">
        {{ chestName || "Black Lion Chest" }}
      </div>
      <ChestPreviewDialog :chest-config="currentChestConfig">
        <template #activator="activatorProps">
          <v-btn
            v-bind="activatorProps"
            icon="mdi-eye"
            variant="text"
            color="primary"
            size="small"
            :disabled="!currentChestConfig"
          />
        </template>
      </ChestPreviewDialog>
    </div>

    <v-divider />

    <div class="chest-preview-card__content">
      <div class="chest-preview-card__group">
        <ItemImage
          v-for="item in exclusiveItems"
          :key="item.itemId"
          :item="item"
          :size="40"
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
          :size="40"
          rounded="lg"
          :text-overlay="false"
          :avatar-props="{ class: 'chest-preview-card__icon' }"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import ItemImage from "@/components/BLCKeyClicker/ItemImage.vue";
import ChestPreviewDialog from "./ChestPreviewDialog.vue";
import { useLootStore } from "@/store/loot/lootStore";

const lootStore = useLootStore();
const { currentChestConfig, chestName } = storeToRefs(lootStore);

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const exclusiveItems = computed(() => {
  const config = currentChestConfig.value;
  if (!config?.sets) return [];
  const items = [];
  for (const setKey of ["newExclusive", "returningExclusive"]) {
    const entry = config.sets[setKey]?.items?.[0];
    if (!entry) continue;
    const obtained = lootStore.hasExclusiveDropped(entry.itemId);
    items.push({
      itemId: entry.itemId,
      label: entry.label,
      setKey,
      obtained,
      badgeText: setKey === "newExclusive" && !obtained ? "NEW" : "",
    });
  }
  return items;
});

const weaponPreviewItems = computed(() => {
  const config = currentChestConfig.value;
  if (!config?.sets) return [];
  const items = [];
  for (const setKey of ["uncommonWeapons", "rareWeapons"]) {
    const weapons = config.sets[setKey]?.items;
    if (weapons?.length) {
      items.push({ ...pickRandom(weapons), key: setKey });
    }
  }
  return items;
});
</script>

<style scoped>
.chest-preview-card {
  width: 240px;
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
  padding: 10px 8px;
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
