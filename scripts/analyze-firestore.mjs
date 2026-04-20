// Analyze a Firestore backup for data anomalies.
// Usage: node scripts/analyze-firestore.mjs <backup-folder>
// Read-only. Produces a human-readable report.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , backupArg] = process.argv;
if (!backupArg) {
  console.error('Usage: node scripts/analyze-firestore.mjs <backup-folder>');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const folder = join(root, backupArg);

const load = (name) => JSON.parse(readFileSync(join(folder, `${name}.json`), 'utf8'));

const shows = load('shows');
const collections = load('collections');
const recommendations = load('recommendations');
const pages = load('pages');

const showIds = new Set(shows.map((d) => d._id));
const collectionIds = new Set(collections.map((d) => d._id));
const recIds = new Set(recommendations.map((d) => d._id));

const issues = [];
const add = (sev, scope, id, msg, fix) => issues.push({ sev, scope, id, msg, fix });

// --- shows ---
for (const d of shows) {
  const { _id, data } = d;
  if (!/^p\d+$/.test(_id)) add('LOW', 'shows', _id, `Doc id does not match pattern p<number>`, 'rename doc');
  if (data.id !== _id) add('HIGH', 'shows', _id, `Internal id field "${data.id}" != doc id "${_id}"`, 'set internal id := doc id');
  if (!data.title || !data.title.trim()) add('MED', 'shows', _id, 'missing title', 'set title');
  if (!['recommended', 'accustomed'].includes(data.importance)) {
    add('MED', 'shows', _id, `importance="${data.importance}" (expected recommended|accustomed)`, 'normalize importance');
  }
  if (!['kids', 'youth', 'adults'].includes(data.category)) {
    add('MED', 'shows', _id, `category="${data.category}" (expected kids|youth|adults)`, 'normalize category');
  }
  if (data.type !== 'single') add('LOW', 'shows', _id, `type="${data.type}" (expected single)`, 'normalize type');
  // linkRec references
  for (const rid of data.linkRec || []) {
    if (!recIds.has(rid)) add('HIGH', 'shows', _id, `linkRec references missing recommendation "${rid}"`, 'remove or fix rec id');
  }
}

// --- collections ---
for (const d of collections) {
  const { _id, data } = d;
  if (!/^card_\d+$/.test(_id)) add('LOW', 'collections', _id, `Doc id does not match pattern card_<number>`, 'rename doc');
  if (data.id !== _id) add('HIGH', 'collections', _id, `Internal id "${data.id}" != doc id "${_id}"`, 'set internal id := doc id');
  if (!data.title || !data.title.trim()) add('MED', 'collections', _id, 'missing title', 'set title');
  if (!['single', 'collection'].includes(data.type)) add('MED', 'collections', _id, `type="${data.type}"`, 'normalize type');

  if (data.type === 'single') {
    if (!data.linkedShowId) add('HIGH', 'collections', _id, 'type=single but no linkedShowId', 'set linkedShowId');
    else if (!showIds.has(data.linkedShowId)) add('HIGH', 'collections', _id, `linkedShowId "${data.linkedShowId}" not found in shows`, 'fix ref');
    if (Array.isArray(data.contains) && data.contains.length) {
      add('LOW', 'collections', _id, 'type=single but has contains[] — ignored, should be empty', 'clear contains');
    }
  }
  if (data.type === 'collection') {
    if (!Array.isArray(data.contains) || !data.contains.length) {
      add('HIGH', 'collections', _id, 'type=collection but contains[] is empty', 'add shows to contains');
    } else {
      for (const sid of data.contains) {
        if (!showIds.has(sid)) add('HIGH', 'collections', _id, `contains references missing show "${sid}"`, 'fix ref');
      }
    }
    if (data.linkedShowId) add('LOW', 'collections', _id, 'type=collection but has linkedShowId — ignored', 'clear linkedShowId');
  }

  for (const rid of data.linkRec || []) {
    if (!recIds.has(rid)) add('HIGH', 'collections', _id, `linkRec references missing recommendation "${rid}"`, 'fix rec id');
  }
}

// --- recommendations ---
const linkPathRe = /^\/(show|collection)\/[A-Za-z0-9_]+$/;
for (const d of recommendations) {
  const { _id, data } = d;
  if (!/^rec\w+$/.test(_id)) add('LOW', 'recommendations', _id, `Doc id does not match pattern rec<...>`, 'rename doc');
  if (data.id !== _id) add('HIGH', 'recommendations', _id, `Internal id "${data.id}" != doc id "${_id}"`, 'set internal id := doc id');
  if (!data.recommenderName || !data.recommenderName.trim()) add('MED', 'recommendations', _id, 'missing recommenderName', 'set name');
  if (!data.content || !data.content.trim()) add('MED', 'recommendations', _id, 'missing content', 'set content');
  if (data.type && data.type !== 'recommendation') add('LOW', 'recommendations', _id, `type="${data.type}"`, 'normalize');
  if (!data.linkedShowId) {
    add('MED', 'recommendations', _id, 'missing linkedShowId', 'set link');
  } else if (!linkPathRe.test(data.linkedShowId)) {
    add('MED', 'recommendations', _id, `linkedShowId "${data.linkedShowId}" not in canonical /show/<id> or /collection/<id> form`, 'normalize');
  } else {
    const [, kind, id] = data.linkedShowId.match(/^\/(show|collection)\/(.+)$/) || [];
    if (kind === 'show' && !showIds.has(id)) add('HIGH', 'recommendations', _id, `linkedShowId points to missing show "${id}"`, 'fix');
    if (kind === 'collection' && !collectionIds.has(id)) add('HIGH', 'recommendations', _id, `linkedShowId points to missing collection "${id}"`, 'fix');
  }
}

// --- pages/about testimonials ---
const about = pages.find((d) => d._id === 'about');
if (about) {
  for (const [idx, t] of (about.data.testimonials || []).entries()) {
    if (t.linkP && !showIds.has(t.linkP)) add('MED', 'pages/about', `testimonials[${idx}]`, `linkP "${t.linkP}" not in shows`, 'fix');
    if (t.linkRecId && !recIds.has(t.linkRecId)) add('MED', 'pages/about', `testimonials[${idx}]`, `linkRecId "${t.linkRecId}" not in recommendations`, 'fix');
  }
}

// --- reverse: which recommendations are not linked from any show/collection? ---
const linkedRecs = new Set();
for (const d of shows) for (const r of d.data.linkRec || []) linkedRecs.add(r);
for (const d of collections) for (const r of d.data.linkRec || []) linkedRecs.add(r);
const orphanRecs = [...recIds].filter((r) => !linkedRecs.has(r));

// --- report ---
const by = (s) => issues.filter((i) => i.sev === s);
const fmt = (arr) =>
  arr.map((i) => `  [${i.scope}/${i.id}] ${i.msg}\n      → ${i.fix}`).join('\n');

console.log('=== DATA ANOMALY REPORT ===');
console.log(`backup: ${backupArg}`);
console.log(`counts: shows=${shows.length} collections=${collections.length} recommendations=${recommendations.length}\n`);

console.log(`HIGH severity (${by('HIGH').length}) — broken references / integrity:`);
console.log(fmt(by('HIGH')) || '  (none)');

console.log(`\nMED severity (${by('MED').length}) — format / missing fields:`);
console.log(fmt(by('MED')) || '  (none)');

console.log(`\nLOW severity (${by('LOW').length}) — cosmetic:`);
console.log(fmt(by('LOW')) || '  (none)');

console.log(`\nOrphan recommendations (not linked from any show/collection): ${orphanRecs.length}`);
if (orphanRecs.length) console.log('  ' + orphanRecs.join(', '));
