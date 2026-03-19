<template>
  <div class="open-chest-panel">
    <div class="chest-controls">
      <div class="left-controls">
        <div class="exclusive-previews">
          <ItemImage
            v-for="item in exclusiveItems"
            :key="item.itemId"
            :item="item"
            class="exclusive-preview"
            :size="48"
            rounded="lg"
            :text-overlay="false"
            :avatar-props="{ class: 'exclusive-preview__icon' }"
          />
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
            <ItemImage
              :item="{
                name: 'Black Lion Chest Key',
                icon: blcKeyImg,
                quantity: inventory.blcKeys,
              }"
              :size="52"
              rounded="lg"
              :tooltip="false"
              :text-overlay="String(inventory.blcKeys)"
              text-overlay-style="shadow"
              text-overlay-position="bottom-center"
              class="key-select-image"
            />
          </div>
        </v-btn>
        <v-btn value="goldenKeys" class="key-select-btn" :class="{ empty: inventory.goldenKeys === 0 }">
          <div class="key-select-content">
            <ItemImage
              :item="{
                name: 'Golden Black Lion Chest Key',
                icon: goldenBlcKeyImg,
                quantity: inventory.goldenKeys,
              }"
              :size="52"
              rounded="lg"
              :tooltip="false"
              :text-overlay="String(inventory.goldenKeys)"
              text-overlay-style="shadow"
              text-overlay-position="bottom-center"
              class="key-select-image"
            />
          </div>
        </v-btn>
      </v-btn-toggle>
    </div>
    <LootRow ref="lootRow" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import blcKeyImg from "@/assets/item/BLCKey.png";
import goldenBlcKeyImg from "@/assets/item/goldenBLCKey.png";
import unknownItem from "@/assets/item/unknown.png";
import ItemImage from "@/components/ItemImage.vue";
import OpenChestButton from "@/components/BLCKeyClicker/openChest/OpenChestButton.vue";
import ChestPreviewDialog from "@/components/BLCKeyClicker/openChest/ChestPreviewDialog.vue";
import LootRow from "@/components/BLCKeyClicker/openChest/LootRow.vue";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";
import { useLootStore } from "@/store/loot/lootStore";
import api from "@/utils/gw2api";

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

.open-chest-panel :deep(.exclusive-preview__icon) {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

/* --- right column: key toggle --- */

.key-toggle {
  height: auto !important;
}

.key-toggle :deep(.v-btn) {
  padding: 6px;
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

.open-chest-panel :deep(.key-select-image .item-image__img) {
  object-fit: contain;
}

.open-chest-panel :deep(.loot-row) {
  width: 100%;
  min-width: var(--loot-row-min-width);
}
</style>
