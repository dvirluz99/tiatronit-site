// Storage reorganization planner.
//
// Scans Firestore v2 collections, finds every Firebase Storage URL that points
// under AllDir/<legacy-folder>/..., and plans a move to the new structure:
//
//   shows_v2/<id>       → AllDir/shows/<id>/<filename>
//   categories_v2/<id>  → AllDir/categories/<id>/<filename>
//   collections_v2/<id> → AllDir/collections/<id>/<filename>
//   pages_v2/<id>       → AllDir/pages/<id>/<filename>
//   settings_v2/homeGallery → AllDir/pages/homeGallery/<filename>
//
// Default: DRY RUN. Emits a plan to firestore-backup/<runId>/storage-move-plan/.
// Nothing is copied, deleted, or written to Firestore.
//
// Apply modes (run separately, each requires --confirm):
//   --phase=copy    Copy old files to new paths in Storage. Old files untouched.
//   --phase=update  Rewrite URLs in Firestore docs to the new paths.
//   --phase=delete  Delete the old source files. Only after site is verified.
//
// Usage:
//   npx tsx scripts/reorganize-storage.ts                 # dry-run preview
//   npx tsx scripts/reorganize-storage.ts --phase=copy --confirm
//   npx tsx scripts/reorganize-storage.ts --phase=update --confirm
//   npx tsx scripts/reorganize-storage.ts --phase=delete --confirm
//
// Admin auth (required for any --confirm run):
//   export ADMIN_EMAIL=...
//   export ADMIN_PASSWORD=...

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const firebaseConfig = {
  apiKey: 'AIzaSyDgVii2X0447DHQb4gMrd3_x1YFUUoeqCs',
  authDomain: 'teatronit-db.firebaseapp.com',
  projectId: 'teatronit-db',
  storageBucket: 'teatronit-db.firebasestorage.app',
  messagingSenderId: '176098529719',
  appId: '1:176098529719:web:2834d5b28615a5588c5832',
};

const CONFIRM = process.argv.includes('--confirm');
const phaseArg = process.argv.find((a) => a.startsWith('--phase='));
const PHASE = phaseArg ? phaseArg.split('=')[1] : 'preview';
const VALID_PHASES = ['preview', 'copy', 'update', 'delete'] as const;
if (!VALID_PHASES.includes(PHASE as (typeof VALID_PHASES)[number])) {
  console.error(`Invalid --phase. Use one of: ${VALID_PHASES.join(', ')}`);
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

const runId = timestamp();
const outDir = join(root, 'firestore-backup', runId, 'storage-move-plan');

// --- URL helpers ---

const STORAGE_HOST = 'firebasestorage.googleapis.com';
const BUCKET = 'teatronit-db.firebasestorage.app';

/** Extract the Storage object path from a Firebase download URL. Returns null if not a Storage URL for our bucket. */
function extractStoragePath(url: string): string | null {
  if (typeof url !== 'string' || !url.includes(STORAGE_HOST)) return null;
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

// --- Plan building ---

type EntityKind = 'show' | 'category' | 'collection' | 'page' | 'homeGallery';

type UrlReference = {
  collection: string;
  docId: string;
  fieldPath: string; // e.g. "gallery[3]" or "presentationFormats[0].image"
};

type PlannedMove = {
  oldPath: string; // AllDir/havale_shoah/image1.jpeg
  newPath: string; // AllDir/shows/p1/image1.jpeg
  owner: { kind: EntityKind; id: string };
  references: UrlReference[]; // all doc fields that point at oldPath
  oldUrl: string; // original full URL (used to copy + rewrite)
};

function newPathFor(owner: { kind: EntityKind; id: string }, oldPath: string): string {
  // Drop `AllDir/<top-legacy-folder>/` and keep everything after. This preserves
  // any nested subfolder (e.g. Parents_of_children/noam_first_grade/imge1.jpg
  // keeps the `noam_first_grade/` segment) so files with the same basename
  // don't collide when both the flat and nested variant are owned by the same
  // destination.
  const segments = oldPath.split('/');
  // oldPath looks like: AllDir/<legacy>/<...>/<file>
  const tail = segments.slice(2).join('/') || segments[segments.length - 1];
  switch (owner.kind) {
    case 'show':
      return `AllDir/shows/${owner.id}/${tail}`;
    case 'category':
      return `AllDir/categories/${owner.id}/${tail}`;
    case 'collection':
      return `AllDir/collections/${owner.id}/${tail}`;
    case 'page':
      return `AllDir/pages/${owner.id}/${tail}`;
    case 'homeGallery':
      return `AllDir/pages/homeGallery/${tail}`;
  }
}

/** Ownership precedence when multiple docs reference the same URL. Lower = owns. */
const KIND_PRIORITY: Record<EntityKind, number> = {
  show: 0,
  collection: 1,
  category: 2,
  page: 3,
  homeGallery: 4,
};

function alreadyInNewStructure(path: string): boolean {
  return (
    path.startsWith('AllDir/shows/') ||
    path.startsWith('AllDir/categories/') ||
    path.startsWith('AllDir/collections/') ||
    path.startsWith('AllDir/pages/')
  );
}

type DocRecord = { id: string; data: Record<string, unknown> };

async function listCollection(
  db: ReturnType<typeof getFirestore>,
  name: string,
): Promise<DocRecord[]> {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

type FieldHit = { fieldPath: string; url: string };

/** Walk a doc and yield every string field that looks like a Storage URL. */
function collectStorageFields(data: unknown, pathPrefix = ''): FieldHit[] {
  const hits: FieldHit[] = [];
  const walk = (v: unknown, p: string) => {
    if (v == null) return;
    if (typeof v === 'string') {
      const sp = extractStoragePath(v);
      if (sp) hits.push({ fieldPath: p, url: v });
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, `${p}[${i}]`));
      return;
    }
    if (typeof v === 'object') {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        walk(val, p ? `${p}.${k}` : k);
      }
    }
  };
  walk(data, pathPrefix);
  return hits;
}

