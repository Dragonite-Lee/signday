#!/usr/bin/env node
/**
 * 국립국어원 일상생활수어 (KCISA meta13/getCTE01701) → src/data/signs.json
 *
 * Usage (run on a machine that can reach api.kcisa.kr):
 *   KCISA_KEY=발급받은서비스키 node scripts/sync-signs.mjs
 * Or from raw dumps (arrays of <item> objects) saved elsewhere, e.g. via a browser:
 *   node scripts/sync-signs.mjs ~/Downloads/signs-raw-*.json
 *
 * The key is only used here; the app ships the generated JSON, never the key.
 * Source data is updated yearly, so re-run occasionally and commit the diff.
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILES = process.argv.slice(2);
const KEY = process.env.KCISA_KEY;
if (!KEY && !FILES.length) {
  console.error('Set KCISA_KEY, or pass raw dump files as arguments');
  process.exit(1);
}

const ENDPOINT = 'https://api.kcisa.kr/openapi/service/rest/meta13/getCTE01701';
const PAGE_SIZE = 100;
const OUT = new URL('../src/data/signs.json', import.meta.url);
const RAW = new URL('../src/data/signs.raw.json', import.meta.url); // full API dump, gitignored

async function fetchPage(pageNo) {
  // keyword must be present even when empty (provider requirement).
  const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(KEY)}&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}&keyword=`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  // The API usually answers XML regardless of Accept; handle both.
  const json = text.trimStart().startsWith('<') ? parseXml(text) : JSON.parse(text);
  const body = json?.response?.body ?? json?.body;
  const header = json?.response?.header ?? json?.header;
  if (header?.resultCode && header.resultCode !== '0000' && header.resultCode !== '00') {
    throw new Error(`API error ${header.resultCode}: ${header.resultMsg}`);
  }
  let items = body?.items?.item ?? [];
  if (!Array.isArray(items)) items = [items];
  return { items, total: Number(body?.totalCount ?? 0) };
}

/** Minimal parser for the flat <response><header/><body><items><item>…</item></items></body> shape. */
function parseXml(xml) {
  const decode = (s) =>
    s
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  const tag = (src, name) => src.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1];
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, inner]) => {
    const o = {};
    for (const [, k, v] of inner.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)) o[k] = decode(v);
    return o;
  });
  return {
    response: {
      header: { resultCode: tag(xml, 'resultCode'), resultMsg: tag(xml, 'resultMsg') },
      body: { totalCount: tag(xml, 'totalCount'), items: { item: items } },
    },
  };
}

const clean = (v) => (typeof v === 'string' ? v.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '');

function toSign(item, index) {
  const title = clean(item.title);
  const images = clean(item.signImages)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s));
  const thumb = clean(item.referenceIdentifier);
  // subDescription carries the sign video (mp4) from 국립국어원 한국수어사전.
  const video = clean(item.subDescription);
  return {
    id: `ksl-${clean(item.url).split(/[=/]/).pop() || index}`,
    title,
    category: clean(item.categoryType) || '기타',
    description: clean(item.signDescription),
    videoUrl: /\.mp4($|\?)/i.test(video) ? video : '',
    thumbnailUrl: /^https?:\/\//.test(thumb) ? thumb : '',
    imageUrls: images,
    sourceUrl: clean(item.url),
    credit: ['국립국어원 한국수어사전', clean(item.copyrightOthers) || clean(item.rights)].filter(Boolean).join(' · '),
  };
}

let all = [];
let total = 0;
if (FILES.length) {
  for (const f of FILES) all.push(...JSON.parse(await readFile(f, 'utf8')));
  total = all.length;
} else {
  const first = await fetchPage(1);
  total = first.total;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  all = [...first.items];
  for (let p = 2; p <= pages; p++) {
    const { items } = await fetchPage(p);
    all.push(...items);
    process.stdout.write(`\rpage ${p}/${pages}`);
  }
}

await writeFile(RAW, JSON.stringify(all, null, 2) + '\n');
console.log(`\nraw: ${all.length} items → src/data/signs.raw.json`);

// Several words can share one sign (e.g. 썰매/스키): merge their titles instead of dropping.
const byId = new Map();
for (const s of all.map(toSign)) {
  if (!s.title || !(s.videoUrl || s.imageUrls.length || s.description)) continue;
  const prev = byId.get(s.id);
  if (!prev) byId.set(s.id, s);
  else if (!prev.title.split(',').includes(s.title)) prev.title += `,${s.title}`;
}
const signs = [...byId.values()];

await writeFile(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), signs }, null, 2) + '\n');
console.log(`\n${signs.length} signs (of ${total}) → src/data/signs.json`);
if (!signs.length) console.log('Raw first item for debugging:', JSON.stringify(all[0], null, 2));
