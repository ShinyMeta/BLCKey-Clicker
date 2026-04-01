#!/usr/bin/env node
/**
 * Scrapes the GW2 wiki Home instance page to build nodes.json
 * from the "Black Lion Chest upgrades" table.
 *
 * Source:
 *   Home_instance → Black Lion Chest upgrades
 *
 * Usage: node scripts/fetch-nodes.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  fetchCatalogItemsFromPageTitles,
  getPageSections,
  getSectionWikitext,
} from "./lib/wiki-scraper.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../src/store/loot/config/sets/nodes.json");
const PICK_COUNT = 4;

function parseNodeNames(wikitext) {
  return [
    ...new Set(
      [...wikitext.matchAll(/\{\{item icon\|([^|}]+)/g)]
        .map((m) => m[1].trim())
        .filter((name) => name.includes("Node") || name.includes("Rack"))
    ),
  ];
}

async function main() {
  console.log("Locating the Black Lion Chest upgrades section…");
  const sections = await getPageSections("Home_instance");
  const blcSection = sections.find(
    (s) => s.line === "Black Lion Chest upgrades"
  );

  if (!blcSection) {
    throw new Error(
      'Could not find "Black Lion Chest upgrades" section on the Home instance page'
    );
  }

  console.log("Fetching Black Lion Chest upgrades wikitext…");
  const wikitext = await getSectionWikitext("Home_instance", blcSection.index);

  const names = parseNodeNames(wikitext);
  console.log(`  Found ${names.length} node items`);

  console.log("Resolving item IDs and display names…");
  const { items, missing } = await fetchCatalogItemsFromPageTitles(names);

  if (missing.length) {
    console.warn(`\n⚠ ${missing.length} unresolved:`);
    for (const entry of missing) {
      console.warn(`  - ${entry}`);
    }
  }

  writeFileSync(
    OUTPUT,
    JSON.stringify({ pickCount: PICK_COUNT, items }, null, 2) + "\n"
  );
  console.log(`\nWrote ${items.length} nodes → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