type ScanResult = {
  moves: PlannedMove[];
  skipped: {
    alreadyOrganized: UrlReference[];
    externalOrUnparseable: UrlReference[];
  };
  totalUrls: number;
  shared: Array<{ oldPath: string; refs: UrlReference[]; ownerKind: EntityKind; ownerId: string }>;
};

async function buildPlan(db: ReturnType<typeof getFirestore>): Promise<ScanResult> {
  const [shows, cats, colls, pages, settings] = await Promise.all([
    listCollection(db, 'shows_v2'),
    listCollection(db, 'categories_v2'),
    listCollection(db, 'collections_v2'),
    listCollection(db, 'pages_v2'),
    listCollection(db, 'settings_v2'),
  ]);

  const refsByPath = new Map<
    string,
    { refs: UrlReference[]; owners: Array<{ kind: EntityKind; id: string }>; firstUrl: string }
  >();
  const alreadyOrganized: UrlReference[] = [];
  let totalUrls = 0;

  function recordHits(
    kind: EntityKind,
    ownerId: string,
    collectionName: string,
    docs: DocRecord[],
  ) {
    for (const d of docs) {
      const hits = collectStorageFields(d.data);
      totalUrls += hits.length;
      for (const h of hits) {
        const oldPath = extractStoragePath(h.url)!;
        const ref: UrlReference = {
          collection: collectionName,
          docId: d.id,
          fieldPath: h.fieldPath,
        };
        if (alreadyInNewStructure(oldPath)) {
          alreadyOrganized.push(ref);
          continue;
        }
        const bucket = refsByPath.get(oldPath) ?? {
          refs: [],
          owners: [],
          firstUrl: h.url,
        };
        bucket.refs.push(ref);
        // owner is derived from the doc that references the URL, not the path itself.
        // Each doc that references a URL is a candidate owner; we pick by priority after scan.
        const candidate = {
          kind,
          id: kind === 'homeGallery' ? 'homeGallery' : ownerId,
        };
        if (!bucket.owners.some((o) => o.kind === candidate.kind && o.id === candidate.id)) {
          bucket.owners.push(candidate);
        }
        refsByPath.set(oldPath, bucket);
      }
    }
  }

  for (const s of shows) recordHits('show', s.id, 'shows_v2', [s]);
  for (const c of cats) recordHits('category', c.id, 'categories_v2', [c]);
  for (const c of colls) recordHits('collection', c.id, 'collections_v2', [c]);
  for (const p of pages) recordHits('page', p.id, 'pages_v2', [p]);
  for (const s of settings) {
    const kind: EntityKind = s.id === 'homeGallery' ? 'homeGallery' : 'page';
    recordHits(kind, s.id, 'settings_v2', [s]);
  }

  const moves: PlannedMove[] = [];
  const shared: ScanResult['shared'] = [];
  for (const [oldPath, bucket] of refsByPath) {
    // pick owner by priority (show > collection > category > page > homeGallery)
    const owner = [...bucket.owners].sort(
      (a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind],
    )[0];
    const newPath = newPathFor(owner, oldPath);
    const plan: PlannedMove = {
      oldPath,
      newPath,
      owner,
      references: bucket.refs,
      oldUrl: bucket.firstUrl,
    };
    moves.push(plan);
    if (bucket.owners.length > 1) {
      shared.push({ oldPath, refs: bucket.refs, ownerKind: owner.kind, ownerId: owner.id });
    }
  }

  return {
    moves,
    skipped: { alreadyOrganized, externalOrUnparseable: [] },
    totalUrls,
    shared,
  };
}

// --- Preview output ---

