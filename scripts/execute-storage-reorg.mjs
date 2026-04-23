// Execute the storage reorganization plan built by scripts/reorganize-storage.ts.
//
// Authentication: reuses the OAuth token cached by `firebase login` (same
// identity the Firebase MCP uses). No ADMIN_EMAIL / ADMIN_PASSWORD needed.
//
// Phases:
//   --phase=copy   Server-side copy each old path -> new path in GCS.
//                  Old files remain. Emits new download URLs.
//   --phase=update Rewrite Firestore docs: replace old URLs with new URLs.
//   --phase=all    copy, then update, in one run.
//
// Nothing deletes. Deletion is a separate manual step after site verification.
//
// Usage:
//   node scripts/execute-storage-reorg.mjs --phase=copy
//   node scripts/execute-storage-reorg.mjs --phase=update
//   node scripts/execute-storage-reorg.mjs --phase=all

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const PROJECT_ID = 'teatronit-db';
const BUCKET = 'teatronit-db.firebasestorage.app';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const phaseArg = process.argv.find((a) => a.startsWith('--phase='));
const PHASE = phaseArg ? phaseArg.split('=')[1] : '';
if (!['copy', 'update', 'all'].includes(PHASE)) {
  console.error('Usage: --phase=copy | --phase=update | --phase=all');
  process.exit(1);
}

// --- OAuth token from firebase-tools cache, auto-refresh if expired. ---

const CONFIG = join(homedir(), '.config', 'configstore', 'firebase-tools.json');

async function getAccessToken() {
  const cache = JSON.parse(readFileSync(CONFIG, 'utf8'));
  const t = cache.tokens || {};
  const now = Date.now();
  if (t.access_token && t.expires_at && t.expires_at - now > 60_000) {
    return t.access_token;
  }
  if (!t.refresh_token) {
    throw new Error('No refresh_token in firebase-tools cache. Run `npx firebase-tools login`.');
  }
  // Firebase CLI client id (public; baked into firebase-tools).
  const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
  const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: t.refresh_token,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OAuth refresh failed: ${res.status} ${body}`);
  }
  const fresh = await res.json();
  cache.tokens = {
    ...t,
    access_token: fresh.access_token,
    expires_in: fresh.expires_in,
    expires_at: now + fresh.expires_in * 1000,
  };
  writeFileSync(CONFIG, JSON.stringify(cache, null, 2), 'utf8');
  return fresh.access_token;
}

// --- Plan location: use the most recent storage-move-plan under firestore-backup/ ---

function findPlanDir() {
  const backups = join(root, 'firestore-backup');
  const runs = readdirSync(backups)
    .filter((n) => existsSync(join(backups, n, 'storage-move-plan', 'moves.json')))
    .sort();
  if (runs.length === 0) throw new Error('No storage-move-plan found. Run reorganize-storage.ts first.');
  return join(backups, runs[runs.length - 1], 'storage-move-plan');
}

const planDir = findPlanDir();
const moves = JSON.parse(readFileSync(join(planDir, 'moves.json'), 'utf8'));
console.log(`Plan: ${planDir}`);
console.log(`Moves: ${moves.length}`);

// --- Copy phase: GCS server-side copy with firebase download token metadata ---

function firebaseDownloadUrl(path, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

async function copyOne(token, { oldPath, newPath }) {
  const src = encodeURIComponent(oldPath);
  const dst = encodeURIComponent(newPath);
  const downloadToken = randomUUID();
  const url = `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o/${src}/copyTo/b/${BUCKET}/o/${dst}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`copy failed (${res.status}): ${body}`);
  }
  return firebaseDownloadUrl(newPath, downloadToken);
}

async function runCopy(token) {
  console.log(`\n=== Phase: copy ===`);
  const urlMap = {}; // oldUrl -> newUrl, keyed by oldPath string match
  const pathToNewUrl = {}; // oldPath -> newUrl
  const failures = [];
  let ok = 0, skipped = 0;
  for (const m of moves) {
    try {
      // Skip if already exists at dest (idempotent re-run).
      const headRes = await fetch(
        `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o/${encodeURIComponent(m.newPath)}`,
        { headers: { authorization: `Bearer ${token}` } },
      );
      if (headRes.ok) {
        const meta = await headRes.json();
        const existingToken = meta?.metadata?.firebaseStorageDownloadTokens;
        if (existingToken) {
          pathToNewUrl[m.oldPath] = firebaseDownloadUrl(m.newPath, existingToken.split(',')[0]);
          skipped++;
          continue;
        }
      }
      const newUrl = await copyOne(token, m);
      pathToNewUrl[m.oldPath] = newUrl;
      ok++;
      if (ok % 10 === 0) console.log(`  copied ${ok}/${moves.length}`);
    } catch (e) {
      failures.push({ oldPath: m.oldPath, newPath: m.newPath, error: e.message });
    }
  }
  writeFileSync(join(planDir, 'path-to-new-url.json'), JSON.stringify(pathToNewUrl, null, 2), 'utf8');
  if (failures.length) {
    writeFileSync(join(planDir, 'copy-failures.json'), JSON.stringify(failures, null, 2), 'utf8');
  }
  console.log(`copy: ${ok} copied, ${skipped} already existed, ${failures.length} failed`);
  return pathToNewUrl;
}

