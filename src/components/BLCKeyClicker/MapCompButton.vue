<template>
  <button
    class="map-comp-btn"
    :class="{ clicked: isClicked }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <img :src="mapCompImg" alt="Map Completion" class="map-comp-img" />
  </button>
</template>

<script setup>
import { ref } from "vue";
import mapCompImg from "@/assets/MapComp/MapComp.png";

const emit = defineEmits(["click"]);
const isClicked = ref(false);

function onMouseDown() {
  isClicked.value = true;
}

function onMouseUp() {
  if (isClicked.value) {
    isClicked.value = false;
    emit("click");
  }
}
</script>

<style scoped>
.map-comp-btn {
  all: unset;
  user-select: none;
  cursor: pointer;
  display: inline-block;
  border-radius: 50%;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.map-comp-btn:hover {
  animation: bounce-hover 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.map-comp-btn.clicked {
  animation: bounce-click 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.map-comp-img {
  display: block;
  max-width: 100%;
  height: auto;
  pointer-events: none;
}

@keyframes bounce-hover {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(0.95);
  }
  70% {
    transform: scale(1.08);
  }
  85% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1.05);
  }
}

@keyframes bounce-click {
  0% {
    transform: scale(1.05);
  }
  20% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(0.92);
  }
  85% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
</style>
