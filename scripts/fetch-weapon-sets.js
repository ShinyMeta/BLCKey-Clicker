const client = require("gw2api-client");
const cacheNull = require("gw2api-client/src/cache/null");
const fs = require("fs");
const path = require("path");
const {
  readExistingCatalog,
  mergeItemsByNumericKey,
} = require("./lib/catalog-utils.cjs");

const api = client();
api.cacheStorage(cacheNull());

const OUTPUT = path.join(__dirname, "../src/store/loot/config/sets/weapons.json");
const CATEGORY_ID = 76;

async function main() {
  const existingCatalog = readExistingCatalog(OUTPUT);
  const existingSets = existingCatalog.sets;
  const existingSetsByLabel = new Map(existingSets.map((set) => [set.label, set]));

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

  const allSkinIds = [...new Set(weaponSets.flatMap((a) => a.bits.map((b) => b.id)))];
  console.log(`Fetching ${allSkinIds.length} skin details...`);
  const skins = await api.skins().many(allSkinIds);
  const skinMap = Object.fromEntries(skins.map((s) => [s.id, s]));

  const mergedSetsByLabel = new Map();
  for (const achievement of weaponSets) {
    const setLabel = achievement.name;

    const fetchedItems = achievement.bits.map((bit) => {
      const skin = skinMap[bit.id];
      return {
        skinId: bit.id,
        label: skin ? skin.name : `Unknown Skin ${bit.id}`,
      };
    });

    const existingSet = existingSetsByLabel.get(setLabel) ?? {};
    mergedSetsByLabel.set(setLabel, {
      ...existingSet,
      label: setLabel,
      achievementId: achievement.id,
      items: mergeItemsByNumericKey(existingSet.items, fetchedItems, "skinId"),
    });
  }

  for (const existingSet of existingSets) {
    if (!mergedSetsByLabel.has(existingSet.label)) {
      mergedSetsByLabel.set(existingSet.label, existingSet);
    }
  }

  const sets = [...mergedSetsByLabel.values()];

  const output = {
    ...existingCatalog,
    sets,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${sets.length} weapon sets to ${OUTPUT}`);
  return;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
