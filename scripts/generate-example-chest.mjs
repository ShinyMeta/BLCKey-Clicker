import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { generateChestConfig } from "../src/store/loot/generateChestConfig.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../src/store/loot/config/chests/example.json");

const chest = generateChestConfig({
  name: "Example Chest",
});

writeFileSync(outPath, JSON.stringify(chest, null, 2) + "\n");
console.log(`Wrote ${outPath}`);
