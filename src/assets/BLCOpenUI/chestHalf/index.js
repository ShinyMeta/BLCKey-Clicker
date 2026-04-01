const modules = import.meta.glob('./*-*.png', { eager: true, import: 'default' });

const chestAppearances = {};

for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/\.\/(\d+)-(top|bottom)\.png$/);
  if (!match) continue;
  const index = Number(match[1]);
  const half = match[2];
  if (!chestAppearances[index]) chestAppearances[index] = {};
  chestAppearances[index][half] = url;
}

export default chestAppearances;
