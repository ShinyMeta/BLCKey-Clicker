<template>
  <div class="d-flex flex-column align-center pa-4">
    <v-card class="d-flex flex-column align-center pa-4 ma-4">
      <v-card-title>GAME OVER</v-card-title>
      <v-card-text>
        <p>You missed your chance to drop the <span class="exclusive-name">{{ props.missedExclusive.label }}</span>.</p>
        <p>Your FOMO is immeasurable, and your day is ruined.</p>
      </v-card-text>
      <WolverineItemImage :item="props.missedExclusive" />
      <v-card-actions>
        <v-btn
          prepend-icon="mdi-restart"
          color="primary"
          variant="tonal"
          @click="handleNewGameClick"
        >
          Play Again?
        </v-btn>
        <ShareGameEndButton :missed-exclusive="props.missedExclusive" />
      </v-card-actions>
    </v-card>

  </div>
</template>


<script setup>
import WolverineItemImage from "../shared/WolverineItemImage.vue";
import ShareGameEndButton from "./ShareGameEndButton.vue";
import { useBLCKeyClickerController } from '@/store/BLCKeyClickerController';

const controller = useBLCKeyClickerController();

const props = defineProps({
  missedExclusive: {
    type: Object,
    required: true,
  },
});

function handleNewGameClick() {
  controller.newGameReset();
}
</script>

<style scoped>
.exclusive-name {
  font-weight: bold;
  color: #FFAA00;
}
</style>