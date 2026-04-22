// Move embedded show.video.clips / show.video.customerClips into the new
// library collections (clips_v2, customer_clips_v2) and populate
// show.clipIds / show.customerClipIds pointing at them.
//
// Non-destructive: the original embedded arrays on each show are left in
// place as a backup. After the site is verified with the new library,
// a future cleanup can remove them.
//
// Usage:
//   npx tsx scripts/migrate-clips-to-library.ts                       # dry-run
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/migrate-clips-to-library.ts --confirm
//
// Dedup: clips are deduplicated by youtubeId across shows. A clip that
// appears in multiple shows gets ONE library doc, and every referencing
// show gets that same id in its clipIds array.

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ClipSchema, CustomerClipSchema, type Clip, type CustomerClip } from '../lib/schema';

const firebaseConfig = {
  apiKey: 'AIzaSyDgVii2X0447DHQb4gMrd3_x1YFUUoeqCs',
  authDomain: 'teatronit-db.firebaseapp.com',
  projectId: 'teatronit-db',
  storageBucket: 'teatronit-db.firebasestorage.app',
  messagingSenderId: '176098529719',
  appId: '1:176098529719:web:2834d5b28615a5588c5832',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');

type EmbeddedClip = { youtubeId?: string; caption?: string };
type ShowRecord = {
  id: string;
  data: Record<string, unknown>;
  videoClips: EmbeddedClip[];
  videoCustomerClips: EmbeddedClip[];
  existingClipIds: string[];
  existingCustomerClipIds: string[];
};

async function readShows(): Promise<ShowRecord[]> {
  const snap = await getDocs(collection(db, 'shows_v2'));
  const shows: ShowRecord[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    const video = (data.video as Record<string, unknown>) || {};
    shows.push({
      id: d.id,
      data,
      videoClips: Array.isArray(video.clips) ? (video.clips as EmbeddedClip[]) : [],
      videoCustomerClips: Array.isArray(video.customerClips)
        ? (video.customerClips as EmbeddedClip[])
        : [],
      existingClipIds: Array.isArray(data.clipIds) ? (data.clipIds as string[]) : [],
      existingCustomerClipIds: Array.isArray(data.customerClipIds)
        ? (data.customerClipIds as string[])
        : [],
    });
  });
  return shows.sort((a, b) => a.id.localeCompare(b.id));
}

function allocateIds(
  existing: Record<string, { id: string; data: Clip | CustomerClip }>,
  prefix: string,
): (youtubeId: string, caption: string) => { id: string; data: Clip | CustomerClip; isNew: boolean } {
  // Reuse existing library doc if its youtubeId matches; otherwise allocate a
  // fresh id following the `${prefix}${n}` pattern, starting after the max.
  const byYoutubeId = new Map<string, { id: string; data: Clip | CustomerClip }>();
  let maxN = 0;
  const re = new RegExp(`^${prefix}(\\d+)$`);
  for (const [id, entry] of Object.entries(existing)) {
    byYoutubeId.set(entry.data.youtubeId, entry);
    const m = id.match(re);
    if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
  }

  return (youtubeId: string, caption: string) => {
    const existingEntry = byYoutubeId.get(youtubeId);
    if (existingEntry) {
      return { id: existingEntry.id, data: existingEntry.data, isNew: false };
    }
    maxN += 1;
    const id = `${prefix}${maxN}`;
    const data = { id, youtubeId, caption } as Clip | CustomerClip;
    const entry = { id, data };
    byYoutubeId.set(youtubeId, entry);
    existing[id] = entry;
    return { id, data, isNew: true };
  };
}

type Plan = {
  libraryClips: Record<string, { id: string; data: Clip }>;
  libraryCustomerClips: Record<string, { id: string; data: CustomerClip }>;
  showUpdates: Array<{ id: string; clipIds: string[]; customerClipIds: string[] }>;
  summary: {
    newClips: string[];
    newCustomerClips: string[];
    updatedShows: string[];
    skippedShows: string[];
  };
};

