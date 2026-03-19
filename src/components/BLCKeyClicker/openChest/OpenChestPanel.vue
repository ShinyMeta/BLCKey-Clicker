<template>
  <div class="open-chest-panel">
    <div class="chest-controls">
      <div class="left-controls">
        <div class="exclusive-previews">
          <div
            v-for="item in exclusiveItems"
            :key="item.itemId"
            class="exclusive-preview"
          >
            <v-avatar rounded="lg" size="48" class="exclusive-preview__icon">
              <v-img :src="item.icon" :alt="item.label" />
            </v-avatar>
            <div
              v-if="item.obtained"
              class="exclusive-preview__check"
            >
              <v-icon color="success" size="20">mdi-check-circle</v-icon>
            </div>
            <span v-if="item.badgeText" class="exclusive-preview__badge">
              {{ item.badgeText }}
            </span>
          </div>
        </div>
        <ChestPreviewDialog :chest-config="currentChestConfig">
          <template #activator="activatorProps">
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
        </ChestPreviewDialog>
      </div>

      <OpenChestButton
        ref="chestButton"
        :disabled="selectedKeyCount === 0"
        @click="handleChestClick"
      />

      <v-btn-toggle
        v-model="selectedKeyType"
        mandatory
        class="key-toggle"
      >
        <v-btn value="blcKeys" class="key-select-btn" :class="{ empty: inventory.blcKeys === 0 }">
          <div class="key-select-content">
            <span class="key-select-count">{{ inventory.blcKeys }}</span>
            <img :src="blcKeyImg" alt="" class="key-select-image" />
          </div>
        </v-btn>
        <v-btn value="goldenKeys" class="key-select-btn" :class="{ empty: inventory.goldenKeys === 0 }">
          <div class="key-select-content">
            <span class="key-select-count">{{ inventory.goldenKeys }}</span>
            <img :src="goldenBlcKeyImg" alt="" class="key-select-image" />
          </div>
        </v-btn>
      </v-btn-toggle>
    </div>
    <LootRow ref="lootRow" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import blcKeyImg from "@/assets/item/BLCKey.png";
import goldenBlcKeyImg from "@/assets/item/goldenBLCKey.png";
import unknownItem from "@/assets/item/unknown.png";
import api from "@/utils/gw2api";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import ChestPreviewDialog from "@/components/BLCKeyClicker/openChest/ChestPreviewDialog.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";
import { useLootStore } from "@/store/loot/lootStore";

const props = defineProps({
  lootRevealDelayMs: {
    type: Number,
    default: 600,
  },
});

const saveStore = useBLCKeyClickerSaveStore();
const lootStore = useLootStore();
const { inventory } = storeToRefs(saveStore);
const { currentChestConfig, exclusiveLookup } = storeToRefs(lootStore);
const chestButton = ref(null);
const lootRow = ref(null);
const selectedKeyType = ref("blcKeys");
const selectedKeyCount = computed(
  () => inventory.value[selectedKeyType.value] ?? 0
);
let lootRevealTimeoutId = null;
let openSequenceId = 0;

const exclusiveIcons = ref({});

watch(currentChestConfig, async (config) => {
  if (!config?.sets) {
    exclusiveIcons.value = {};
    return;
  }
  const itemIds = [];
  for (const setKey of ["newExclusive", "returningExclusive"]) {
    const item = config.sets[setKey]?.items?.[0];
    if (item?.itemId) itemIds.push(item.itemId);
  }
  if (!itemIds.length) return;
  try {
    const items = await api.items().many(itemIds);
    const icons = {};
    for (const item of items) icons[item.id] = item.icon;
    exclusiveIcons.value = icons;
  } catch (error) {
    console.error("Failed to fetch exclusive icons", error);
  }
}, { immediate: true });

const exclusiveItems = computed(() => {
  const config = currentChestConfig.value;
  if (!config?.sets) return [];
  const items = [];
  const lookup = exclusiveLookup.value;
  for (const setKey of ["newExclusive", "returningExclusive"]) {
    const entry = config.sets[setKey]?.items?.[0];
    if (!entry) continue;
    const obtained = lookup.get(entry.itemId)?.dropped ?? false;
    items.push({
      itemId: entry.itemId,
      label: entry.label,
      setKey,
      obtained,
      badgeText: setKey === "newExclusive" && !obtained ? "NEW" : "",
      icon: exclusiveIcons.value[entry.itemId] ?? unknownItem,
    });
  }
  return items;
});

function clearTimers() {
  if (lootRevealTimeoutId !== null) {
    window.clearTimeout(lootRevealTimeoutId);
    lootRevealTimeoutId = null;
  }
}

function handleChestClick() {
  clearTimers();
  lootRow.value?.reset();

  inventory.value[selectedKeyType.value] -= 1;

  const drops = lootStore.open();
  const iconsPromise = resolveDropIcons(drops);
  const thisSequence = ++openSequenceId;

  lootRevealTimeoutId = window.setTimeout(async () => {
    lootRevealTimeoutId = null;
    const icons = await iconsPromise;
    if (thisSequence !== openSequenceId) return;
    lootRow.value?.displayLoot(icons);
  }, props.lootRevealDelayMs);
}

async function resolveDropIcons(drops) {
  const itemIds = [];
  const skinIds = [];

  for (const drop of drops) {
    if (drop.skinId != null) skinIds.push(drop.skinId);
    else if (drop.itemId != null) itemIds.push(drop.itemId);
  }

  try {
    const [items, skins] = await Promise.all([
      itemIds.length ? api.items().many(itemIds) : [],
      skinIds.length ? api.skins().many(skinIds) : [],
    ]);

    const iconById = {};
    for (const entry of items) iconById[`items:${entry.id}`] = entry.icon;
    for (const entry of skins) iconById[`skins:${entry.id}`] = entry.icon;

    return drops.map((drop) => {
      if (drop.skinId != null) return iconById[`skins:${drop.skinId}`] ?? unknownItem;
      if (drop.itemId != null) return iconById[`items:${drop.itemId}`] ?? unknownItem;
      return unknownItem;
    });
  } catch (error) {
    console.error("Failed to fetch drop icons", error);
    return drops.map(() => unknownItem);
  }
}

function reset() {
  clearTimers();
  chestButton.value?.reset();
  lootRow.value?.reset();
}

defineExpose({ reset });

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped>
.open-chest-panel {
  --loot-row-min-width: calc((64px * 5) + (8px * 4));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: var(--loot-row-min-width);
}

.chest-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

/* --- left column: exclusive previews + chest preview button --- */

.left-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.exclusive-previews {
  display: flex;
  gap: 8px;
}

.exclusive-preview {
  position: relative;
}

.exclusive-preview__icon {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.exclusive-preview__check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 8px;
}

.exclusive-preview__badge {
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

/* --- right column: key toggle --- */

.key-toggle {
  height: auto !important;
}

.key-toggle :deep(.v-btn) {
  padding: 4px 6px;
  height: auto !important;
  min-width: 0 !important;
}

.key-toggle :deep(.v-btn.empty) {
  opacity: 0.7;
}

.key-select-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.key-select-image {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 8px;
}

.key-select-count {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

.open-chest-panel :deep(.loot-row) {
  width: 100%;
  min-width: var(--loot-row-min-width);
}
</style>
