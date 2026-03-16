<template>
  <v-dialog v-model="dialogOpen" max-width="860" scrollable>
    <template #activator="{ props: activatorProps }">
      <slot name="activator" v-bind="activatorProps" />
    </template>

    <v-card class="chest-preview-dialog">
      <v-card-title class="chest-preview-dialog__title">
        <div>
          <div class="text-h6">Chest Preview</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ chestConfig?.name ?? "No chest loaded" }}
          </div>
        </div>
        <v-chip size="small" variant="outlined">
          5th drop: {{ formatPercent(template.fifthDropChance * 100) }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text class="chest-preview-dialog__content">
        <v-progress-linear v-if="isLoadingMetadata" indeterminate class="mb-4" />

        <v-expansion-panels variant="accordion" class="preview-panels">
          <v-expansion-panel
            v-for="panel in previewPanels"
            :key="panel.key"
            :title="panel.title"
          >
            <template #title>
              <div class="panel-header">
                <div class="panel-header__main">
                  <div
                    v-if="getPanelPreviewEntries(panel).length"
                    class="panel-preview-icons"
                  >
                    <div
                      v-for="preview in getPanelPreviewEntries(panel)"
                      :key="preview.key"
                      class="panel-preview-icon-wrap"
                    >
                      <v-avatar rounded="0" size="30" class="panel-preview-icon">
                        <v-img
                          :src="getEntryIcon(preview.entry)"
                          :alt="getEntryName(preview.entry)"
                        />
                      </v-avatar>
                      <span v-if="preview.badgeText" class="panel-preview-badge">
                        {{ preview.badgeText }}
                      </span>
                    </div>
                  </div>
                  <div class="panel-header__text">
                    <div class="text-subtitle-1">{{ panel.title }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ panel.subtitle }}
                    </div>
                  </div>
                </div>
                <v-chip
                  v-if="panel.poolPercentText"
                  size="small"
                  variant="outlined"
                >
                  {{ panel.poolPercentText }}
                </v-chip>
              </div>
            </template>

            <template #text>
              <div class="preview-rows">
                <template v-for="row in panel.rows" :key="row.key">
                  <v-expansion-panels
                    v-if="row.type === 'group'"
                    variant="accordion"
                    density="compact"
                    class="slot-group"
                  >
                    <v-expansion-panel>
                      <template #title>
                        <div class="panel-header panel-header--group">
                          <div class="panel-header__main">
                            <div
                              v-if="getRowPreviewEntries(row).length"
                              class="panel-preview-icons panel-preview-icons--group"
                            >
                              <div
                                v-for="preview in getRowPreviewEntries(row)"
                                :key="preview.key"
                                class="panel-preview-icon-wrap"
                              >
                                <v-avatar
                                  rounded="0"
                                  size="36"
                                  class="panel-preview-icon panel-preview-icon--group"
                                >
                                  <v-img
                                    :src="getEntryIcon(preview.entry)"
                                    :alt="getEntryName(preview.entry)"
                                  />
                                </v-avatar>
                                <span
                                  v-if="preview.badgeText"
                                  class="panel-preview-badge panel-preview-badge--group"
                                >
                                  {{ preview.badgeText }}
                                </span>
                              </div>
                            </div>
                            <div class="text-subtitle-2">{{ row.label }}</div>
                          </div>
                          <v-chip size="small" variant="tonal">
                            {{ formatPercent(getRowPercent(row.totalWeight, panel.denominator)) }}
                          </v-chip>
                        </div>
                      </template>

                      <template #text>
                        <div class="group-rows">
                          <div
                            v-for="item in row.items"
                            :key="item.key"
                            class="loot-entry"
                          >
                            <div class="loot-entry__info">
                              <v-avatar rounded="0" size="40" class="loot-entry__icon">
                                <v-img :src="getEntryIcon(item)" :alt="getEntryName(item)" />
                              </v-avatar>
                              <div>
                                <div class="text-body-2">{{ getEntryName(item) }}</div>
                                <div
                                  v-if="item.quantity > 1"
                                  class="text-caption text-medium-emphasis"
                                >
                                  x{{ item.quantity }}
                                </div>
                              </div>
                            </div>
                            <div class="text-body-2 loot-entry__percent">
                              {{ formatPercent(getRowPercent(item.weight, panel.denominator)) }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <div v-else class="loot-entry">
                    <div class="loot-entry__info">
                      <v-avatar rounded="0" size="40" class="loot-entry__icon">
                        <v-img
                          :src="getEntryIcon(row.item)"
                          :alt="getEntryName(row.item)"
                        />
                      </v-avatar>
                      <div>
                        <div class="text-body-2">{{ getEntryName(row.item) }}</div>
                        <div
                          v-if="row.item.quantity > 1"
                          class="text-caption text-medium-emphasis"
                        >
                          x{{ row.item.quantity }}
                        </div>
                      </div>
                    </div>
                    <div class="text-body-2 loot-entry__percent">
                      {{ formatPercent(getRowPercent(row.weight, panel.denominator)) }}
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import noRewardImg from "@/assets/noRewardItem.png";
import template from "@/loot/config/template.json";
import { mergeTemplateWithConfig } from "@/loot/lootService";

const CATEGORY_ORDER = [
  "guaranteed",
  "commonLeft",
  "commonRight",
  "exclusive",
  "uncommon",
  "rare",
  "superRare",
];

const CATEGORY_TITLES = {
  guaranteed: "Guaranteed",
  commonLeft: "Common Left",
  commonRight: "Common Right",
  exclusive: "Exclusive",
  uncommon: "Uncommon",
  rare: "Rare",
  superRare: "Super Rare",
};

const SLOT_TITLES = {
  guaranteedItem: "Guaranteed Item",
  dyeKits: "Dye Kits",
  newExclusive: "New Exclusive",
  returningExclusive: "Returning Exclusive",
  glyphs: "Glyphs",
  nodes: "Nodes",
  tonic: "Tonic",
};

const FIFTH_DROP_CATEGORY_KEYS = ["exclusive", "uncommon", "rare", "superRare"];

const props = defineProps({
  chestConfig: {
    type: Object,
    default: null,
  },
});

const dialogOpen = ref(false);
const isLoadingMetadata = ref(false);
const itemMetadata = ref({});
const skinMetadata = ref({});
const lastLoadedSignature = ref("");

function getSlotLabel(setKey, slotName) {
  if (setKey === "uncommonWeapons" || setKey === "rareWeapons") {
    return slotName ?? SLOT_TITLES[setKey] ?? setKey;
  }

  return SLOT_TITLES[setKey] ?? setKey;
}

const mergedConfig = computed(() =>
  props.chestConfig ? mergeTemplateWithConfig(template, props.chestConfig) : null
);

function resolveCategoryRows(categoryKey, resolvedCategory) {
  const rows = [];
  let poolWeight = 0;

  for (const [index, item] of resolvedCategory.items.entries()) {
    rows.push({
      type: "item",
      key: `${categoryKey}-fixed-${item.itemId ?? index}`,
      item,
      weight: item.weight ?? null,
    });

    if (item.weight != null) {
      poolWeight += item.weight;
    }
  }

  for (const slot of resolvedCategory.slots) {
    const resolvedItems = slot.items.map((item, index) => ({
      ...item,
      key: `${categoryKey}-${slot.setKey}-${item.skinId ?? item.itemId ?? index}`,
    }));

    const slotTotalWeight = resolvedItems.reduce(
      (sum, item) => sum + (item.weight ?? 0),
      0
    );

    poolWeight += slotTotalWeight;

    if (resolvedItems.length > 1) {
      rows.push({
        type: "group",
        key: `${categoryKey}-${slot.setKey}`,
        label: getSlotLabel(slot.setKey, slot.name),
        setKey: slot.setKey,
        totalWeight: slotTotalWeight,
        items: resolvedItems,
      });
      continue;
    }

    rows.push({
      type: "item",
      key: `${categoryKey}-${slot.setKey}`,
      setKey: slot.setKey,
      item: resolvedItems[0],
      weight: slotTotalWeight,
    });
  }

  return { rows, poolWeight };
}

const rawPanels = computed(() => {
  if (!mergedConfig.value) {
    return [];
  }

  return CATEGORY_ORDER.map((categoryKey) => ({
    key: categoryKey,
    title: CATEGORY_TITLES[categoryKey],
    ...resolveCategoryRows(categoryKey, mergedConfig.value[categoryKey]),
  }));
});

const fifthDropPoolWeight = computed(() =>
  rawPanels.value
    .filter((panel) => FIFTH_DROP_CATEGORY_KEYS.includes(panel.key))
    .reduce((sum, panel) => sum + panel.poolWeight, 0)
);

const previewPanels = computed(() =>
  rawPanels.value.map((panel) => {
    const isFifthDropPanel = FIFTH_DROP_CATEGORY_KEYS.includes(panel.key);
    const denominator =
      panel.key === "guaranteed"
        ? null
        : isFifthDropPanel
          ? fifthDropPoolWeight.value
          : panel.poolWeight;

    let subtitle = "Both items included in every chest.";
    let poolPercentText = "";

    if (panel.key === "commonLeft" || panel.key === "commonRight") {
      subtitle = "One item from this pool in every chest.";
    } else if (isFifthDropPanel) {
      const poolSharePercent = getRowPercent(panel.poolWeight, fifthDropPoolWeight.value);
      const chestSharePercent = poolSharePercent * template.fifthDropChance;
      subtitle = `${formatPercent(chestSharePercent)} total chance per chest`;
      poolPercentText = `${formatPercent(poolSharePercent)} of 5th pool`;
    }

    return {
      ...panel,
      denominator,
      subtitle,
      poolPercentText,
    };
  })
);

const metadataLookups = computed(() => {
  const itemIds = new Set();
  const skinIds = new Set();

  for (const panel of rawPanels.value) {
    for (const row of panel.rows) {
      if (row.type === "group") {
        for (const item of row.items) {
          if (item.skinId != null) {
            skinIds.add(item.skinId);
          } else if (item.itemId != null) {
            itemIds.add(item.itemId);
          }
        }
        continue;
      }

      if (row.item.skinId != null) {
        skinIds.add(row.item.skinId);
      } else if (row.item.itemId != null) {
        itemIds.add(row.item.itemId);
      }
    }
  }

  return {
    itemIds: [...itemIds].sort((a, b) => a - b),
    skinIds: [...skinIds].sort((a, b) => a - b),
  };
});

const metadataSignature = computed(() =>
  JSON.stringify({
    itemIds: metadataLookups.value.itemIds,
    skinIds: metadataLookups.value.skinIds,
  })
);

watch(
  [dialogOpen, metadataSignature],
  async ([isOpen, signature]) => {
    if (!isOpen || !props.chestConfig || !signature || signature === lastLoadedSignature.value) {
      return;
    }

    isLoadingMetadata.value = true;

    try {
      const [items, skins] = await Promise.all([
        fetchMetadataBatch("items", metadataLookups.value.itemIds),
        fetchMetadataBatch("skins", metadataLookups.value.skinIds),
      ]);

      itemMetadata.value = items;
      skinMetadata.value = skins;
      lastLoadedSignature.value = signature;
    } catch (error) {
      console.error("Failed to load chest preview metadata", error);
    } finally {
      isLoadingMetadata.value = false;
    }
  },
  { immediate: true }
);

async function fetchMetadataBatch(endpoint, ids) {
  if (!ids.length) {
    return {};
  }

  const chunkSize = 150;
  const responses = await Promise.all(
    chunkArray(ids, chunkSize).map(async (chunk) => {
      const response = await fetch(
        `https://api.guildwars2.com/v2/${endpoint}?ids=${chunk.join(",")}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
      }

      return response.json();
    })
  );

  return responses.flat().reduce((lookup, entry) => {
    lookup[entry.id] = entry;
    return lookup;
  }, {});
}

function chunkArray(values, chunkSize) {
  const result = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    result.push(values.slice(index, index + chunkSize));
  }

  return result;
}

function getEntryMetadata(entry) {
  if (entry.skinId != null) {
    return skinMetadata.value[entry.skinId];
  }

  return itemMetadata.value[entry.itemId];
}

function getEntryName(entry) {
  return getEntryMetadata(entry)?.name ?? entry.label;
}

function getEntryIcon(entry) {
  return getEntryMetadata(entry)?.icon ?? noRewardImg;
}

function getPanelPreviewEntries(panel) {
  if (panel.key === "guaranteed") {
    return panel.rows
      .filter((row) => row.type === "item")
      .slice(0, 2)
      .map((row, index) => ({
        key: `${panel.key}-${row.setKey ?? "fixed"}-${index}`,
        entry: row.item,
      }));
  }

  if (panel.key === "exclusive") {
    const rowOrder = ["newExclusive", "returningExclusive"];

    return rowOrder
      .map((setKey) => panel.rows.find((row) => row.type === "item" && row.setKey === setKey))
      .filter(Boolean)
      .map((row) => ({
        key: `${panel.key}-${row.setKey}`,
        entry: row.item,
        badgeText: row.setKey === "newExclusive" ? "NEW" : "",
      }));
  }

  return [];
}

function getRowPreviewEntries(row) {
  if (row.type !== "group") {
    return [];
  }

  if (row.setKey === "dyeKits") {
    return row.items.map((item, index) => ({
      key: `${row.key}-${index}`,
      entry: item,
    }));
  }

  if (row.setKey === "uncommonWeapons" || row.setKey === "rareWeapons") {
    return row.items.length
      ? [
          {
            key: `${row.key}-preview`,
            entry: row.items[0],
          },
        ]
      : [];
  }

  return [];
}

function getRowPercent(weight, denominator) {
  if (weight == null || denominator == null) {
    return 100;
  }

  if (denominator === 0) {
    return 0;
  }

  return (weight / denominator) * 100;
}

function formatPercent(percent) {
  if (percent >= 10) {
    return `${percent.toFixed(2)}%`;
  }

  if (percent >= 1) {
    return `${percent.toFixed(2)}%`;
  }

  if (percent >= 0.1) {
    return `${percent.toFixed(3)}%`;
  }

  return `${percent.toFixed(4)}%`;
}
</script>

<style scoped>
.chest-preview-dialog__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 14px 18px;
}

.chest-preview-dialog__content {
  max-height: 75dvh;
  padding: 12px 18px 18px;
}

.preview-panels {
  gap: 8px;
}

.preview-panels :deep(.v-expansion-panel-title) {
  min-height: 58px;
  padding: 10px 14px;
}

.preview-panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 14px 14px;
}

.panel-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.panel-header__main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.panel-header__text {
  min-width: 0;
}

.panel-header--group {
  padding-right: 4px;
}

.preview-rows {
  display: flex;
  flex-direction: column;
}

.group-rows {
  display: flex;
  flex-direction: column;
}

.panel-preview-icons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

.panel-preview-icons--group {
  gap: 3px;
}

.panel-preview-icon-wrap {
  position: relative;
}

.panel-preview-icon {
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.panel-preview-icon--group {
  background: rgba(var(--v-theme-surface-variant), 0.45);
}

.panel-preview-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  padding: 1px 4px;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.panel-preview-badge--group {
  top: -4px;
  right: -4px;
  font-size: 8px;
}

.slot-group {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 2px;
}

.slot-group :deep(.v-expansion-panel-title) {
  min-height: 46px;
  padding: 8px 10px;
}

.slot-group :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 10px 10px;
}

.loot-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 46px;
  padding: 6px;
}

.loot-entry{
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.loot-entry__info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.loot-entry__icon {
  flex: 0 0 auto;
  background: rgba(var(--v-theme-surface-variant), 0.4);
}

.loot-entry__percent {
  flex: 0 0 auto;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
