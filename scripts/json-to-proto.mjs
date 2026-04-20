// Convert a dry-run preview into Firestore REST proto JSON, one file per doc.
// Usage: node scripts/json-to-proto.mjs firestore-backup/<runId>/v2-preview

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , previewArg] = process.argv;
if (!previewArg) {
  console.error('Usage: node scripts/json-to-proto.mjs <preview-folder>');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const previewDir = join(root, previewArg);
const outDir = join(previewDir, '..', 'proto');
mkdirSync(outDir, { recursive: true });

function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: 'NULL_VALUE' };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object') return { mapValue: { fields: toFirestoreFields(v) } };
  throw new Error('Unsupported value: ' + typeof v);
}

function toFirestoreFields(obj) {
  const out = {};
  for (const [k, val] of Object.entries(obj)) out[k] = toFirestoreValue(val);
  return out;
}

const FILES = [
  { file: 'shows_v2.json', collection: 'shows_v2' },
  { file: 'collections_v2.json', collection: 'collections_v2' },
  { file: 'recommendations_v2.json', collection: 'recommendations_v2' },
];

for (const { file, collection } of FILES) {
  const docs = JSON.parse(readFileSync(join(previewDir, file), 'utf8'));
  mkdirSync(join(outDir, collection), { recursive: true });
  for (const d of docs) {
    const proto = { fields: toFirestoreFields(d.data) };
    writeFileSync(join(outDir, collection, d._id + '.json'), JSON.stringify(proto, null, 2));
  }
  console.log(`${collection}: ${docs.length} docs`);
}

// pages uses { id, data } shape
{
  const pages = JSON.parse(readFileSync(join(previewDir, 'pages_v2.json'), 'utf8'));
  mkdirSync(join(outDir, 'pages_v2'), { recursive: true });
  for (const p of pages) {
    writeFileSync(
      join(outDir, 'pages_v2', p.id + '.json'),
      JSON.stringify({ fields: toFirestoreFields(p.data) }, null, 2),
    );
  }
  console.log(`pages_v2: ${pages.length} docs`);
}

{
  const settings = JSON.parse(readFileSync(join(previewDir, 'settings_v2.json'), 'utf8'));
  mkdirSync(join(outDir, 'settings_v2'), { recursive: true });
  for (const s of settings) {
    writeFileSync(
      join(outDir, 'settings_v2', s.id + '.json'),
      JSON.stringify({ fields: toFirestoreFields(s.data) }, null, 2),
    );
  }
  console.log(`settings_v2: ${settings.length} docs`);
}

console.log(`\nProto files written under: ${outDir}`);