async function buildPlan(): Promise<Plan> {
  const shows = await readShows();

  const libraryClips: Record<string, { id: string; data: Clip }> = {};
  const libraryCustomerClips: Record<string, { id: string; data: CustomerClip }> = {};

  // Seed from the live library collections so we dedup against existing docs.
  const existingClipSnap = await getDocs(collection(db, 'clips_v2'));
  existingClipSnap.forEach((d) => {
    const parsed = ClipSchema.safeParse({ id: d.id, ...(d.data() as Record<string, unknown>) });
    if (parsed.success) libraryClips[d.id] = { id: d.id, data: parsed.data };
  });
  const existingCustomerSnap = await getDocs(collection(db, 'customer_clips_v2'));
  existingCustomerSnap.forEach((d) => {
    const parsed = CustomerClipSchema.safeParse({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    });
    if (parsed.success) libraryCustomerClips[d.id] = { id: d.id, data: parsed.data };
  });

  const allocClip = allocateIds(libraryClips, 'clip');
  const allocCustomer = allocateIds(libraryCustomerClips, 'cust');

  const showUpdates: Plan['showUpdates'] = [];
  const newClips = new Set<string>();
  const newCustomerClips = new Set<string>();
  const updatedShows: string[] = [];
  const skippedShows: string[] = [];

  for (const show of shows) {
    const hasLibraryRefs =
      show.existingClipIds.length > 0 || show.existingCustomerClipIds.length > 0;
    const hasEmbedded =
      show.videoClips.length > 0 || show.videoCustomerClips.length > 0;

    if (hasLibraryRefs && !hasEmbedded) {
      // Already fully migrated manually.
      skippedShows.push(show.id + ' (already migrated)');
      continue;
    }
    if (!hasEmbedded) {
      skippedShows.push(show.id + ' (no embedded clips)');
      continue;
    }

    const clipIds = [...show.existingClipIds];
    const customerClipIds = [...show.existingCustomerClipIds];

    for (const c of show.videoClips) {
      if (!c?.youtubeId) continue;
      const alloc = allocClip(c.youtubeId, c.caption ?? '');
      if (alloc.isNew) newClips.add(alloc.id);
      if (!clipIds.includes(alloc.id)) clipIds.push(alloc.id);
    }
    for (const c of show.videoCustomerClips) {
      if (!c?.youtubeId) continue;
      const alloc = allocCustomer(c.youtubeId, c.caption ?? '');
      if (alloc.isNew) newCustomerClips.add(alloc.id);
      if (!customerClipIds.includes(alloc.id)) customerClipIds.push(alloc.id);
    }

    const noChange =
      clipIds.length === show.existingClipIds.length &&
      clipIds.every((id, i) => id === show.existingClipIds[i]) &&
      customerClipIds.length === show.existingCustomerClipIds.length &&
      customerClipIds.every((id, i) => id === show.existingCustomerClipIds[i]);

    if (noChange) {
      skippedShows.push(show.id + ' (nothing to change)');
      continue;
    }

    showUpdates.push({ id: show.id, clipIds, customerClipIds });
    updatedShows.push(show.id);
  }

  return {
    libraryClips,
    libraryCustomerClips,
    showUpdates,
    summary: {
      newClips: Array.from(newClips),
      newCustomerClips: Array.from(newCustomerClips),
      updatedShows,
      skippedShows,
    },
  };
}

function writePreview(plan: Plan) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = join(REPO_ROOT, 'firestore-backup', 'clips-migration-preview-' + ts);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, 'library-clips.json'), JSON.stringify(plan.libraryClips, null, 2));
  writeFileSync(
    join(dir, 'library-customer-clips.json'),
    JSON.stringify(plan.libraryCustomerClips, null, 2),
  );
  writeFileSync(join(dir, 'show-updates.json'), JSON.stringify(plan.showUpdates, null, 2));
  writeFileSync(join(dir, 'summary.json'), JSON.stringify(plan.summary, null, 2));

  return dir;
}

async function applyPlan(plan: Plan) {
  for (const id of plan.summary.newClips) {
    const entry = plan.libraryClips[id];
    await setDoc(doc(db, 'clips_v2', id), entry.data);
    console.log(`  wrote clips_v2/${id}`);
  }
  for (const id of plan.summary.newCustomerClips) {
    const entry = plan.libraryCustomerClips[id];
    await setDoc(doc(db, 'customer_clips_v2', id), entry.data);
    console.log(`  wrote customer_clips_v2/${id}`);
  }
  for (const upd of plan.showUpdates) {
    await setDoc(
      doc(db, 'shows_v2', upd.id),
      { clipIds: upd.clipIds, customerClipIds: upd.customerClipIds },
      { merge: true },
    );
    console.log(`  updated shows_v2/${upd.id} (+clipIds, +customerClipIds)`);
  }
}

async function main() {
  const confirm = process.argv.includes('--confirm');

  if (confirm) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('--confirm requires ADMIN_EMAIL and ADMIN_PASSWORD in env.');
      process.exit(1);
    }
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in as', email);
  } else {
    console.log('Dry-run mode (no writes). Re-run with --confirm to apply.');
  }

  console.log('Building migration plan...');
  const plan = await buildPlan();

  console.log('Summary:');
  console.log(`  new clips library docs:          ${plan.summary.newClips.length}`);
  console.log(`  new customer-clips library docs: ${plan.summary.newCustomerClips.length}`);
  console.log(`  shows to update:                 ${plan.summary.updatedShows.length}`);
  console.log(`  shows skipped:                   ${plan.summary.skippedShows.length}`);
  if (plan.summary.skippedShows.length) {
    for (const s of plan.summary.skippedShows) console.log(`    - ${s}`);
  }

  const previewDir = writePreview(plan);
  console.log('Preview written to', previewDir);

  if (!confirm) {
    console.log('\nDone (dry-run). Inspect the preview, then re-run with --confirm to apply.');
    return;
  }

  console.log('\nApplying to Firestore...');
  await applyPlan(plan);
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
