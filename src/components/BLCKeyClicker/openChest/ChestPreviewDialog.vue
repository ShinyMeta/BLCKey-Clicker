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
        <div class="percent-mode-toggle-wrap">
          <span class="percent-mode-label text-caption text-medium-emphasis text-center">
            Percentage Display Mode
          </span>
          <v-btn-toggle
            v-model="percentMode"
            mandatory
            density="compact"
            variant="outlined"
            class="percent-mode-toggle"
          >
            <v-btn value="perChest" size="small" title="Show percentages per chest opened">
              Per chest
              <template #append>
                <v-img :src="blcKeyIcon" width="22" height="22" />
              </template>
            </v-btn>
            <v-btn value="goldenKey" size="small" title="Show percentages per 5th-drop roll">
              <template #prepend>
                <v-img :src="goldenBlcKeyIcon" width="22" height="22" />
              </template>
              Per 5th-drop
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-card-title>

      <v-divider />

      <div class="percent-mode-hint text-caption text-medium-emphasis">
        <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
        {{ percentModeDescription }}
      </div>

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
                  <div class="panel-preview-icons">
                    <div
                      v-for="preview in panel.previewEntries"
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
                              class="panel-preview-icons panel-preview-icons--group"
                            >
                              <div
                                v-for="preview in (row.previewEntries ?? [])"
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
                            <div class="text-subtitle-2">
                              {{ row.label }}
                              <v-chip size="x-small" variant="tonal" class="ml-1">
                                {{ row.items.length }}
                              </v-chip>
                            </div>
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

                  <div
                    v-else
                    class="loot-entry"
                    :class="{ 'loot-entry--obtained': isExclusiveObtained(row) }"
                  >
                    <div class="loot-entry__info">
                      <div class="loot-entry__icon-wrap">
                        <v-avatar rounded="0" size="40" class="loot-entry__icon">
                          <v-img
                            :src="getEntryIcon(row.item)"
                            :alt="getEntryName(row.item)"
                          />
                        </v-avatar>
                        <div
                          v-if="isExclusiveObtained(row)"
                          class="loot-entry__obtained-overlay"
                        >
                          <v-icon color="success" size="20">mdi-check-circle</v-icon>
                        </div>
                        <span
                          v-if="getItemBadgeText(row)"
                          class="loot-entry__badge"
                        >
                          {{ getItemBadgeText(row) }}
                        </span>
                      </div>
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
                      <v-chip
                        v-if="isExclusiveObtained(row)"
                        size="small"
                        color="success"
                        variant="tonal"
                      >
                        <v-icon start size="14">mdi-check</v-icon>
                        Obtained
                      </v-chip>
                      <template v-else>
                        {{ formatPercent(getRowPercent(row.weight, panel.denominator)) }}
                      </template>
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
import { storeToRefs } from "pinia";
import unknownItem from "@/assets/item/unknown.png";
import blcKeyIcon from "@/assets/item/BLCKey.png";
import goldenBlcKeyIcon from "@/assets/item/goldenBLCKey.png";
import api from "@/utils/gw2api";
import template from "@/store/loot/config/template.json";
import { mergeTemplateWithConfig } from "@/store/loot/lootService";
import { useLootStore } from "@/store/loot/lootStore";

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

const { lootTable, exclusiveLookup } = storeToRefs(useLootStore());

const dialogOpen = ref(false);
const percentMode = ref("perChest");
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
  (lootTable.value?.fifthDrop ?? []).reduce((sum, item) => sum + item.weight, 0),
);

const fifthDropCategoryWeights = computed(() => {
  const weights = {};
  for (const item of lootTable.value?.fifthDrop ?? []) {
    weights[item.category] = (weights[item.category] ?? 0) + item.weight;
  }
  return weights;
});

const cachedPreviewEntries = computed(() => {
  const result = {};
  for (const panel of rawPanels.value) {
    result[panel.key] = {
      panel: computePanelPreviewEntries(panel),
      rows: {},
    };
    for (const row of panel.rows) {
      if (row.type === "group") {
        result[panel.key].rows[row.key] = computeRowPreviewEntries(row);
      }
    }
  }
  return result;
});

function getPanelDenominator(panelKey, poolWeight) {
  if (panelKey === "guaranteed") return null;
  if (!FIFTH_DROP_CATEGORY_KEYS.includes(panelKey)) return poolWeight;
  return percentMode.value === "perChest"
    ? fifthDropPoolWeight.value / template.fifthDropChance
    : fifthDropPoolWeight.value;
}

function getPanelDisplayText(panelKey) {
  if (panelKey === "guaranteed") {
    return { subtitle: "Both items included in every chest.", poolPercentText: "" };
  }
  if (panelKey === "commonLeft" || panelKey === "commonRight") {
    return { subtitle: "One item from this pool in every chest.", poolPercentText: "" };
  }

  const categoryWeight = fifthDropCategoryWeights.value[panelKey] ?? 0;
  const poolSharePercent = getRowPercent(categoryWeight, fifthDropPoolWeight.value);
  const chestSharePercent = poolSharePercent * template.fifthDropChance;

  if (percentMode.value === "perChest") {
    return {
      subtitle: `${formatPercent(chestSharePercent)} total chance per chest`,
      poolPercentText: formatPercent(chestSharePercent),
    };
  }
  return {
    subtitle: `${formatPercent(poolSharePercent)} chance when a 5th drop occurs`,
    poolPercentText: formatPercent(poolSharePercent),
  };
}

