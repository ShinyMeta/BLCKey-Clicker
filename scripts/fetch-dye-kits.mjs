#!/usr/bin/env node
/**
 * Scrapes the GW2 wiki Dye page to build dyeKits.json with item IDs and names.
 *
 * Source:
 *   Dye → Acquisition → Exclusive colors
 *
 * Exclusions:
 *   - Black Lion Dye Canister dyes
 *   - Smooth Berry Dye Kit
 *
 * Usage: node scripts/fetch-dye-kits.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  fetchCatalogItemsFromPageTitles,
  getPageSections,
  getSectionWikitext,
} from "./lib/wiki-scraper.mjs";
import catalogUtils from "./lib/catalog-utils.cjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../src/store/loot/config/sets/dyeKits.json");
const PICK_COUNT = 4;
const EXCLUDED_KITS = new Set(["Smooth Berry Dye Kit"]);
const { readExistingCatalog, mergeItemsByNumericKey } = catalogUtils;

function parseDyeKitNames(wikitext) {
  return [
    ...new Set(
      [...wikitext.matchAll(/\{\{Exclusive dye table row\|[^|]+\|([^|}]+)(?:\|[^}]*)?\}\}/g)]
        .map((match) => match[1].trim())
        .filter((name) => name.endsWith("Dye Kit"))
        .filter((name) => !EXCLUDED_KITS.has(name))
    ),
  ];
}

async function main() {
  const existingCatalog = readExistingCatalog(OUTPUT);

  console.log("Locating the Dye page Exclusive colors section…");
  const sections = await getPageSections("Dye");
  const exclusiveColorsSection = sections.find(
    (section) => section.line === "Exclusive colors"
  );

  if (!exclusiveColorsSection) {
    throw new Error('Could not find the "Exclusive colors" section on the Dye page');
  }

  console.log("Fetching Exclusive colors wikitext…");
  const wikitext = await getSectionWikitext("Dye", exclusiveColorsSection.index);

  const kitNames = parseDyeKitNames(wikitext);
  console.log(`  Found ${kitNames.length} dye kits`);

  console.log("Resolving dye kit item IDs and display names…");
  const { items, missing } = await fetchCatalogItemsFromPageTitles(kitNames);

  if (missing.length) {
    console.warn(`\n⚠ ${missing.length} unresolved:`);
    for (const entry of missing) {
      console.warn(`  - ${entry}`);
    }
  }

  const mergedItems = mergeItemsByNumericKey(existingCatalog.items, items, "itemId");
  const output = {
    ...existingCatalog,
    pickCount: Number.isFinite(Number(existingCatalog.pickCount))
      ? Number(existingCatalog.pickCount)
      : PICK_COUNT,
    items: mergedItems,
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + "\n");
  console.log(`\nWrote ${mergedItems.length} dye kits → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
