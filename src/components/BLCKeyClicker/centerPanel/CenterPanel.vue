<template>
  <div class="center-panel d-flex flex-column">
    <VFadeTransition mode="out-in">
      <NewGame
        v-if="controller.isNewGame"
        key="new"
      />
      <ActiveChestCycle
        v-else-if="controller.isActiveChestCycle"
        key="active"
      />
      <BetweenChestCycles
        v-else-if="controller.isBetweenChestCycles"
        key="between"
      />
      <GameOver
        v-else-if="controller.isGameOver"
        key="gameOver"
        :missed-exclusive="returningExclusive"
      />
    </VFadeTransition>

    <PausedTimerOverlay />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import NewGame from './NewGame.vue';
import ActiveChestCycle from './ActiveChestCycle.vue';
import BetweenChestCycles from './BetweenChestCycles.vue';
import GameOver from './GameOver.vue';
import PausedTimerOverlay from './PausedTimerOverlay.vue';
import { useBLCKeyClickerController } from '@/store/BLCKeyClickerController';
import { useLootStore } from "@/store/loot/lootStore";
import { storeToRefs } from "pinia";

const controller = useBLCKeyClickerController();
const lootStore = useLootStore();

const { currentChestConfig } = storeToRefs(lootStore);
const returningExclusive = computed(() => {
  return currentChestConfig.value?.sets?.returningExclusive?.items?.[0];
});

</script>

<style scoped>

.center-panel {
  position: relative;
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