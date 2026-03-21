<template>
  <div class="loot-row">
    <div
      v-for="(item, index) in lootItems"
      :key="`${animationCycle}-${index}`"
      class="loot-slot"
      :class="{ revealed: showLoot }"
      :style="{ '--fly-delay': `${index * 150}ms` }"
    >
      <ItemImage
        :item="item"
        :size="64"
        rounded="0"
        text-overlay-style="shadow"
        text-overlay-position="bottom-center"
        class="loot-item-image"
      />
    </div>
  </div>
</template>

<script setup>
import ItemImage from "@/components/BLCKeyClicker/ItemImage.vue";
import { nextTick, ref } from "vue";

const lootItems = ref([]);
const showLoot = ref(false);
const animationCycle = ref(0);

function reset() {
  showLoot.value = false;
  lootItems.value = [];
}

async function displayLoot(items = []) {
  reset();
  await nextTick();

  animationCycle.value += 1;
  lootItems.value = [...items];
  showLoot.value = true;
}

defineExpose({
  displayLoot,
  reset,
});
</script>

<style scoped>
.loot-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  min-height: 64px;
}

.loot-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-120px) scale(0);
}

.loot-slot.revealed {
  animation: fly-out 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--fly-delay);
}

.loot-item-image {
  display: block;
}

@keyframes fly-out {
  0% {
    opacity: 0;
    transform: translateY(-120px) scale(0);
  }
  35% {
    opacity: 1;
    transform: translateY(-15px) scale(1.12);
  }
  65% {
    transform: translateY(6px) scale(0.96);
  }
  85% {
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
