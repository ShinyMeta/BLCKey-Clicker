<template>
  <button
    type="button"
    class="chest-btn"
    :class="{ disabled }"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <div
      class="chest-image-wrap"
      :class="{ pressed: isPressed, shaking: isShaking }"
    >
      <div class="chest-glow" :class="{ visible: lidOpen }" />
      <img
        :src="chestTopSrc"
        alt="Open Chest"
        class="chest-half chest-top"
        :class="{ opened: lidOpen }"
      />
      <img :src="chestBottomSrc" alt="" class="chest-half chest-bottom" />
    </div>
  </button>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from "vue";
import chestBottomSrc from "@/assets/BLCOpenUI/chestHalf/2-bottom.png";
import chestTopSrc from "@/assets/BLCOpenUI/chestHalf/2-top.png";

const emit = defineEmits(["click"]);
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const isPressed = ref(false);
const isShaking = ref(false);
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
  isShaking.value = false;
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

async function playDisabledShake() {
  reset();
  const currentRunId = animationRunId;
  await nextTick();

  if (currentRunId !== animationRunId) {
    return;
  }

  isShaking.value = true;

  schedule(() => {
    if (currentRunId !== animationRunId) {
      return;
    }

    isShaking.value = false;
  }, 280);
}

function handleClick() {
  if (props.disabled) {
    playDisabledShake();
    return;
  }

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
  user-select: none;
  cursor: pointer;
  display: inline-block;
}

.chest-btn.disabled {
  cursor: default;
}

.chest-image-wrap {
  position: relative;
  display: inline-block;
  width: 200px;
  transition: transform 0.16s ease-out;
  will-change: transform;
}

.chest-btn:not(.disabled):hover .chest-image-wrap {
  transform: scale(1.03);
}

.chest-image-wrap.pressed {
  animation: chest-press 0.12s ease-out forwards;
}

.chest-image-wrap.shaking {
  animation: chest-shake 0.28s ease-out;
}

.chest-half {
  width: 100%;
  height: auto;
  pointer-events: none;
}

.chest-bottom {
  position: relative;
  display: block;
}

.chest-top {
  position: absolute;
  top: calc(100% * 94 / 256);
  left: 0;
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chest-top.opened {
  transform: translateY(-80%);
}

.chest-glow {
  position: absolute;
  left: 5%;
  right: 5%;
  top: calc(100% * 158 / 256);
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

@keyframes chest-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-4px);
  }
  30% {
    transform: translateX(4px);
  }
  45% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(3px);
  }
  75% {
    transform: translateX(-2px);
  }
  90% {
    transform: translateX(1px);
  }
}
</style>
