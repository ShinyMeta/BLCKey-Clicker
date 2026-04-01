#!/usr/bin/env node
/**
 * Runs all fetch-* scripts sequentially to update every data file.
 *
 * Usage: node scripts/fetch-all.mjs
 */

import { execFileSync } from "child_process";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SELF = "fetch-all.mjs";

const scripts = readdirSync(__dirname)
  .filter((f) => f.startsWith("fetch-") && f !== SELF)
  .sort();

for (const script of scripts) {
  const scriptPath = join(__dirname, script);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running ${script}…`);
  console.log("=".repeat(60));
  execFileSync("node", [scriptPath], { stdio: "inherit" });
}

console.log(`\n${"=".repeat(60)}`);
console.log(`All ${scripts.length} fetch scripts completed.`);
console.log("=".repeat(60));