const previewPanels = computed(() =>
  rawPanels.value.map((panel) => {
    const cached = cachedPreviewEntries.value[panel.key];
    const { subtitle, poolPercentText } = getPanelDisplayText(panel.key);

    return {
      ...panel,
      rows: panel.rows.map((row) =>
        row.type === "group"
          ? { ...row, previewEntries: cached.rows[row.key] }
          : row
      ),
      denominator: getPanelDenominator(panel.key, panel.poolWeight),
      subtitle,
      poolPercentText,
      previewEntries: cached.panel,
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
      const { itemIds, skinIds } = metadataLookups.value;

      const [items, skins] = await Promise.all([
        itemIds.length ? api.items().many(itemIds) : [],
        skinIds.length ? api.skins().many(skinIds) : [],
      ]);

      itemMetadata.value = toLookup(items);
      skinMetadata.value = toLookup(skins);
      lastLoadedSignature.value = signature;
    } catch (error) {
      console.error("Failed to load chest preview metadata", error);
    } finally {
      isLoadingMetadata.value = false;
    }
  },
  { immediate: true }
);

function toLookup(entries) {
  return entries.reduce((map, entry) => {
    map[entry.id] = entry;
    return map;
  }, {});
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
  return getEntryMetadata(entry)?.icon ?? unknownItem;
}

function isExclusiveObtained(row) {
  if (row.type !== "item") return false;
  return exclusiveLookup.value.get(row.item.itemId)?.dropped ?? false;
}

function getItemBadgeText(row) {
  if (row.setKey === "newExclusive" && !isExclusiveObtained(row)) return "NEW";
  return "";
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function collectAllEntries(panel) {
  const entries = [];
  for (const row of panel.rows) {
    if (row.type === "group") {
      entries.push(...row.items);
    } else {
      entries.push(row.item);
    }
  }
  return entries;
}

function computePanelPreviewEntries(panel) {
  if (panel.key === "guaranteed") {
    const rotatingRow = panel.rows.find(
      (row) => row.type === "item" && row.setKey === "guaranteedItem"
    );
    return rotatingRow
      ? [{ key: `${panel.key}-guaranteedItem`, entry: rotatingRow.item }]
      : [];
  }

  if (panel.key === "exclusive") {
    const newRow = panel.rows.find(
      (row) => row.type === "item" && row.setKey === "newExclusive"
    );
    return newRow
      ? [{ key: `${panel.key}-newExclusive`, entry: newRow.item, badgeText: "NEW" }]
      : [];
  }

  if (panel.key === "uncommon" || panel.key === "rare") {
    const weaponSetKey = panel.key === "uncommon" ? "uncommonWeapons" : "rareWeapons";
    const weaponGroup = panel.rows.find(
      (row) => row.type === "group" && row.setKey === weaponSetKey
    );
    if (weaponGroup?.items.length) {
      const entry = pickRandom(weaponGroup.items);
      return [{ key: `${panel.key}-weapon-preview`, entry }];
    }
  }

  if (panel.key === "commonLeft" || panel.key === "commonRight" || panel.key === "superRare") {
    const entries = collectAllEntries(panel);
    if (entries.length) {
      const entry = pickRandom(entries);
      return [{ key: `${panel.key}-preview`, entry }];
    }
  }

  return [];
}

function computeRowPreviewEntries(row) {
  if (row.type !== "group" || !row.items.length) {
    return [];
  }

  const randomPreviewSlots = [
    "dyeKits",
    "glyphs",
    "nodes",
    "uncommonWeapons",
    "rareWeapons",
  ];

  if (randomPreviewSlots.includes(row.setKey)) {
    return [{ key: `${row.key}-preview`, entry: pickRandom(row.items) }];
  }

  return [];
}

const percentModeDescription = computed(() => {
  if (percentMode.value === "perChest") {
    return "Percentages below reflect the chance to receive the item per chest opened.  The total chance to get a 5th drop is 10%.";
  }

  return "Golden keys guarantee a 5th drop.  Percentages are adjusted to show the chance per 5th-drop roll.";
});

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
  if (percent >= 1) {
    return `${percent.toFixed(2)}%`;
  }

  if (percent >= 0.1) {
    return `${percent.toFixed(3)}%`;
  }

  if (percent > 0) {
    return `${percent.toFixed(4)}%`;
  }

  return `${percent.toFixed(2)}%`;
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
  min-width: 30px;
}

.panel-preview-icons--group {
  gap: 3px;
  min-width: 36px;
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

.loot-entry__icon-wrap {
  position: relative;
  flex: 0 0 auto;
}

.loot-entry__badge {
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

.loot-entry__obtained-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
}

.loot-entry__percent {
  flex: 0 0 auto;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.percent-mode-toggle-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.percent-mode-toggle .v-btn {
  min-width: 36px;
}

.percent-mode-label {
  line-height: 1;
}

.percent-mode-hint {
  display: flex;
  align-items: center;
  padding: 8px 18px;
}
</style>
