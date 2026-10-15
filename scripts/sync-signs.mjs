#!/usr/bin/env node
/**
 * 국립국어원 일상생활수어 (KCISA meta13/getCTE01701) → src/data/signs.json
 *
 * Usage (run on a machine that can reach api.kcisa.kr):
 *   KCISA_KEY=발급받은서비스키 node scripts/sync-signs.mjs
 *
 * The key is only used here; the app ships the generated JSON, never the key.
 * Source data is updated yearly, so re-run occasionally and commit the diff.
 */
import { writeFile } from 'node:fs/promises';

const KEY = process.env.KCISA_KEY;
if (!KEY) {
  console.error('KCISA_KEY env var is required');
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

const first = await fetchPage(1);
const pages = Math.max(1, Math.ceil(first.total / PAGE_SIZE));
const all = [...first.items];
for (let p = 2; p <= pages; p++) {
  const { items } = await fetchPage(p);
  all.push(...items);
  process.stdout.write(`\rpage ${p}/${pages}`);
}

await writeFile(RAW, JSON.stringify(all, null, 2) + '\n');
console.log(`\nraw: ${all.length} items → src/data/signs.raw.json`);

const seen = new Set();
const signs = all
  .map(toSign)
  .filter((s) => s.title && (s.videoUrl || s.imageUrls.length || s.description))
  .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));

await writeFile(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), signs }, null, 2) + '\n');
console.log(`\n${signs.length} signs (of ${first.total}) → src/data/signs.json`);
if (!signs.length) console.log('Raw first item for debugging:', JSON.stringify(first.items[0], null, 2));
