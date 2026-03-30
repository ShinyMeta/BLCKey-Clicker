<template>
  <div class="center-panel">
    <ActiveChestCycle v-if="!isTimeUp" />
    <BetweenChestCycles v-else />
  </div>
</template>

<script setup>
  import { computed } from "vue";
  import ActiveChestCycle from './ActiveChestCycle.vue';
  import BetweenChestCycles from './BetweenChestCycles.vue';
  import { useTimerStore } from '@/store/timerStore';

  const timer = useTimerStore();
  const isTimeUp = computed(() => timer.isTimeUp);
</script>

<style scoped>

.center-panel {
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