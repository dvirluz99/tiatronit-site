// Strip HTML tags from recommendation.content fields in v2 (and v1 for consistency).
// Uses the OAuth admin token from firebase-tools (bypasses API key restrictions).
//
// Usage:
//   node scripts/strip-recommendation-html.mjs              # dry-run, prints changes
//   node scripts/strip-recommendation-html.mjs --confirm    # writes back

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIRM = process.argv.includes('--confirm');
const PROJECT = 'teatronit-db';
const DATABASE = '(default)';
const CONFIG = join(homedir(), '.config', 'configstore', 'firebase-tools.json');

function htmlToPlain(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

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
  if (!r.ok) throw new Error('Refresh: ' + (await r.text()));
  return (await r.json()).access_token;
}

async function getToken() {
  const { tokens } = JSON.parse(readFileSync(CONFIG, 'utf8'));
  if (!tokens.expires_at || Date.now() >= tokens.expires_at) return refreshToken(tokens.refresh_token);
  return tokens.access_token;
}

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DATABASE}/documents`;

async function listCollection(token, name) {
  const out = [];
  let pageToken = '';
  do {
    const url = `${BASE}/${name}?pageSize=200${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const r = await fetch(url, { headers: { authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error('List: ' + (await r.text()));
    const data = await r.json();
    out.push(...(data.documents || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return out;
}

async function patchField(token, fullName, field, value) {
  const url = `https://firestore.googleapis.com/v1/${fullName}?updateMask.fieldPaths=${field}`;
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({ fields: { [field]: { stringValue: value } } }),
  });
  if (!r.ok) throw new Error('PATCH: ' + (await r.text()));
}

async function processCollection(token, name) {
  const docs = await listCollection(token, name);
  let changed = 0;
  for (const d of docs) {
    const content = d.fields?.content?.stringValue;
    if (!content || !content.includes('<')) continue;
    const cleaned = htmlToPlain(content);
    if (cleaned === content) continue;
    const id = d.name.split('/').pop();
    console.log(`  ${name}/${id}`);
    console.log(`    before: ${content.slice(0, 80).replace(/\n/g, ' ')}${content.length > 80 ? '...' : ''}`);
    console.log(`    after:  ${cleaned.slice(0, 80).replace(/\n/g, ' ')}${cleaned.length > 80 ? '...' : ''}`);
    if (CONFIRM) {
      await patchField(token, d.name, 'content', cleaned);
    }
    changed++;
  }
  console.log(`  total changed in ${name}: ${changed}\n`);
  return changed;
}

async function main() {
  const token = await getToken();
  console.log(`Mode: ${CONFIRM ? 'LIVE write' : 'DRY-RUN (preview)'}\n`);

  let total = 0;
  total += await processCollection(token, 'recommendations_v2');
  total += await processCollection(token, 'recommendations');

  console.log(`Total docs cleaned: ${total}`);
  if (!CONFIRM && total > 0) console.log('Re-run with --confirm to write.');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
