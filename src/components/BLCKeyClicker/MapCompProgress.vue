<template>
  <div class="map-comp-progress">
    <div class="progress-wrapper">
      <v-progress-circular
        :model-value="(progress / clicksToComp) * 100"
        :size="200"
        :width="15"
        color="cyan-darken-3"
        rounded
        class="progress-ring"
      />
      <div class="reward-flyout-layer">
        <img
          v-for="reward in rewardFlyouts"
          :key="reward.id"
          :src="reward.src"
          :alt="reward.alt"
          class="reward-flyout"
          :style="reward.style"
          @animationend="removeRewardFlyout(reward.id)"
        />
      </div>
      <MapCompButton class="centered-btn" @click="handleClick" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import BLCKeyImg from "@/assets/item/BLCKey.png";
import TransmutationChargeImg from "@/assets/item/TransmutationCharge.png";
import MapCompButton from "@/components/BLCKeyClicker/MapCompButton.vue";
import { useBLCKeyClickerSaveStore } from "@/store/BLCKeyClickerSaveStore";

const emit = defineEmits(["click", "mapComplete"]);
const saveStore = useBLCKeyClickerSaveStore();
const {
  mapCompletionClicksToComp: clicksToComp,
  mapCompletionProgress: progress,
} = storeToRefs(saveStore);
const rewardFlyouts = ref([]);
let nextRewardFlyoutId = 0;

const rewardImageByType = {
  key: BLCKeyImg,
  transmutationCharge: TransmutationChargeImg,
};

function getRewardFlyoutStyle() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 95 + Math.random() * 45;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const rotation = -20 + Math.random() * 40;
  const scale = 0.9 + Math.random() * 0.25;

  return {
    "--flyout-x": `${x.toFixed(2)}px`,
    "--flyout-y": `${y.toFixed(2)}px`,
    "--flyout-rotation": `${rotation.toFixed(2)}deg`,
    "--flyout-scale": scale.toFixed(2),
  };
}

function showRewardFlyout(src) {
  rewardFlyouts.value.push({
    id: nextRewardFlyoutId++,
    src,
    alt: "Map completion reward",
    style: getRewardFlyoutStyle(),
  });
}

function removeRewardFlyout(id) {
  rewardFlyouts.value = rewardFlyouts.value.filter((reward) => reward.id !== id);
}

function handleMapComplete() {
  const reward = saveStore.registerMapCompletionClick();

  if (!reward) {
    return;
  }

  const rewardImage = rewardImageByType[reward.type];

  if (rewardImage) {
    showRewardFlyout(rewardImage);
  }

  emit("mapComplete", reward);
}

function handleClick() {
  emit("click");
  handleMapComplete();
}

defineExpose({ progress, showRewardFlyout });
</script>

<style scoped>
.map-comp-progress {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-wrapper {
  position: relative;
  display: grid;
  place-items: center;
  overflow: visible;
}

.progress-ring {
  grid-area: 1 / 1;
}

.reward-flyout-layer {
  grid-area: 1 / 1;
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.centered-btn {
  grid-area: 1 / 1;
}

.reward-flyout {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  object-fit: contain;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.3);
  will-change: transform, opacity;
  animation: reward-flyout 1.6s ease-out forwards;
}

@keyframes reward-flyout {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  20% {
    opacity: 1;
    transform: translate(
        calc(-50% + (var(--flyout-x) * 0.55)),
        calc(-50% + (var(--flyout-y) * 0.55))
      )
      rotate(var(--flyout-rotation)) scale(var(--flyout-scale));
  }
  65% {
    opacity: 1;
    transform: translate(calc(-50% + var(--flyout-x)), calc(-50% + var(--flyout-y)))
      rotate(var(--flyout-rotation)) scale(var(--flyout-scale));
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--flyout-x)), calc(-50% + var(--flyout-y)))
      rotate(var(--flyout-rotation)) scale(var(--flyout-scale));
  }
}
</style>
