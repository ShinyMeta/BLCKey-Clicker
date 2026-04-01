const WIKI_API = "https://wiki.guildwars2.com/api.php";
const GW2_ITEMS_API = "https://api.guildwars2.com/v2/items";

const HEADERS = {
  "User-Agent": "GW2-BLC-Simulator/1.0 (wiki scraper; Node.js)",
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function wikiApi(params) {
  const url = new URL(WIKI_API);

  for (const [key, value] of Object.entries({
    ...params,
    format: "json",
    origin: "*",
  })) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wiki API HTTP ${res.status}`);
  return res.json();
}

export async function getPageWikitext(title) {
  const data = await wikiApi({ action: "parse", page: title, prop: "wikitext" });
  return data.parse.wikitext["*"];
}

export async function getSectionWikitext(page, section) {
  const data = await wikiApi({
    action: "parse",
    page,
    prop: "wikitext",
    section: String(section),
  });

  return data.parse.wikitext["*"];
}

export async function getPageSections(page) {
  const data = await wikiApi({
    action: "parse",
    page,
    prop: "sections",
  });

  return data.parse.sections;
}

export async function batchGetWikitext(titles) {
  const result = {};

  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const data = await wikiApi({
      action: "query",
      titles: batch.join("|"),
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      redirects: "1",
    });

    const normalizedTitleMap = new Map();
    for (const normalized of data.query.normalized ?? []) {
      normalizedTitleMap.set(normalized.from, normalized.to);
    }

    const redirectMap = new Map();
    for (const redirect of data.query.redirects ?? []) {
      redirectMap.set(redirect.from, redirect.to);
    }

    const resolvedToOriginals = new Map();
    for (const originalTitle of batch) {
      let resolvedTitle = originalTitle;

      if (normalizedTitleMap.has(resolvedTitle)) {
        resolvedTitle = normalizedTitleMap.get(resolvedTitle);
      }

      if (redirectMap.has(resolvedTitle)) {
        resolvedTitle = redirectMap.get(resolvedTitle);
      }

      if (!resolvedToOriginals.has(resolvedTitle)) {
        resolvedToOriginals.set(resolvedTitle, []);
      }

      resolvedToOriginals.get(resolvedTitle).push(originalTitle);
    }

    for (const page of Object.values(data.query.pages)) {
      if (page.missing !== undefined) continue;

      const wikitext =
        page.revisions?.[0]?.slots?.main?.["*"] ?? page.revisions?.[0]?.["*"];
      if (!wikitext) continue;

      result[page.title] = wikitext;
      for (const originalTitle of resolvedToOriginals.get(page.title) ?? []) {
        result[originalTitle] = wikitext;
      }
    }

    if (i + 50 < titles.length) {
      await sleep(300);
    }
  }

  return result;
}

export async function batchGetItemNames(ids) {
  const names = {};

  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const res = await fetch(`${GW2_ITEMS_API}?ids=${batch.join(",")}`);
    if (!res.ok) throw new Error(`GW2 API HTTP ${res.status}`);

    const items = await res.json();
    for (const item of items) {
      names[item.id] = item.name;
    }

    if (i + 200 < ids.length) {
      await sleep(100);
    }
  }

  return names;
}

export function extractInfoboxId(wikitext) {
  const match = wikitext.match(/\|\s*id\s*=\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function resolveItemPages(titles) {
  const uniqueTitles = [...new Set(titles)];
  const wikitextByTitle = await batchGetWikitext(uniqueTitles);
  const resolved = [];
  const missing = [];

  for (const title of uniqueTitles) {
    const wikitext = wikitextByTitle[title];

    if (!wikitext) {
      missing.push(`${title} (page not found)`);
      continue;
    }

    const id = extractInfoboxId(wikitext);
    if (id === null) {
      missing.push(`${title} (no id in infobox)`);
      continue;
    }

    resolved.push({ id, wikiName: title });
  }

  return { resolved, missing };
}

export async function fetchCatalogItemsFromPageTitles(titles) {
  const { resolved, missing } = await resolveItemPages(titles);
  const nameById = await batchGetItemNames(resolved.map(({ id }) => id));

  const items = resolved.map(({ id, wikiName }) => ({
    itemId: id,
    label: nameById[id] ?? wikiName.replace(/\s*\([^)]*\)$/, ""),
  }));

  return { items, missing };
}
