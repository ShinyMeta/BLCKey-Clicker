<template>
  <div class="center-panel">
    <VFadeTransition mode="out-in">
      <ActiveChestCycle v-if="isActiveChestCycle" key="active" />
      <BetweenChestCycles v-else-if="isBetweenChestCycles" key="between" />
    </VFadeTransition>

    <PausedTimerOverlay />
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import ActiveChestCycle from './ActiveChestCycle.vue';
  import BetweenChestCycles from './BetweenChestCycles.vue';
  import PausedTimerOverlay from './PausedTimerOverlay.vue';
  import { useTimerStore } from '@/store/timerStore';

  const timer = useTimerStore();

  const isActiveChestCycle = computed(() => timer.isActiveChestCycle);
  const isBetweenChestCycles = computed(() => timer.isBetweenChestCycles);
</script>

<style scoped>

.center-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 64px);
}

.center-pane__top {
  flex: 3;
}

.center-pane__bottom {
  flex: 6;
}

.center-pane__top,
.center-pane__bottom {
  min-height: 300px;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>