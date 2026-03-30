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
      <img
        :src="chestTopSrc"
        alt="Open Chest"
        class="chest-half chest-top"
        :class="{ opened: lidOpen, closing: isClosing }"
      />
      <div
        class="chest-glow-wrap"
        :class="{ active: glowActive }"
      >
        <img
          :src="chestInsideGlowSrc"
          alt=""
          class="chest-inside-glow"
          :class="{ active: glowActive }"
        />
      </div>
      <img
        :src="chestInsideFlashSrc"
        alt=""
        class="chest-inside-flash"
        :class="{ active: flashActive }"
      />
      <img :src="chestBottomSrc" alt="" class="chest-half chest-bottom" />
    </div>
  </button>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import chestAppearances from "@/assets/BLCOpenUI/chestHalf";
import chestInsideGlowSrc from "@/assets/BLCOpenUI/chestInsideGlow.png";
import chestInsideFlashSrc from "@/assets/BLCOpenUI/chestInsideFlash.png";
import { emitSoundEvent } from "@/services/sound";
import { useTimerStore } from "@/store/timerStore";

const emit = defineEmits(["click"]);
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  appearanceType: {
    type: Number,
    default: 0,
  },
});

const chestTopSrc = computed(() => chestAppearances[props.appearanceType]?.top ?? chestAppearances[0].top);
const chestBottomSrc = computed(() => chestAppearances[props.appearanceType]?.bottom ?? chestAppearances[0].bottom);

const isPressed = ref(false);
const isShaking = ref(false);
const lidOpen = ref(false);
const isClosing = ref(false);
const flashActive = ref(false);
const glowActive = ref(false);
const activeTimeouts = new Set();
let animationRunId = 0;

const timer = useTimerStore();
const disabledByTimer = computed(() => !timer.isActiveChestCycle || timer.isPaused);


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
  isClosing.value = false;
  flashActive.value = false;
  glowActive.value = false;
}

function reset() {
  animationRunId += 1;
  clearTimers();
  resetState();
}

function close() {
  const currentRunId = ++animationRunId;
  clearTimers();
  isClosing.value = true;
  glowActive.value = false;

  schedule(() => {
    if (currentRunId !== animationRunId) return;
    resetState();
  }, 350);
}

async function playOpenAnimation() {
  reset();
  const currentRunId = animationRunId;
  await nextTick();

  if (currentRunId !== animationRunId) return;

  isPressed.value = true;

  schedule(() => {
    if (currentRunId !== animationRunId) return;
    isPressed.value = false;
    flashActive.value = true;
  }, 100);  // flash starts

  schedule(() => {
    if (currentRunId !== animationRunId) return;
    lidOpen.value = true;
    glowActive.value = true;
  }, 500);  // chest opens

  schedule(() => {
    if (currentRunId !== animationRunId) return;
    flashActive.value = false;
  }, 700);  // flash ends

  schedule(() => {
    if (currentRunId !== animationRunId) return;
    resetState();
  }, 12000);  //auto close if exposed .close isn't called by lootRow
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
  // props.locked is animation locked by loot row through parent
  if (props.locked || disabledByTimer.value) return;

  if (props.disabled) {
    emitSoundEvent("chestDisabled");
    playDisabledShake();
    return;
  }

  emit("click");
  playOpenAnimation();
}

defineExpose({ reset, close });

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
  display: block;
  width: 200px;
  transition: transform 0.16s ease-out;
  will-change: transform;
}

.chest-image-wrap::before {
  content: "";
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(var(--v-theme-on-background), 0.45) 0%,
    transparent 70%
  );
  pointer-events: none;
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
}

.chest-top.opened {
  animation: lid-open 0.7s ease-out forwards;
}

.chest-top.closing {
  animation: lid-slam 0.24s cubic-bezier(0.18, 0.89, 0.32, 1.0) forwards;
}

.chest-inside-flash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  pointer-events: none;
  opacity: 0;
}

.chest-glow-wrap {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 125%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 100ms ease-out;
  will-change: opacity;
}

.chest-glow-wrap.active {
  opacity: 1;
  transition-duration: 1000ms;
}

.chest-inside-glow {
  width: 100%;
  height: auto;
  opacity: 0.75;
}

.chest-inside-glow.active {
  animation: glow-breathe 1.8s ease-in-out 0.4s infinite;
}

.chest-inside-flash.active {
  animation: flash-burst 0.5s ease-out forwards;
}

@keyframes lid-open {
  0% {
    transform: translateY(0);
  }
  38% {
    transform: translateY(-82%);
  }
  52% {
    transform: translateY(-55%);
  }
  72% {
    transform: translateY(-74%);
  }
  100% {
    transform: translateY(-72%);
  }
}

@keyframes lid-slam {
  0% {
    transform: translateY(-72%);
  }
  85% {
    transform: translateY(6%);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes flash-burst {
  0% {
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes glow-breathe {
  0%,
  100% {
    opacity: 0.75;
  }
  50% {
    opacity: 0.35;
  }
}

@keyframes chest-press {
  0% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(0.98);
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
