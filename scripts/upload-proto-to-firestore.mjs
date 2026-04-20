// Upload proto-formatted JSON files to Firestore using the admin OAuth token
// stored by firebase-tools (bypasses API key referrer restrictions).
//
// Usage: node scripts/upload-proto-to-firestore.mjs <proto-folder>
// Example: node scripts/upload-proto-to-firestore.mjs firestore-backup/2026-04-20-2321/proto

import { readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , protoArg] = process.argv;
if (!protoArg) {
  console.error('Usage: node scripts/upload-proto-to-firestore.mjs <proto-folder>');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const protoRoot = join(root, protoArg);

const CONFIGSTORE_PATH = join(homedir(), '.config', 'configstore', 'firebase-tools.json');
const PROJECT = 'teatronit-db';
const DATABASE = '(default)';

function readTokens() {
  const raw = JSON.parse(readFileSync(CONFIGSTORE_PATH, 'utf8'));
  return raw.tokens;
}

async function refreshAccessToken(refreshToken) {
  const clientId = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
  const clientSecret = 'j9iVZfS8kkCEFUPaAeJV0sAi';
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) throw new Error('Token refresh failed: ' + (await r.text()));
  const data = await r.json();
  return data.access_token;
}

async function writeDoc(accessToken, collection, docId, payload) {
  // PATCH with documentId creates-or-replaces the document at that path.
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DATABASE}/documents/` +
    `${encodeURIComponent(collection)}/${encodeURIComponent(docId)}`;
  const r = await fetch(url, {
    method: 'PATCH',
    headers: {
      authorization: 'Bearer ' + accessToken,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`${collection}/${docId} → HTTP ${r.status}: ${txt.slice(0, 300)}`);
  }
}

async function main() {
  const tokens = readTokens();
  let accessToken = tokens.access_token;

  // If expired, refresh.
  if (!tokens.expires_at || Date.now() >= tokens.expires_at) {
    console.log('Refreshing access token…');
    accessToken = await refreshAccessToken(tokens.refresh_token);
  }

  const collections = readdirSync(protoRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let ok = 0;
  const failures = [];

  for (const col of collections) {
    const files = readdirSync(join(protoRoot, col)).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      const docId = f.replace(/\.json$/, '');
      const payload = JSON.parse(readFileSync(join(protoRoot, col, f), 'utf8'));
      try {
        await writeDoc(accessToken, col, docId, payload);
        console.log(`  ✓ ${col}/${docId}`);
        ok++;
      } catch (e) {
        console.error(`  ✗ ${col}/${docId}: ${e.message}`);
        failures.push({ col, docId, err: e.message });
      }
    }
  }

  console.log(`\nWrote ${ok} docs. Failures: ${failures.length}`);
  if (failures.length) process.exit(1);
}

main().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
