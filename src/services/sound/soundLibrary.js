const modules = import.meta.glob("@/assets/Sounds/**/*.{mp3,wav,ogg}", {
  eager: true,
  import: "default",
});

const soundLibrary = new Map();

for (const [path, url] of Object.entries(modules)) {
  const parts = path.split("/");
  const dirName = parts[parts.length - 2];
  if (!soundLibrary.has(dirName)) {
    soundLibrary.set(dirName, []);
  }
  soundLibrary.get(dirName).push(url);
}

export function getRandomSound(key) {
  const sounds = soundLibrary.get(key);
  if (!sounds?.length) return null;
  return sounds[Math.floor(Math.random() * sounds.length)];
}

export function getSoundKeys() {
  return [...soundLibrary.keys()];
}
