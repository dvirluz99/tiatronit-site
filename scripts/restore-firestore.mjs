// Restore Firestore from a local JSON backup.
// Usage:  node scripts/restore-firestore.mjs <backup-folder> --confirm
// Example: node scripts/restore-firestore.mjs firestore-backup/2026-04-20-2305 --confirm
//
// DESTRUCTIVE: overwrites each document at the original ID with setDoc.
// Requires the --confirm flag to actually write. Without it, runs in dry-run mode.

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const firebaseConfig = {
  apiKey: 'AIzaSyDgVii2X0447DHQb4gMrd3_x1YFUUoeqCs',
  authDomain: 'teatronit-db.firebaseapp.com',
  projectId: 'teatronit-db',
  storageBucket: 'teatronit-db.firebasestorage.app',
  messagingSenderId: '176098529719',
  appId: '1:176098529719:web:2834d5b28615a5588c5832',
};

async function main() {
  const [, , backupArg, confirmFlag] = process.argv;
  if (!backupArg) {
    console.error('Usage: node scripts/restore-firestore.mjs <backup-folder> [--confirm]');
    process.exit(1);
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const root = join(__dirname, '..');
  const folder = join(root, backupArg);
  const dryRun = confirmFlag !== '--confirm';

  const files = readdirSync(folder).filter((f) => f.endsWith('.json') && f !== '_manifest.json');
  console.log(`Restoring from ${folder}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE WRITE'}\n`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const file of files) {
    const collectionName = basename(file, '.json');
    const docs = JSON.parse(readFileSync(join(folder, file), 'utf8'));
    console.log(`[${collectionName}] ${docs.length} docs`);
    for (const d of docs) {
      if (!dryRun) {
        await setDoc(doc(db, collectionName, d._id), d.data);
      }
      console.log(`  ${dryRun ? 'would write' : 'wrote'} ${collectionName}/${d._id}`);
    }
  }

  console.log(dryRun ? '\nDry run complete. Re-run with --confirm to apply.' : '\nRestore complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
