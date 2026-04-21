<template>
  <v-list-item
    class="dex-collectable-list-item px-2"
    min-height="48"
    variant="text"
  >
    <template #prepend>
      <div class="mr-2">
        <v-avatar
          v-if="isUnknown"
          size="32"
          color="grey-darken-1"
          variant="tonal"
        >
          <v-icon color="grey-lighten-4">
            mdi-help
          </v-icon>
        </v-avatar>
        <ItemImage
          v-else
          :item="node"
          :size="32"
          rounded="circle"
          :completed="isCollected"
        />
      </div>
    </template>

    <v-list-item-title>
      <div class="text-caption text-medium-emphasis font-weight-medium">
        {{ dexNumberText }}
      </div>
      <div class="text-body-2 text-truncate">
        {{ displayLabel }}
      </div>
    </v-list-item-title>
  </v-list-item>
</template>

<script setup>
import { computed } from "vue";
import ItemImage from "@/components/BLCKeyClicker/shared/ItemImage.vue";

const props = defineProps({
  reactiveNode: {
    type: Object,
    default: null,
  },
  dexNumber: {
    type: Number,
    required: true,
  },
});

const node = computed(() => props.reactiveNode?.node ?? null);
const isUnknown = computed(() => props.reactiveNode?.isUnknown.value ?? true);
const isCollected = computed(() => props.reactiveNode?.isCollected.value ?? false);

const dexNumberText = computed(() => {
  const safeDexNumber = Math.max(1, Number(props.dexNumber) || 1);
  return `No. ${String(safeDexNumber).padStart(3, "0")}`;
});

const displayLabel = computed(() => (isUnknown.value ? "???" : node.value?.label ?? "???"));
</script>

<style scoped>

</style>