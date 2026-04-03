<template>
  <div class="loot-row">
    <div
      v-for="(item, index) in props.items"
      :key="index"
      class="loot-slot"
    >
      <ItemImage 
        :item="item"
        :size="size"
        rounded="0"
        text-overlay-style="shadow"
        text-overlay-position="bottom-center"
        class="loot-item-image"
      />
    </div>
    <v-chip
      density="comfortable"
      prepend-icon="mdi-treasure-chest-outline" 
      variant="flat"
      color="background"
      class="history-loot-row--label-chip"
    >
      {{ props.label }}
    </v-chip>
  </div>
</template>

<script setup>
import ItemImage from "@/components/BLCKeyClicker/shared/ItemImage.vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  size: { type: Number, default: 64 },
  label: { type: String, default: "" },
});
</script>

<style scoped>
.history-loot-row--label-chip {
  position: absolute;
  top: -8px;
  left: -8px;
  pointer-events: none;
}

.loot-row {
  position:relative;
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 8px;
  user-select: none;
}

.loot-slot {
  position:relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loot-item-image {
  display: block;
}
</style>
