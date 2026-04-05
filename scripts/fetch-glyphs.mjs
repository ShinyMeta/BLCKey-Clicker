#!/usr/bin/env node
/**
 * Scrapes the GW2 wiki Glyph (upgrade) page to build glyphs.json
 * from the "Trading glyphs" table.
 *
 * Source:
 *   Glyph_(upgrade) → Trading glyphs
 *
 * Usage: node scripts/fetch-glyphs.mjs
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
const OUTPUT = join(__dirname, "../src/store/loot/config/sets/glyphs.json");
const PICK_COUNT = 2;
const { readExistingCatalog, mergeItemsByNumericKey } = catalogUtils;

function parseGlyphNames(wikitext) {
  return [
    ...new Set(
      [...wikitext.matchAll(/\{\{item icon\|([^|}]*\(Unused\))/g)].map((m) =>
        m[1].trim()
      )
    ),
  ];
}

async function main() {
  const existingCatalog = readExistingCatalog(OUTPUT);

  console.log("Locating the Trading glyphs section…");
  const sections = await getPageSections("Glyph_(upgrade)");
  const tradingSection = sections.find((s) => s.line === "Trading glyphs");

  if (!tradingSection) {
    throw new Error(
      'Could not find "Trading glyphs" section on the Glyph (upgrade) page'
    );
  }

  console.log("Fetching Trading glyphs wikitext…");
  const wikitext = await getSectionWikitext(
    "Glyph_(upgrade)",
    tradingSection.index
  );

  const names = parseGlyphNames(wikitext);
  console.log(`  Found ${names.length} tradeable glyphs`);

  console.log("Resolving item IDs and display names…");
  const { items, missing } = await fetchCatalogItemsFromPageTitles(names);

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
  console.log(`\nWrote ${mergedItems.length} glyphs → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