function writePreview(plan: ScanResult) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'moves.json'), JSON.stringify(plan.moves, null, 2), 'utf8');
  writeFileSync(
    join(outDir, 'shared-urls.json'),
    JSON.stringify(plan.shared, null, 2),
    'utf8',
  );

  // Destination breakdown.
  const byDest = new Map<string, number>();
  for (const m of plan.moves) {
    const destKey = `${m.owner.kind}/${m.owner.id}`;
    byDest.set(destKey, (byDest.get(destKey) ?? 0) + 1);
  }
  const sortedDest = [...byDest.entries()].sort((a, b) => b[1] - a[1]);

  // Collisions at the same new path (same basename).
  const destPaths = new Map<string, number>();
  for (const m of plan.moves) {
    destPaths.set(m.newPath, (destPaths.get(m.newPath) ?? 0) + 1);
  }
  const collisions = [...destPaths.entries()].filter(([, n]) => n > 1);

  const lines: string[] = [];
  lines.push(`=== Storage Reorganization Preview (run ${runId}) ===`);
  lines.push('');
  lines.push(`Total URLs scanned in Firestore: ${plan.totalUrls}`);
  lines.push(`  already in new structure (skipped): ${plan.skipped.alreadyOrganized.length}`);
  lines.push(`  unique legacy files to move:        ${plan.moves.length}`);
  lines.push(`  URLs shared across multiple docs:   ${plan.shared.length}`);
  lines.push(`  destination-path collisions:        ${collisions.length}`);
  lines.push('');
  lines.push('By destination folder (top 20):');
  for (const [dest, count] of sortedDest.slice(0, 20)) {
    lines.push(`  ${dest.padEnd(30)} ${count} file(s)`);
  }
  if (sortedDest.length > 20) {
    lines.push(`  ... and ${sortedDest.length - 20} more`);
  }
  lines.push('');

  lines.push('Sample moves (first 15):');
  for (const m of plan.moves.slice(0, 15)) {
    lines.push(`  ${m.oldPath}`);
    lines.push(`    → ${m.newPath}  (owner: ${m.owner.kind}/${m.owner.id}, refs: ${m.references.length})`);
  }
  lines.push('');

  if (plan.shared.length > 0) {
    lines.push(`Shared URLs (${plan.shared.length}) — one file referenced by multiple docs:`);
    for (const s of plan.shared.slice(0, 10)) {
      lines.push(`  ${s.oldPath}`);
      lines.push(`    → owner: ${s.ownerKind}/${s.ownerId}  (refs: ${s.refs.length})`);
      for (const r of s.refs.slice(0, 5)) {
        lines.push(`      - ${r.collection}/${r.docId} at ${r.fieldPath}`);
      }
    }
    if (plan.shared.length > 10) lines.push(`  ... and ${plan.shared.length - 10} more (see shared-urls.json)`);
    lines.push('');
  }

  if (collisions.length > 0) {
    lines.push(`⚠ Destination-path collisions (${collisions.length}) — same basename lands in same folder:`);
    for (const [path, n] of collisions.slice(0, 10)) {
      lines.push(`  ${path}  ×${n}`);
    }
    lines.push('  → These would overwrite each other. Review before phase=copy.');
    lines.push('');
  }

  lines.push('Output files:');
  lines.push(`  ${join(outDir, 'moves.json')}`);
  lines.push(`  ${join(outDir, 'shared-urls.json')}`);
  lines.push(`  ${join(outDir, 'summary.txt')}`);
  lines.push('');
  lines.push('Next steps:');
  lines.push('  1. Review moves.json and shared-urls.json.');
  lines.push('  2. Run: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/reorganize-storage.ts --phase=copy --confirm');
  lines.push('  3. Verify files exist at new paths in the Firebase console.');
  lines.push('  4. Run: ... --phase=update --confirm   (rewrites URLs in Firestore)');
  lines.push('  5. Verify the site renders correctly from the new URLs.');
  lines.push('  6. After stability (days, not minutes): --phase=delete --confirm to remove old files.');

  const summary = lines.join('\n');
  writeFileSync(join(outDir, 'summary.txt'), summary, 'utf8');
  console.log(summary);
}

// --- Apply phases (require --confirm) ---

async function requireAuth() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL / ADMIN_PASSWORD env vars. Required for any --confirm run.');
    process.exit(1);
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, email, password);
  return app;
}

