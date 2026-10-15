#!/usr/bin/env node
/**
 * data/curriculum.json + data/signs.all.json → src/data/curated.json (+ data/curriculum.report.md)
 *
 * The app bundles only curated.json (a few hundred KB), not the full dataset.
 * Sign choice per word, when several signs contain the token:
 *   1. title is exactly the token
 *   2. title's first token is the token (and contains hint, if given)
 *   3. any title containing the token and the hint
 *   4. first title whose first token is the token, else first candidate
 * Review data/curriculum.report.md after every change — ambiguous picks are marked.
 */
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = async (p) => JSON.parse(await readFile(new URL(p, root), 'utf8'));

const { units } = await read('data/curriculum.json');
const { signs, syncedAt } = await read('data/signs.all.json');

const tokens = (s) => [...new Set(s.title.split(',').map((t) => t.trim()))];
const index = new Map();
for (const s of signs) for (const t of new Set(tokens(s))) index.set(t, [...(index.get(t) ?? []), s]);

function pick(find, hint) {
  const cands = index.get(find) ?? [];
  if (!cands.length) return { sign: null, cands };
  const hasHint = (s) => !hint || tokens(s).includes(hint);
  const sign =
    (hint ? undefined : cands.find((s) => s.title === find)) ??
    cands.find((s) => tokens(s)[0] === find && hasHint(s)) ??
    (hint ? cands.find(hasHint) : undefined) ??
    cands.find((s) => tokens(s)[0] === find) ??
    cands[0];
  return { sign, cands };
}

const report = [`# Curriculum report\n`, `Source synced: ${syncedAt}\n`];
const missing = [];
const out = units.map((u) => {
  report.push(`\n## ${u.title[0]} (${u.id})\n`);
  const items = [];
  for (const [ko, en, find, hint] of u.words) {
    const { sign, cands } = pick(find, hint);
    if (!sign) {
      missing.push(`${u.id}/${ko}`);
      report.push(`- ❌ **${ko}** — no sign for "${find}"`);
      continue;
    }
    const flag = cands.length > 1 ? ` ⚠️ ${cands.length} candidates: ${cands.map((c) => `\`${c.title}\``).join(' / ')}` : '';
    report.push(`- **${ko}** → \`${sign.title}\` ([${sign.id}](${sign.sourceUrl}))${flag}`);
    items.push({
      id: sign.id,
      label: { ko, en },
      synonyms: tokens(sign).filter((t) => t !== ko),
      videoUrl: sign.videoUrl,
      thumbnailUrl: sign.thumbnailUrl,
      imageUrls: sign.imageUrls,
      description: sign.description,
      sourceUrl: sign.sourceUrl,
      credit: sign.credit,
    });
  }
  return { id: u.id, title: { ko: u.title[0], en: u.title[1] }, signs: items };
});

await writeFile(new URL('src/data/curated.json', root), JSON.stringify({ syncedAt, units: out }, null, 2) + '\n');
await writeFile(new URL('data/curriculum.report.md', root), report.join('\n') + '\n');

const total = out.reduce((n, u) => n + u.signs.length, 0);
console.log(`${out.length} units, ${total} signs → src/data/curated.json`);
if (missing.length) console.log(`missing: ${missing.join(', ')}`);
