import { getRandomSound } from "./soundLibrary";
import { useSoundSettingsStore } from "./soundSettingsStore";

const DEFAULT_THROTTLE_MS = 100;

const EVENT_REGISTRY = {
  chestOpen:     { soundKey: "ChestOpen",     channel: "chest",   throttleMs: 500 },
  chestDisabled: { soundKey: "SwishLoud",     channel: "chest",   throttleMs: 250 },
  mapClick:      { soundKey: "FootFall",      channel: "mapComp", throttleMs: DEFAULT_THROTTLE_MS },
  mapComplete:   { soundKey: "Exp",           channel: "mapComp", throttleMs: DEFAULT_THROTTLE_MS },
};

const lastPlayed = new Map();

export function emitSoundEvent(eventName, overrides = {}) {
  const entry = EVENT_REGISTRY[eventName];
  if (!entry) return;

  const soundKey = overrides.soundKey ?? entry.soundKey;
  const channel = overrides.channel ?? entry.channel;
  const effectiveThrottle = overrides.throttleMs ?? entry.throttleMs ?? DEFAULT_THROTTLE_MS;

  const now = performance.now();
  const last = lastPlayed.get(eventName) ?? 0;
  if (now - last < effectiveThrottle) return;
  lastPlayed.set(eventName, now);

  const url = getRandomSound(soundKey);
  if (!url) return;

  const settings = useSoundSettingsStore();
  const vol = settings.effectiveVolume(channel);
  if (vol <= 0) return;

  const audio = new Audio(url);
  audio.volume = vol;
  audio.play().catch(() => {});
}