async function applyCopy(plan: ScanResult) {
  if (!CONFIRM) {
    console.error('Refusing to run --phase=copy without --confirm.');
    process.exit(1);
  }
  const app = await requireAuth();
  const storage = getStorage(app);
  console.log(`Copying ${plan.moves.length} files...`);
  let ok = 0;
  const failures: Array<{ oldPath: string; newPath: string; error: string }> = [];
  for (const m of plan.moves) {
    try {
      const res = await fetch(m.oldUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${m.oldUrl}`);
      const buf = new Uint8Array(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') ?? undefined;
      await uploadBytes(ref(storage, m.newPath), buf, contentType ? { contentType } : undefined);
      ok++;
      if (ok % 10 === 0) console.log(`  copied ${ok}/${plan.moves.length}`);
    } catch (e) {
      failures.push({ oldPath: m.oldPath, newPath: m.newPath, error: (e as Error).message });
    }
  }
  console.log(`Copy complete: ${ok} ok, ${failures.length} failed.`);
  if (failures.length) {
    writeFileSync(join(outDir, 'copy-failures.json'), JSON.stringify(failures, null, 2), 'utf8');
    console.log(`  failures written to ${join(outDir, 'copy-failures.json')}`);
  }
}

async function applyUpdate(plan: ScanResult) {
  if (!CONFIRM) {
    console.error('Refusing to run --phase=update without --confirm.');
    process.exit(1);
  }
  const app = await requireAuth();
  const db = getFirestore(app);

  // Build URL-rewrite map: oldUrl -> newUrl. We need the real new URL including
  // the download token, which means we need to read each new file's metadata.
  // Simpler: for each referenced doc, reload it fresh, then replace every
  // occurrence of an old Storage path in any string field with the new path,
  // producing a new Firebase download URL. Firebase Storage download URLs
  // include a token we don't have — but a public-read path works with
  // "?alt=media" which we'll emit via getDownloadURL instead.
  const { getDownloadURL } = await import('firebase/storage');
  const storage = getStorage(app);

  // Map oldPath -> newUrl (resolved once).
  const urlByOldPath = new Map<string, string>();
  for (const m of plan.moves) {
    try {
      const url = await getDownloadURL(ref(storage, m.newPath));
      urlByOldPath.set(m.oldPath, url);
    } catch (e) {
      console.error(`  skip (new file missing): ${m.newPath} — run --phase=copy first`);
    }
  }

  // Group references by doc.
  const docsToRewrite = new Map<string, Set<string>>(); // key: `${coll}/${id}`, value: set of oldPaths referenced
  for (const m of plan.moves) {
    for (const r of m.references) {
      const k = `${r.collection}/${r.docId}`;
      const s = docsToRewrite.get(k) ?? new Set<string>();
      s.add(m.oldPath);
      docsToRewrite.set(k, s);
    }
  }

  console.log(`Updating ${docsToRewrite.size} docs...`);
  let ok = 0;
  for (const [key, oldPaths] of docsToRewrite) {
    const [coll, docId] = key.split('/');
    const snap = await getDocs(collection(db, coll));
    const found = snap.docs.find((d) => d.id === docId);
    if (!found) continue;
    const data = found.data();
    const rewritten = rewriteUrlsInObject(data, (s) => {
      const sp = extractStoragePath(s);
      if (!sp || !oldPaths.has(sp)) return s;
      return urlByOldPath.get(sp) ?? s;
    });
    await setDoc(doc(db, coll, docId), rewritten);
    ok++;
  }
  console.log(`Firestore URL rewrite complete: ${ok} docs updated.`);
}

function rewriteUrlsInObject(input: unknown, mapFn: (s: string) => string): unknown {
  if (input == null) return input;
  if (typeof input === 'string') return mapFn(input);
  if (Array.isArray(input)) return input.map((v) => rewriteUrlsInObject(v, mapFn));
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = rewriteUrlsInObject(v, mapFn);
    }
    return out;
  }
  return input;
}

async function applyDelete(plan: ScanResult) {
  if (!CONFIRM) {
    console.error('Refusing to run --phase=delete without --confirm.');
    process.exit(1);
  }
  const app = await requireAuth();
  const storage = getStorage(app);
  console.log(`Deleting ${plan.moves.length} old files...`);
  let ok = 0;
  const failures: string[] = [];
  for (const m of plan.moves) {
    try {
      await deleteObject(ref(storage, m.oldPath));
      ok++;
    } catch (e) {
      failures.push(`${m.oldPath}: ${(e as Error).message}`);
    }
  }
  console.log(`Delete complete: ${ok} ok, ${failures.length} failed.`);
  if (failures.length) {
    writeFileSync(join(outDir, 'delete-failures.txt'), failures.join('\n'), 'utf8');
  }
}

// --- main ---

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Scanning Firestore v2 collections for Storage URLs...`);
  const plan = await buildPlan(db);

  if (PHASE === 'preview') {
    writePreview(plan);
    return;
  }

  // Apply phases write the plan too, so the user always has a record of what ran.
  writePreview(plan);

  if (PHASE === 'copy') await applyCopy(plan);
  else if (PHASE === 'update') await applyUpdate(plan);
  else if (PHASE === 'delete') await applyDelete(plan);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
