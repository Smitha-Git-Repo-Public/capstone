#!/usr/bin/env node

/**
 * Query-index generator for WKND articles.
 *
 * Edge Delivery normally builds `query-index.json` from an indexer configured at
 * tools.aem.live. Locally there is no indexer, so this script produces the same
 * artifact from the previewed content: it scans every magazine and adventure
 * article across all locales and emits a standard EDS "sheet" JSON that the
 * dynamic `article-list` block consumes.
 *
 * Output columns:
 *   path, title, description, image, category, locale, activity, lastModified.
 *
 * `activity` is a comma-separated list of adventure activities (e.g.
 * "cycling, travel"). It is derived from the adventures listing page's own
 * activity filter (the `tabs-filter` panels), which is where WKND authors
 * already express the grouping — so the tags stay in sync with the source
 * without editing every article.
 *
 * Usage: node tools/generate-query-index.mjs
 * (writes content/query-index.json)
 */

import {
  readdirSync, readFileSync, statSync, writeFileSync,
} from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(scriptDir, '..');
const CONTENT_DIR = join(REPO_ROOT, 'content');

// Only these content sections are treated as indexable article collections.
const CATEGORIES = ['magazine', 'adventures'];

/** Recursively collect every *.plain.html file under a directory. */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (entry.isFile() && entry.name.endsWith('.plain.html')) return [full];
    return [];
  });
}

/** Decode the handful of HTML entities that appear in titles/descriptions. */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

/** Strip tags and collapse whitespace. */
function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/**
 * Pull a value out of the trailing page `metadata` block, e.g.
 * `<div>Title</div><div>WKND ...</div>` -> the second cell for key "Title".
 */
function readMetadata(html, key) {
  const re = new RegExp(
    `<div>\\s*${key}\\s*</div>\\s*<div>([\\s\\S]*?)</div>`,
    'i',
  );
  const m = html.match(re);
  return m ? stripTags(m[1]) : '';
}

/** First real content image on the page (used as the card thumbnail). */
function firstImage(html) {
  const m = html.match(/<img[^>]*\ssrc="([^"]+)"/i);
  return m ? m[1] : '';
}

/** First heading text, used as a title fallback when metadata is absent. */
function firstHeading(html) {
  const m = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  return m ? stripTags(m[1]) : '';
}

/**
 * Build a { articlePath -> Set(activity) } map for one locale by reading the
 * activity filter on that locale's adventures listing page. Each `tabs-filter`
 * panel is `<div><div>Label</div><div>…links…</div></div>`; the first cell is
 * the activity name and the panel links are the adventures tagged with it. The
 * catch-all "All" tab is ignored.
 */
function activitiesForLocale(locale) {
  const listing = join(CONTENT_DIR, locale, 'adventures.plain.html');
  const map = new Map();
  let html;
  try {
    html = readFileSync(listing, 'utf8');
  } catch {
    return map; // no listing for this locale
  }

  const tabsMatch = html.match(/class="tabs-filter">([\s\S]*?)<\/div>\s*<\/div>\s*<div><div class="metadata"|class="tabs-filter">([\s\S]*)$/);
  const tabsHtml = tabsMatch ? (tabsMatch[1] || tabsMatch[2] || '') : '';

  // Each panel: <div><div>LABEL</div> … <a href="…/adventures/slug"> …
  const panelRe = /<div><div>([^<]+)<\/div>([\s\S]*?)(?=<div><div>[^<]+<\/div>|$)/g;
  let panel = panelRe.exec(tabsHtml);
  while (panel) {
    const label = decodeEntities(panel[1]).trim().toLowerCase();
    if (label && label !== 'all') {
      const hrefs = [...panel[2].matchAll(/href="([^"]*\/adventures\/[^"]+)"/g)]
        .map((m) => m[1].replace(/\.html?$/, '').replace(/\/$/, ''));
      hrefs.forEach((href) => {
        if (!map.has(href)) map.set(href, new Set());
        map.get(href).add(label);
      });
    }
    panel = panelRe.exec(tabsHtml);
  }
  return map;
}

// Cache activity maps per locale so each listing is parsed only once.
const activityCache = new Map();
function getActivities(locale, path) {
  if (!activityCache.has(locale)) activityCache.set(locale, activitiesForLocale(locale));
  const set = activityCache.get(locale).get(path);
  return set ? [...set].sort().join(', ') : '';
}

function buildEntry(file) {
  const html = readFileSync(file, 'utf8');
  // /content/us/en/magazine/ski-touring.plain.html -> /us/en/magazine/ski-touring
  const rel = `/${relative(CONTENT_DIR, file)}`.replace(/\.plain\.html$/, '');
  const segments = rel.split('/').filter(Boolean); // [us, en, magazine, ski-touring]
  const category = segments.find((s) => CATEGORIES.includes(s)) || '';
  const catIdx = segments.indexOf(category);
  const locale = segments.slice(0, catIdx).join('/'); // us/en

  return {
    path: rel,
    title: readMetadata(html, 'Title') || firstHeading(html) || segments[segments.length - 1],
    description: readMetadata(html, 'Description'),
    image: firstImage(html),
    category,
    locale,
    activity: category === 'adventures' ? getActivities(locale, rel) : '',
    lastModified: Math.round(statSync(file).mtimeMs / 1000),
  };
}

function isArticle(file) {
  const rel = relative(CONTENT_DIR, file).replace(/\\/g, '/');
  const segments = rel.replace(/\.plain\.html$/, '').split('/');
  const catIdx = segments.findIndex((s) => CATEGORIES.includes(s));
  // Must live *inside* a category folder (…/magazine/<article>), not be the
  // listing page itself (…/magazine.plain.html) and not a category landing.
  return catIdx >= 0 && catIdx < segments.length - 1;
}

const files = walk(CONTENT_DIR).filter(isArticle);
const data = files
  .map(buildEntry)
  // Newest first so "Recent Articles" and the featured picks are meaningful.
  .sort((a, b) => b.lastModified - a.lastModified || a.path.localeCompare(b.path));

const sheet = {
  total: data.length,
  offset: 0,
  limit: data.length,
  columns: ['path', 'title', 'description', 'image', 'category', 'locale', 'activity', 'lastModified'],
  data,
  ':type': 'sheet',
};

const outPath = join(CONTENT_DIR, 'query-index.json');
writeFileSync(outPath, `${JSON.stringify(sheet, null, 2)}\n`);

// eslint-disable-next-line no-console
console.log(`Wrote ${data.length} articles to ${relative(REPO_ROOT, outPath)}`);
