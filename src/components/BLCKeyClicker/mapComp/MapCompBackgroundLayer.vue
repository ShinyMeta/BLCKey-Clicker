<template>
  <div class="map-comp-bg-layer" ref="layerEl">
    <img
      v-for="particle in particles"
      :key="particle.id"
      :src="particle.src"
      class="bg-particle"
      :style="particle.style"
      @animationend="removeParticle(particle.id)"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useMapCompStore } from "@/store/mapCompStore";

import HeartImg from "@/assets/MapComp/Heart.png";
import HeroPointImg from "@/assets/MapComp/HeroPoint.png";
import PoiImg from "@/assets/MapComp/Poi.png";
import VistaImg from "@/assets/MapComp/Vista.png";
import WaypointImg from "@/assets/MapComp/Waypoint.png";

const MAX_PARTICLES = 50;

const particleImages = [HeartImg, HeroPointImg, PoiImg, VistaImg, WaypointImg];

// Persistent Image objects prevent the browser from dropping decoded image data
const _particleImageAnchors = [];
particleImages.forEach((src) => {
  const img = new Image();
  img.src = src;
  _particleImageAnchors.push(img);
});

const mapCompStore = useMapCompStore();
const { mapCompProgress } = storeToRefs(mapCompStore);

const layerEl = useTemplateRef("layerEl");
const particles = ref([]);
let nextId = 0;
let resizeObserver;

function updateHeight() {
  if (layerEl.value) {
    layerEl.value.style.setProperty(
      "--layer-height",
      `${layerEl.value.offsetHeight}px`
    );
  }
}

onMounted(() => {
  updateHeight();
  resizeObserver = new ResizeObserver(updateHeight);
  resizeObserver.observe(layerEl.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

function spawnParticle() {
  const src = particleImages[Math.floor(Math.random() * particleImages.length)];
  const xPos = 10 + Math.random() * 80;
  const rotEnd = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 300);
  const duration = 2.5 + Math.random() * 1.5;
  const size = 20 + Math.random() * 12;
  const delay = Math.random() * 0.15;

  particles.value.push({
    id: nextId++,
    src,
    style: {
      left: `${xPos}%`,
      width: `${size}px`,
      height: `${size}px`,
      "--rot-end": `${rotEnd}deg`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    },
  });
  if (particles.value.length > MAX_PARTICLES) {
    particles.value.splice(0, particles.value.length - MAX_PARTICLES);
  }
}

function removeParticle(id) {
  particles.value = particles.value.filter((p) => p.id !== id);
}

watch(mapCompProgress, () => {
  spawnParticle();
});
</script>

<style scoped>
.map-comp-bg-layer {
  grid-area: 1 / 1;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
  overflow: hidden;
}

.bg-particle {
  position: absolute;
  top: -32px;
  object-fit: contain;
  opacity: 0;
  will-change: transform, opacity;
  transform: translateX(-50%);
  animation: particle-fall linear forwards;
}

@keyframes particle-fall {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  8% {
    opacity: 0.65;
  }
  65% {
    opacity: 0.45;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(var(--layer-height)) rotate(var(--rot-end));
  }
}
</style>
