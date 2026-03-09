<template>
  <div class="loot-chest-container">
    <button
      class="chest-btn"
      :class="{ pressed: isPressed, clickable: !isOpened }"
      :disabled="isOpened"
      @click="openChest"
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

    <div class="loot-row">
      <div
        v-for="(src, index) in lootSources"
        :key="index"
        class="loot-slot"
        :class="{ revealed: showLoot }"
        :style="{ '--fly-delay': `${index * 150}ms` }"
      >
        <img :src="src" alt="Loot" class="loot-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import chestSrc from "@/assets/BLCOpenUI/BasicChestUI.png";
import noRewardImg from "@/assets/noRewardItem.png";

// const props = 
defineProps({
  lootSources: {
    type: Array,
    default: () => Array(5).fill(noRewardImg),
  },
});

const emit = defineEmits(["open"]);

const isOpened = ref(false);
const isPressed = ref(false);
const lidOpen = ref(false);
const showLoot = ref(false);

function openChest() {
  if (isOpened.value) return;
  isOpened.value = true;
  isPressed.value = true;

  setTimeout(() => {
    isPressed.value = false;
    lidOpen.value = true;
  }, 120);

  setTimeout(() => {
    showLoot.value = true;
    emit("open");
  }, 600);
}

function reset() {
  isOpened.value = false;
  isPressed.value = false;
  lidOpen.value = false;
  showLoot.value = false;
}

defineExpose({ reset });
</script>

<style scoped>
.loot-chest-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.chest-btn {
  all: unset;
  cursor: pointer;
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.chest-btn:disabled {
  cursor: default;
}

.chest-btn.clickable:hover {
  animation: chest-hover 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
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

@keyframes chest-hover {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(0.97);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1.03);
  }
}

@keyframes chest-press {
  0% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(0.92);
  }
}
</style>
