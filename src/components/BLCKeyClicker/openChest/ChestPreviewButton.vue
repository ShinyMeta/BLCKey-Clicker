<template>
  <v-dialog v-model="dialogOpen" max-width="980" scrollable>
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="tonal"
        color="primary"
        :disabled="!currentChestConfig"
      >
        <v-icon icon="mdi-eye" start />
        Chest Preview
      </v-btn>
    </template>

    <v-card class="chest-preview-dialog">
      <v-card-title class="chest-preview-dialog__title">
        <div>
          <div class="text-h6">Chest Preview</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ currentChestConfig?.name ?? "No chest loaded" }}
          </div>
        </div>
        <v-chip size="small" variant="outlined">
          5th drop: {{ formatPercent(template.fifthDropChance * 100) }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text class="chest-preview-dialog__content">
        <v-progress-linear v-if="isLoadingMetadata" indeterminate class="mb-4" />

        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            v-for="panel in previewPanels"
            :key="panel.key"
            :title="panel.title"
          >
            <template #title>
              <div class="panel-header">
                <div>
                  <div class="text-subtitle-1">{{ panel.title }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ panel.subtitle }}
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
                          <div class="text-subtitle-2">{{ row.label }}</div>
                          <v-chip size="small" variant="tonal">
                            {{ formatPercent(getRowPercent(row.totalWeight, panel.denominator)) }}
                          </v-chip>
                        </div>
                      </template>

                      <template #text>
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
import { storeToRefs } from "pinia";
import noRewardImg from "@/assets/noRewardItem.png";
import template from "@/loot/config/template.json";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";

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

const saveStore = useBLCKeyClickerSaveStore();
const { currentChestConfig } = storeToRefs(saveStore);

const dialogOpen = ref(false);
const isLoadingMetadata = ref(false);
const itemMetadata = ref({});
const skinMetadata = ref({});
const lastLoadedSignature = ref("");

function getSlotLabel(slotKey, setConfig) {
  if (slotKey === "uncommonWeapons" || slotKey === "rareWeapons") {
    return setConfig?.name ?? SLOT_TITLES[slotKey] ?? slotKey;
  }

  return SLOT_TITLES[slotKey] ?? slotKey;
}

function resolveCategoryRows(categoryKey) {
  const category = template[categoryKey];
  const sets = currentChestConfig.value?.sets ?? {};
  const rows = [];
  let poolWeight = 0;

  for (const [index, item] of (category.items ?? []).entries()) {
    rows.push({
      type: "item",
      key: `${categoryKey}-fixed-${item.itemId ?? index}`,
      item: {
        ...item,
        quantity: item.quantity ?? 1,
      },
      weight: item.weight ?? null,
    });

    if (item.weight != null) {
      poolWeight += item.weight;
    }
  }

  for (const slot of category.slots ?? []) {
    const setConfig = sets[slot.setKey];
    if (!setConfig?.items?.length) {
      continue;
    }

    const fallbackWeight =
      slot.weightPerItem ??
      (slot.totalWeight != null ? slot.totalWeight / setConfig.items.length : null);

    const resolvedItems = setConfig.items.map((item, index) => ({
      ...item,
      key: `${categoryKey}-${slot.setKey}-${item.skinId ?? item.itemId ?? index}`,
      quantity: item.quantity ?? 1,
      weight: item.weight ?? fallbackWeight,
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
        label: getSlotLabel(slot.setKey, setConfig),
        totalWeight: slotTotalWeight,
        items: resolvedItems,
      });
      continue;
    }

    rows.push({
      type: "item",
      key: `${categoryKey}-${slot.setKey}`,
      item: resolvedItems[0],
      weight: slotTotalWeight,
    });
  }

  return {
    rows,
    poolWeight,
  };
}

const rawPanels = computed(() =>
  CATEGORY_ORDER.map((categoryKey) => ({
    key: categoryKey,
    title: CATEGORY_TITLES[categoryKey],
    ...resolveCategoryRows(categoryKey),
  }))
);

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

    let subtitle = "Always included when opening a chest.";
    let poolPercentText = "";

    if (panel.key === "commonLeft" || panel.key === "commonRight") {
      subtitle = "One item rolls from this pool on every chest.";
    } else if (isFifthDropPanel) {
      const poolSharePercent = getRowPercent(panel.poolWeight, fifthDropPoolWeight.value);
      const chestSharePercent = poolSharePercent * template.fifthDropChance;
      subtitle = `${formatPercent(chestSharePercent)} effective chest chance.`;
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
    if (!isOpen || !currentChestConfig.value || !signature || signature === lastLoadedSignature.value) {
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
  gap: 12px;
  flex-wrap: wrap;
}

.chest-preview-dialog__content {
  max-height: 75dvh;
}

.panel-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header--group {
  padding-right: 8px;
}

.preview-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-group {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
}

.loot-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.loot-entry + .loot-entry {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.loot-entry__info {
  display: flex;
  align-items: center;
  gap: 12px;
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
