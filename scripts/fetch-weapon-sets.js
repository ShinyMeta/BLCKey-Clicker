const client = require("gw2api-client");
const cacheMemory = require("gw2api-client/src/cache/memory");
const fs = require("fs");
const path = require("path");

const api = client();
api.cacheStorage(cacheMemory());

const OUTPUT = path.join(__dirname, "../src/store/loot/config/sets/weapons.json");
const CATEGORY_ID = 76;

async function main() {
  console.log(`Fetching achievement category ${CATEGORY_ID}...`);
  const category = await api.achievements().categories().get(CATEGORY_ID);
  console.log(`Category "${category.name}" has ${category.achievements.length} achievement IDs`);

  console.log("Fetching achievement details...");
  const achievements = await api.achievements().many(category.achievements);
  console.log(`Fetched ${achievements.length} achievements`);

  const EXCLUDED = [
    "Gold Essence Weapon Collection",
    "Aetherized Weapon Collection",
    "Privateer Weapon Collection",
  ];
  const weaponSets = achievements.filter(
    (a) =>
      a.bits &&
      a.bits.length > 0 &&
      a.bits[0].type === "Skin" &&
      !EXCLUDED.includes(a.name)
  );
  console.log(`Found ${weaponSets.length} weapon sets (bits[0].type === "Skin")`);

  const allSkinIds = weaponSets.flatMap((a) => a.bits.map((b) => b.id));
  console.log(`Fetching ${allSkinIds.length} skin details...`);
  const skins = await api.skins().many(allSkinIds);
  const skinMap = Object.fromEntries(skins.map((s) => [s.id, s]));

  const sets = {};
  for (const achievement of weaponSets) {
    const items = achievement.bits.map((bit) => {
      const skin = skinMap[bit.id];
      return {
        skinId: bit.id,
        label: skin ? skin.name : `Unknown Skin ${bit.id}`,
      };
    });
    sets[achievement.name] = { items };
  }

  const output = { sets };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(sets).length} weapon sets to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
