<template>
  <div class="dex-menu pa-2 d-flex flex-column ga-3">
    <div class="d-flex align-center">
      <v-btn
        variant="text"
        density="comfortable"
        prepend-icon="mdi-chevron-left"
        :disabled="!canGoBack"
        @click="goBack"
      >
        back
      </v-btn>

      <v-spacer />

      <v-btn-toggle
        v-model="dexDisplayBehavior"
        mandatory
        density="comfortable"
        color="primary"
        variant="outlined"
      >
        <v-tooltip
          location="top"
          text="Collections with collected entries"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              :value="DEX_DISPLAY_BEHAVIOR.SHOW_COLLECTED"
              icon="mdi-check-circle"
              v-bind="tooltipProps"
            />
          </template>
        </v-tooltip>

        <v-tooltip
          location="top"
          text="Collections with seen entries"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              :value="DEX_DISPLAY_BEHAVIOR.SHOW_SEEN"
              icon="mdi-eye"
              v-bind="tooltipProps"
            />
          </template>
        </v-tooltip>

        <v-tooltip
          location="top"
          text="Show all"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              :value="DEX_DISPLAY_BEHAVIOR.SHOW_ALL"
              icon="mdi-notebook"
              v-bind="tooltipProps"
            />
          </template>
        </v-tooltip>
      </v-btn-toggle>
    </div>

    <DexCollectionCard
      v-if="currentReactiveNode"
      :reactive-node="currentReactiveNode"
      :display-behavior="dexDisplayBehavior"
    />

    <v-divider />

    <div
      v-if="hiddenCollectionCount > 0"
      class="d-flex align-center ga-2 px-2 text-caption text-info"
    >
      <v-icon
        icon="mdi-information-outline"
        color="info"
        size="18"
      />
      <span>
        {{ hiddenCollectionCount }} {{ hiddenCollectionCount === 1 ? "collection" : "collections" }} hidden by settings.
      </span>
    </div>

    <v-divider v-if="hiddenCollectionCount > 0" />

    <div
      v-if="displayChildren.length"
      class="d-flex flex-column ga-1"
    >
      <template
        v-for="reactiveNode in displayChildren"
        :key="reactiveNode.uniqueId.value"
      >
        <DexCollectableListItem
          v-if="reactiveNode.isLeaf.value"
          :reactive-node="reactiveNode"
          :dex-number="reactiveNode.dexNumber"
        />
        <DexCollectionCard
          v-else
          :reactive-node="reactiveNode"
          :display-behavior="dexDisplayBehavior"
          clickable
          @click="openCollection(reactiveNode)"
        />
      </template>
    </div>

    <div
      v-else
      class="text-body-2 text-medium-emphasis pa-3"
    >
      No entries.
    </div>
  </div>
</template>

<script setup>
import { computed, shallowRef } from "vue";
import { storeToRefs } from "pinia";
import DexCollectableListItem from "@/components/BLCKeyClicker/rightPanel/dex/DexCollectableListItem.vue";
import DexCollectionCard from "@/components/BLCKeyClicker/rightPanel/dex/DexCollectionCard.vue";
import { useDexStore } from "@/store/dex/dexStore";
import {
  DEX_DISPLAY_BEHAVIOR,
  useMiscSettingsStore,
} from "@/services/settings/miscSettingsStore";

const dexStore = useDexStore();
const miscSettingsStore = useMiscSettingsStore();

const { dexDisplayBehavior } = storeToRefs(miscSettingsStore);

const dexTreeReactiveIndex = computed(() => dexStore.getDexTreeReactiveIndex);

const rootReactiveNode = computed(() =>
  dexTreeReactiveIndex.value?.getReactiveNode({ label: "BlckéDex" }) ?? null
);

const dexNodeStack = shallowRef([]);

const currentReactiveNode = computed(() => {
  if (!dexNodeStack.value.length) {
    return rootReactiveNode.value;
  }
  return dexNodeStack.value[dexNodeStack.value.length - 1];
});

function hasCollectedEntries(reactiveNode) {
  return (reactiveNode?.collectedCount?.value ?? 0) > 0;
}

function hasSeenEntries(reactiveNode) {
  return (reactiveNode?.seenCount?.value ?? 0) > 0;
}

function shouldShowCollectionCard(reactiveNode) {
  if (dexDisplayBehavior.value === DEX_DISPLAY_BEHAVIOR.SHOW_ALL) {
    return true;
  }

  if (dexDisplayBehavior.value === DEX_DISPLAY_BEHAVIOR.SHOW_SEEN) {
    return hasSeenEntries(reactiveNode);
  }

  return hasCollectedEntries(reactiveNode);
}

const seenVisibleChildren = computed(() => {
  const children = currentReactiveNode.value?.reactiveChildNodes.value ?? [];
  if (dexDisplayBehavior.value === DEX_DISPLAY_BEHAVIOR.SHOW_ALL) {
    return children;
  }
  return children.filter((rn) => hasSeenEntries(rn));
});

const hiddenCollectionCount = computed(() => {
  const children = currentReactiveNode.value?.reactiveChildNodes.value ?? [];
  return children.filter((rn) => !rn.isLeaf.value && !shouldShowCollectionCard(rn)).length;
});

const displayChildren = computed(() => {
  return seenVisibleChildren.value.filter((rn) => rn.isLeaf.value || shouldShowCollectionCard(rn));
});

const canGoBack = computed(() => dexNodeStack.value.length > 0);

// function getReactiveNode(nodeLike) {
//   return dexTreeReactiveIndex.value?.getReactiveNode(nodeLike) ?? null;
// }

// pop node from nav stack
function goBack() {
  if (!canGoBack.value) {
    return;
  }

  dexNodeStack.value = dexNodeStack.value.slice(0, -1);
}

// push node onto nav stack
function openCollection(reactiveNode) {
  if (!reactiveNode || reactiveNode.isLeaf.value) {
    return;
  }

  dexNodeStack.value = [...dexNodeStack.value, reactiveNode];
}
</script>

<style scoped>
.dex-menu {
  max-width: 100%;
}

</style>