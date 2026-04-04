<template>
  <canvas
    ref="canvasEl"
    class="map-comp-bg-layer"
    aria-hidden="true"
  />
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useMapCompStore } from "@/store/mapCompStore";

import HeartImg from "@/assets/MapComp/Heart.png";
import HeroPointImg from "@/assets/MapComp/HeroPoint.png";
import PoiImg from "@/assets/MapComp/Poi.png";
import VistaImg from "@/assets/MapComp/Vista.png";
import WaypointImg from "@/assets/MapComp/Waypoint.png";

const MAX_PARTICLES = 50;
const PARTICLE_START_Y = -32;
const PARTICLE_MAX_OPACITY = 0.65;
const PARTICLE_FADE_START_PROGRESS = 0.65;

const particleImages = [HeartImg, HeroPointImg, PoiImg, VistaImg, WaypointImg];

const particleSprites = particleImages.map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const mapCompStore = useMapCompStore();
const { mapCompProgress } = storeToRefs(mapCompStore);

const canvasEl = useTemplateRef("canvasEl");

let particles = [];
let nextId = 0;
let resizeObserver;
let ctx = null;
let rafId = 0;
let canvasWidth = 0;
let canvasHeight = 0;

function resizeCanvas() {
  const canvas = canvasEl.value;
  if (!canvas || !ctx) {
    return;
  }

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) {
    return;
  }

  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  canvasWidth = width;
  canvasHeight = height;
}

function getParticleOpacity(progress) {
  if (progress <= 0 || progress >= 1) {
    return 0;
  }

  if (progress < PARTICLE_FADE_START_PROGRESS) {
    return PARTICLE_MAX_OPACITY;
  }

  const fadeT =
    (progress - PARTICLE_FADE_START_PROGRESS) / (1 - PARTICLE_FADE_START_PROGRESS);
  return PARTICLE_MAX_OPACITY * (1 - fadeT);
}

function drawParticle(particle, progress, opacity) {
  if (!ctx || !canvasWidth || !canvasHeight) {
    return;
  }

  const x = canvasWidth * particle.xNormalized;
  const y = PARTICLE_START_Y + canvasHeight * progress;
  const rotation = particle.rotEndRad * progress;

  ctx.save();
  ctx.translate(x, y + particle.size / 2);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.drawImage(
    particle.sprite,
    -particle.size / 2,
    -particle.size / 2,
    particle.size,
    particle.size
  );
  ctx.restore();
}

function renderFrame(now) {
  if (!ctx) {
    rafId = 0;
    return;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const clipRadius = Math.min(canvasWidth, canvasHeight) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, canvasHeight / 2, clipRadius, 0, Math.PI * 2);
  ctx.clip();

  const activeParticles = [];
  for (const particle of particles) {
    const elapsed = now - particle.startAt;
    if (elapsed < 0) {
      activeParticles.push(particle);
      continue;
    }

    const progress = elapsed / particle.durationMs;
    if (progress >= 1) {
      continue;
    }

    const opacity = getParticleOpacity(progress);
    if (opacity > 0) {
      drawParticle(particle, progress, opacity);
    }

    activeParticles.push(particle);
  }

  particles = activeParticles;
  ctx.restore();
  if (particles.length > 0) {
    rafId = requestAnimationFrame(renderFrame);
    return;
  }

  rafId = 0;
}

function ensureRenderLoop() {
  if (rafId || !ctx) {
    return;
  }

  rafId = requestAnimationFrame(renderFrame);
}

function spawnParticle() {
  const sprite = particleSprites[Math.floor(Math.random() * particleSprites.length)];
  if (!sprite) {
    return;
  }

  const xNormalized = 0.1 + Math.random() * 0.8;
  const rotEndDeg = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 300);
  const durationMs = (2.5 + Math.random() * 1.5) * 1000;
  const size = 20 + Math.random() * 12;
  const delayMs = Math.random() * 150;

  particles.push({
    id: nextId++,
    sprite,
    xNormalized,
    rotEndRad: (rotEndDeg * Math.PI) / 180,
    durationMs,
    size,
    startAt: performance.now() + delayMs,
  });

  if (particles.length > MAX_PARTICLES) {
    particles.splice(0, particles.length - MAX_PARTICLES);
  }

  ensureRenderLoop();
}

onMounted(() => {
  const canvas = canvasEl.value;
  if (!canvas) {
    return;
  }

  ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  resizeCanvas();
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    if (particles.length > 0) {
      ensureRenderLoop();
    }
  });
  resizeObserver.observe(canvas);

  if (particles.length > 0) {
    ensureRenderLoop();
  }
});

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  resizeObserver?.disconnect();
  particles = [];
  ctx = null;
});

watch(mapCompProgress, () => {
  spawnParticle();
});
</script>

<style scoped>
.map-comp-bg-layer {
  grid-area: 1 / 1;
  display: block;
  width: var(--map-comp-ring-size, 400px);
  height: var(--map-comp-ring-size, 400px);
  border-radius: 50%;
  pointer-events: none;
  overflow: hidden;
}
</style>
