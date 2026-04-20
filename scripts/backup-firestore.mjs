// Full Firestore backup to local JSON files.
// Usage:  node scripts/backup-firestore.mjs
// Writes: firestore-backup/<YYYY-MM-DD-HHMM>/<collection>.json
// Read-only. Safe to run anytime.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const firebaseConfig = {
  apiKey: 'AIzaSyDgVii2X0447DHQb4gMrd3_x1YFUUoeqCs',
  authDomain: 'teatronit-db.firebaseapp.com',
  projectId: 'teatronit-db',
  storageBucket: 'teatronit-db.firebasestorage.app',
  messagingSenderId: '176098529719',
  appId: '1:176098529719:web:2834d5b28615a5588c5832',
};

const COLLECTIONS = ['shows', 'collections', 'recommendations', 'pages', 'settings'];

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const root = join(__dirname, '..');
  const outDir = join(root, 'firestore-backup', timestamp());
  mkdirSync(outDir, { recursive: true });

  const summary = {};
  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, name));
    const docs = snap.docs.map((d) => ({ _id: d.id, data: d.data() }));
    writeFileSync(join(outDir, `${name}.json`), JSON.stringify(docs, null, 2), 'utf8');
    summary[name] = docs.length;
    console.log(`  ${name}: ${docs.length} docs`);
  }

  writeFileSync(
    join(outDir, '_manifest.json'),
    JSON.stringify({ createdAt: new Date().toISOString(), counts: summary }, null, 2),
    'utf8',
  );

  console.log(`\nBackup written to: ${outDir}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
