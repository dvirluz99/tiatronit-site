// Rename a Firestore document by copying to a new ID and deleting the old one.
// Uses the admin OAuth token stored by firebase-tools (bypasses API key restrictions).
//
// Usage:
//   node scripts/rename-firestore-doc.mjs <collection> <oldId> <newId>
// Example:
//   node scripts/rename-firestore-doc.mjs recommendations recmo5ichc2 rec21

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const [, , col, oldId, newId] = process.argv;
if (!col || !oldId || !newId) {
  console.error('Usage: node scripts/rename-firestore-doc.mjs <collection> <oldId> <newId>');
  process.exit(1);
}

const PROJECT = 'teatronit-db';
const DATABASE = '(default)';
const CONFIG = join(homedir(), '.config', 'configstore', 'firebase-tools.json');

async function refreshToken(refresh) {
  const body = new URLSearchParams({
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: refresh,
    grant_type: 'refresh_token',
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) throw new Error('Refresh failed: ' + (await r.text()));
  return (await r.json()).access_token;
}

async function getToken() {
  const { tokens } = JSON.parse(readFileSync(CONFIG, 'utf8'));
  if (!tokens.expires_at || Date.now() >= tokens.expires_at) {
    return refreshToken(tokens.refresh_token);
  }
  return tokens.access_token;
}

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DATABASE}/documents`;

async function readDoc(token, collection, id) {
  const r = await fetch(`${BASE}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    headers: { authorization: 'Bearer ' + token },
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GET ${collection}/${id} → ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function writeDoc(token, collection, id, payload) {
  const r = await fetch(`${BASE}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`PATCH ${collection}/${id} → ${r.status}: ${await r.text()}`);
}

async function deleteDoc(token, collection, id) {
  const r = await fetch(`${BASE}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { authorization: 'Bearer ' + token },
  });
  if (!r.ok) throw new Error(`DELETE ${collection}/${id} → ${r.status}: ${await r.text()}`);
}

// Replace the internal `id` field value (if present) with the new id so the
// stored id matches the new doc path.
function rewriteIdField(fields, newId) {
  const out = JSON.parse(JSON.stringify(fields));
  if (out.id && typeof out.id === 'object' && 'stringValue' in out.id) {
    out.id.stringValue = newId;
  }
  return out;
}

async function main() {
  const token = await getToken();

  const existing = await readDoc(token, col, oldId);
  if (!existing) {
    console.error(`Old doc ${col}/${oldId} not found.`);
    process.exit(1);
  }

  const collision = await readDoc(token, col, newId);
  if (collision) {
    console.error(`New id ${col}/${newId} already exists — refusing to overwrite.`);
    process.exit(1);
  }

  const fields = rewriteIdField(existing.fields || {}, newId);
  await writeDoc(token, col, newId, { fields });
  console.log(`  wrote ${col}/${newId}`);

  await deleteDoc(token, col, oldId);
  console.log(`  deleted ${col}/${oldId}`);

  console.log(`Rename complete: ${col}/${oldId} → ${col}/${newId}`);
}

main().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
