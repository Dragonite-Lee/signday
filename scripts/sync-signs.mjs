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

async function fetchPage(pageNo) {
  // keyword must be present even when empty (provider requirement).
  const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(KEY)}&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}&keyword=`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON, got: ${text.slice(0, 300)}`);
  }
  const body = json?.response?.body ?? json?.body;
  const header = json?.response?.header ?? json?.header;
  if (header?.resultCode && header.resultCode !== '0000' && header.resultCode !== '00') {
    throw new Error(`API error ${header.resultCode}: ${header.resultMsg}`);
  }
  let items = body?.items?.item ?? [];
  if (!Array.isArray(items)) items = [items];
  return { items, total: Number(body?.totalCount ?? 0) };
}

const clean = (v) => (typeof v === 'string' ? v.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '');

function toSign(item, index) {
  const title = clean(item.title);
  const images = clean(item.signImages)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s));
  const thumb = clean(item.referenceIdentifier);
  return {
    id: `ksl-${clean(item.url).split(/[=/]/).pop() || index}`,
    title,
    category: clean(item.categoryType) || '기타',
    description: clean(item.signDescription),
    imageUrls: images.length ? images : /^https?:\/\//.test(thumb) ? [thumb] : [],
    sourceUrl: clean(item.url),
    credit: [clean(item.creator) || '국립국어원', clean(item.copyrightOthers) || clean(item.rights)]
      .filter(Boolean)
      .join(' · '),
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

const seen = new Set();
const signs = all
  .map(toSign)
  .filter((s) => s.title && (s.imageUrls.length || s.description))
  .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));

await writeFile(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), signs }, null, 2) + '\n');
console.log(`\n${signs.length} signs (of ${first.total}) → src/data/signs.json`);
if (!signs.length) console.log('Raw first item for debugging:', JSON.stringify(first.items[0], null, 2));
