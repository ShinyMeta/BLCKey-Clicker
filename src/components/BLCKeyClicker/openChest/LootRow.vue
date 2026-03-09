<template>
  <div class="loot-row">
    <div
      v-for="(src, index) in lootSources"
      :key="`${animationCycle}-${index}`"
      class="loot-slot"
      :class="{ revealed: showLoot }"
      :style="{ '--fly-delay': `${index * 150}ms` }"
    >
      <img :src="src" alt="Loot" class="loot-img" />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from "vue";

const lootSources = ref([]);
const showLoot = ref(false);
const animationCycle = ref(0);

function reset() {
  showLoot.value = false;
  lootSources.value = [];
}

async function displayLoot(sources = []) {
  reset();
  await nextTick();

  animationCycle.value += 1;
  lootSources.value = [...sources];
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
  opacity: 0;
  transform: translateY(-120px) scale(0);
}

.loot-slot.revealed {
  animation: fly-out 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--fly-delay);
}

.loot-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
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
