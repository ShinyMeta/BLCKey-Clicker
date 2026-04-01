import { getAllUrls } from "./soundLibrary";

let audioCtx = null;
const bufferCache = new Map();
let preloaded = false;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function decodeUrl(url) {
  if (bufferCache.has(url)) return bufferCache.get(url);
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await getContext().decodeAudioData(arrayBuffer);
  bufferCache.set(url, audioBuffer);
  return audioBuffer;
}

async function preloadAll() {
  if (preloaded) return;
  preloaded = true;
  const urls = getAllUrls();
  await Promise.allSettled(urls.map((url) => decodeUrl(url)));
}

/**
 * Resume the AudioContext (required after browser autoplay policy blocks it)
 * and kick off background preloading of every registered sound URL.
 * Safe to call repeatedly; work only happens once.
 */
export async function warmUp() {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  preloadAll();
}

/**
 * Play a pre-decoded audio buffer immediately. Falls back to
 * fetch-decode-play on cache miss (first-play before preload finishes).
 */
export function play(url, volume = 1) {
  const ctx = getContext();
  if (ctx.state === "suspended") ctx.resume();

  const cached = bufferCache.get(url);
  if (cached) {
    playBuffer(ctx, cached, volume);
    return;
  }

  decodeUrl(url)
    .then((buf) => playBuffer(ctx, buf, volume))
    .catch(() => {});
}

function playBuffer(ctx, buffer, volume) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);
}

if (typeof window !== "undefined") {
  const gestureEvents = ["click", "keydown", "touchstart", "pointerdown"];
  const onFirstGesture = () => {
    warmUp();
    gestureEvents.forEach((e) =>
      window.removeEventListener(e, onFirstGesture, true),
    );
  };
  gestureEvents.forEach((e) =>
    window.addEventListener(e, onFirstGesture, { capture: true, once: false }),
  );
}
