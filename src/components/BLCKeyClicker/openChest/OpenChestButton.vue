<template>
  <button
    type="button"
    class="chest-btn"
    :class="{ pressed: isPressed }"
    @click="handleClick"
  >
    <div class="chest-image-wrap">
      <img :src="chestSrc" alt="" class="chest-half chest-base" />
      <img
        :src="chestSrc"
        alt="Open Chest"
        class="chest-half chest-lid"
        :class="{ opened: lidOpen }"
      />
      <div class="chest-glow" :class="{ visible: lidOpen }" />
    </div>
  </button>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from "vue";
import chestSrc from "@/assets/BLCOpenUI/BasicChestUI.png";

const emit = defineEmits(["click"]);

const isPressed = ref(false);
const lidOpen = ref(false);
const activeTimeouts = new Set();
let animationRunId = 0;

function schedule(callback, delay) {
  const timeoutId = window.setTimeout(() => {
    activeTimeouts.delete(timeoutId);
    callback();
  }, delay);

  activeTimeouts.add(timeoutId);
}

function clearTimers() {
  for (const timeoutId of activeTimeouts) {
    window.clearTimeout(timeoutId);
  }

  activeTimeouts.clear();
}

function resetState() {
  isPressed.value = false;
  lidOpen.value = false;
}

function reset() {
  animationRunId += 1;
  clearTimers();
  resetState();
}

async function playOpenAnimation() {
  reset();
  const currentRunId = animationRunId;
  await nextTick();

  if (currentRunId !== animationRunId) {
    return;
  }

  isPressed.value = true;

  schedule(() => {
    isPressed.value = false;
    lidOpen.value = true;
  }, 120);

  schedule(() => {
    resetState();
  }, 10000);
}

function handleClick() {
  emit("click");
  playOpenAnimation();
}

defineExpose({ reset });

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped>
.chest-btn {
  all: unset;
  cursor: pointer;
  display: inline-block;
  transition: transform 0.16s ease-out;
  will-change: transform;
}

.chest-btn:hover {
  transform: scale(1.03);
}

.chest-btn.pressed {
  animation: chest-press 0.12s ease-out forwards;
}

.chest-image-wrap {
  position: relative;
  display: inline-block;
  width: 200px;
}

.chest-half {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.chest-base {
  clip-path: inset(50% 0 0 0);
}

.chest-lid {
  position: absolute;
  top: 0;
  left: 0;
  clip-path: inset(0 0 50% 0);
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chest-lid.opened {
  transform: translateY(-35%);
}

.chest-glow {
  position: absolute;
  left: 5%;
  right: 5%;
  top: 50%;
  height: 8px;
  transform: translateY(-50%) scaleX(0);
  opacity: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 180, 0, 0.5) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(3px);
  transition: transform 0.4s ease-out 0.1s, opacity 0.4s ease-out 0.1s;
  pointer-events: none;
}

.chest-glow.visible {
  transform: translateY(-50%) scaleX(1);
  opacity: 1;
}

@keyframes chest-press {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.92);
  }
}
</style>