// --- Update phase: rewrite URLs in Firestore docs ---

// Same URL parser as in the planner.
function extractStoragePath(url) {
  if (typeof url !== 'string' || !url.includes('firebasestorage.googleapis.com')) return null;
  const marker = `/b/${BUCKET}/o/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  const after = url.slice(i + marker.length);
  const q = after.indexOf('?');
  const enc = q < 0 ? after : after.slice(0, q);
  try {
    return decodeURIComponent(enc);
  } catch {
    return null;
  }
}

function rewriteStrings(input, mapFn) {
  if (input == null) return input;
  if (typeof input === 'string') return mapFn(input);
  if (Array.isArray(input)) return input.map((v) => rewriteStrings(v, mapFn));
  if (typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) out[k] = rewriteStrings(v, mapFn);
    return out;
  }
  return input;
}

// Firestore REST value encoding.
function toFsValue(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const [k, val] of Object.entries(v)) fields[k] = toFsValue(val);
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported type for ${typeof v}`);
}

function fromFsValue(v) {
  if (!v) return undefined;
  if ('nullValue' in v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFsValue);
  if ('mapValue' in v) {
    const out = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) out[k] = fromFsValue(val);
    return out;
  }
  return undefined;
}

async function fsGet(token, collection, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET ${collection}/${docId} failed: ${res.status} ${await res.text()}`);
  const doc = await res.json();
  const fields = doc.fields || {};
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromFsValue(v);
  return out;
}

async function fsPatch(token, collection, docId, data, updateMaskFields) {
  const maskParams = updateMaskFields.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${encodeURIComponent(docId)}?${maskParams}`;
  const fields = {};
  for (const k of updateMaskFields) fields[k] = toFsValue(data[k]);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`PATCH ${collection}/${docId} failed: ${res.status} ${await res.text()}`);
}

async function runUpdate(token, pathToNewUrl) {
  console.log(`\n=== Phase: update ===`);
  if (!pathToNewUrl) {
    pathToNewUrl = JSON.parse(readFileSync(join(planDir, 'path-to-new-url.json'), 'utf8'));
  }

  // Group references by doc (collection/id), collect which top-level fields to rewrite.
  const byDoc = new Map();
  for (const m of moves) {
    for (const r of m.references) {
      const key = `${r.collection} ${r.docId}`;
      const entry = byDoc.get(key) ?? { collection: r.collection, docId: r.docId, topFields: new Set() };
      // Top-level field name = portion before '.' or '[' in fieldPath
      const topField = r.fieldPath.split(/[.[]/)[0];
      entry.topFields.add(topField);
      byDoc.set(key, entry);
    }
  }

  let ok = 0;
  const failures = [];
  for (const { collection, docId, topFields } of byDoc.values()) {
    try {
      const data = await fsGet(token, collection, docId);
      const rewritten = rewriteStrings(data, (s) => {
        const sp = extractStoragePath(s);
        if (!sp) return s;
        const newUrl = pathToNewUrl[sp];
        return newUrl || s;
      });
      await fsPatch(token, collection, docId, rewritten, [...topFields]);
      ok++;
      console.log(`  ${collection}/${docId}: rewrote [${[...topFields].join(', ')}]`);
    } catch (e) {
      failures.push({ collection, docId, error: e.message });
    }
  }
  if (failures.length) {
    writeFileSync(join(planDir, 'update-failures.json'), JSON.stringify(failures, null, 2), 'utf8');
  }
  console.log(`update: ${ok} docs rewritten, ${failures.length} failed`);
}

// --- main ---

async function main() {
  const token = await getAccessToken();
  console.log(`Access token OK (len=${token.length})`);

  if (PHASE === 'copy' || PHASE === 'all') {
    const map = await runCopy(token);
    if (PHASE === 'all') await runUpdate(token, map);
  } else if (PHASE === 'update') {
    await runUpdate(token);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
