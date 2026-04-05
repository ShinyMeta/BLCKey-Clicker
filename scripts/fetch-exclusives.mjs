#!/usr/bin/env node
/**
 * Scrapes the GW2 wiki to build exclusives.json with item IDs and names.
 *
 * Sources:
 *   1. Template:Inventory/statuette  – New / Recent / Vintage exclusive tables
 *   2. Black_Lion_Chest (sections)   – New / Returning exclusives
 *
 * Usage: node scripts/fetch-exclusives.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  fetchCatalogItemsFromPageTitles,
  getPageSections,
  getPageWikitext,
  getSectionWikitext,
} from "./lib/wiki-scraper.mjs";
import catalogUtils from "./lib/catalog-utils.cjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../src/store/loot/config/sets/exclusives.json");
const EXCLUDED_ITEM_IDS = new Set([105365, 105387, 105349]);
const { readExistingCatalog, mergeItemsByNumericKey } = catalogUtils;

function parseStatuetteItems(wikitext) {
  const sections = [
    "New Black Lion Chest Exclusives",
    "Recent Black Lion Chest Exclusives",
    "Vintage Black Lion Chest Exclusives",
  ];
  const items = [];

  for (const sectionName of sections) {
    const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sectionPattern = new RegExp(`===\\s*${escaped}\\s*===([\\s\\S]*?)(?====|$)`);
    const match = wikitext.match(sectionPattern);

    if (!match) {
      console.warn(`  ⚠ Section "${sectionName}" not found`);
      continue;
    }

    const rows = [
      ...match[1].matchAll(
        /\{\{vendor table row\s*\|\s*item\s*=\s*(.+?)(?:\s*\||\s*\}\})/gi
      ),
    ];

    for (const row of rows) {
      items.push(row[1].trim());
    }

    console.log(`  ${sectionName}: ${rows.length} items`);
  }

  return items;
}

function parseChestItems(wikitext) {
  return [...wikitext.matchAll(/\{\{contains\|([^|}]+)/g)].map((match) =>
    match[1].trim()
  );
}

async function main() {
  const existingCatalog = readExistingCatalog(OUTPUT);

  console.log("Fetching statuette vendor template…");
  const statuetteWikitext = await getPageWikitext("Template:Inventory/statuette");
  const statuetteItems = parseStatuetteItems(statuetteWikitext);
  console.log(`  Subtotal: ${statuetteItems.length}\n`);

  console.log("Fetching chest page exclusive sections…");
  const chestSections = await getPageSections("Black_Lion_Chest");

  const chestItems = [];
  for (const section of chestSections) {
    if (/New Exclusive|Returning Exclusive/.test(section.line)) {
      const wikitext = await getSectionWikitext("Black_Lion_Chest", section.index);
      const parsedItems = parseChestItems(wikitext);
      console.log(`  ${section.line}: ${parsedItems.length} items`);
      chestItems.push(...parsedItems);
    }
  }
  console.log(`  Subtotal: ${chestItems.length}\n`);

  const allNames = [...new Set([...statuetteItems, ...chestItems])];
  console.log(`Combined unique items: ${allNames.length}\n`);

  console.log(`Resolving ${allNames.length} item pages through the wiki + GW2 APIs…`);
  const { items, missing } = await fetchCatalogItemsFromPageTitles(allNames);
  const filteredItems = items.filter((item) => !EXCLUDED_ITEM_IDS.has(item.itemId));
  const excludedItems = items.filter((item) => EXCLUDED_ITEM_IDS.has(item.itemId));

  if (missing.length) {
    console.warn(`\n⚠ ${missing.length} unresolved:`);
    for (const entry of missing) {
      console.warn(`  - ${entry}`);
    }
  }

  if (excludedItems.length) {
    console.log(`\nExcluded ${excludedItems.length} items by ID:`);
    for (const item of excludedItems) {
      console.log(`  - ${item.itemId}: ${item.label}`);
    }
  }

  const mergedItems = mergeItemsByNumericKey(existingCatalog.items, filteredItems, "itemId");
  const output = {
    ...existingCatalog,
    items: mergedItems,
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + "\n");
  console.log(`\nWrote ${mergedItems.length} items → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
