// Migration v1 -> v2.
//
//   Read:  shows, collections, recommendations, pages, settings  (v1)
//   Write: shows_v2, collections_v2, recommendations_v2, pages_v2, settings_v2
//
// Safe by default: --confirm is required to actually write to Firestore.
// Without --confirm, the transformed docs are written to a local preview
// folder under firestore-backup/<timestamp>/v2-preview/ for review.
//
// Usage:
//   npx tsx scripts/migrate-to-v2.ts                # dry-run (preview only)
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/migrate-to-v2.ts --confirm
//
// --confirm mode writes to Firestore v2 collections. Because the live rules
// require an admin UID, you must provide ADMIN_EMAIL + ADMIN_PASSWORD env vars
// so the script can sign in before writing.

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ShowSchema,
  CollectionSchema,
  RecommendationSchema,
  AboutPageSchema,
  PuppetsPageSchema,
  HomeGallerySchema,
  V2_COLLECTIONS,
  V1_COLLECTIONS,
  extractYoutubeId,
  parseLinkedPath,
  type Show,
  type Collection,
  type Recommendation,
  type AboutPage,
  type PuppetsPage,
  type HomeGallery,
  type ShowCategory,
} from '../lib/schema';

const firebaseConfig = {
  apiKey: 'AIzaSyDgVii2X0447DHQb4gMrd3_x1YFUUoeqCs',
  authDomain: 'teatronit-db.firebaseapp.com',
  projectId: 'teatronit-db',
  storageBucket: 'teatronit-db.firebasestorage.app',
  messagingSenderId: '176098529719',
  appId: '1:176098529719:web:2834d5b28615a5588c5832',
};

const CONFIRM = process.argv.includes('--confirm');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

const runId = timestamp();
const previewDir = join(root, 'firestore-backup', runId, 'v2-preview');

type AnyRecord = Record<string, unknown>;

// --- transforms ---

function normalizeImportance(value: unknown): 'featured' | 'normal' {
  return value === 'recommended' ? 'featured' : 'normal';
}

function flattenGallery(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'img' in item) return String((item as AnyRecord).img ?? '');
      return '';
    })
    .filter((s) => s.length > 0);
}

function extractYoutubeIds(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((v) => (typeof v === 'string' ? extractYoutubeId(v) : null))
    .filter((v): v is string => Boolean(v));
}

function extractClips(list: unknown): Array<{ youtubeId: string; caption: string }> {
  if (!Array.isArray(list)) return [];
  return list
    .map((raw) => {
      const rec = raw as AnyRecord;
      const yid =
        typeof rec?.youtubeId === 'string' ? extractYoutubeId(rec.youtubeId) : null;
      if (!yid) return null;
      return { youtubeId: yid, caption: String(rec?.caption ?? '') };
    })
    .filter((v): v is { youtubeId: string; caption: string } => Boolean(v));
}

function transformShow(id: string, v1: AnyRecord): Show {
  const showData = (v1.showData as AnyRecord | undefined) ?? {};
  const vidue = (v1.vidue as AnyRecord | undefined) ?? {};

  const presentationFormats: Array<{ image: string; caption: string }> = [];
  const mainImg1 = typeof v1.mainImg1 === 'string' ? v1.mainImg1.trim() : '';
  const mainImg2 = typeof v1.mainImg2 === 'string' ? v1.mainImg2.trim() : '';
  if (mainImg1) {
    presentationFormats.push({
      image: mainImg1,
      caption: typeof v1.textUnderImg1 === 'string' ? v1.textUnderImg1 : '',
    });
  }
  if (mainImg2) {
    presentationFormats.push({
      image: mainImg2,
      caption: typeof v1.textUnderImg2 === 'string' ? v1.textUnderImg2 : '',
    });
  }

  const category = (['kids', 'youth', 'adults'] as const).includes(v1.category as ShowCategory)
    ? (v1.category as ShowCategory)
    : 'adults';

  const parsed: Show = {
    id,
    title: String(v1.title ?? showData.title ?? '').trim(),
    category,
    priority: normalizeImportance(v1.importance),
    mainImg: typeof v1.mainImg === 'string' ? v1.mainImg : '',
    presentationFormats,
    gallery: flattenGallery(v1.arrayGallery),
    description: String(showData.description ?? ''),
    audience: String(showData.audience ?? ''),
    creatorName: String(showData.creatorName ?? ''),
    creatorIntro: String(showData.creatorIntro ?? ''),
    creatorCredentials: String(showData.creatorCredentials ?? ''),
    socialProof: String(showData.socialProof ?? ''),
    phone: String(showData.phone ?? ''),
    video: {
      trailers: extractYoutubeIds(vidue.Trailer),
      clips: extractClips(vidue.clips),
      customerClips: extractClips(vidue.customers),
    },
    recommendationIds: Array.isArray(v1.linkRec) ? (v1.linkRec as string[]) : [],
    clipIds: [],
    customerClipIds: [],
    kind: 'show' as const,
    containedShowIds: [],
    labels: {
      heroEyebrowFeatured: '',
      heroEyebrowDefault: '',
      formatsLabel: '',
      containedShowsTitle: '',
      aboutTitle: '',
      socialProofTitle: '',
      clipsTitle: '',
      galleryTitle: '',
      textTestimonialsTitle: '',
      videoTestimonialsTitle: '',
    },
  };
  return ShowSchema.parse(parsed);
}

function transformCollection(id: string, v1: AnyRecord): Collection {
  const base = {
    id,
    title: String(v1.title ?? '').trim(),
    description: String(v1.description ?? ''),
    extendedHtml: String(v1.extraContent ?? ''),
    mainImg: typeof v1.mainImg === 'string' ? v1.mainImg : '',
    priority: normalizeImportance(v1.importance),
    gallery: flattenGallery(v1.collectionGallery),
    videos: extractYoutubeIds(v1.collectionVideo),
    recommendationIds: Array.isArray(v1.linkRec) ? (v1.linkRec as string[]) : [],
  };

  if (v1.type === 'single') {
    const linkedShowId = String(v1.linkedShowId ?? '').trim();
    return CollectionSchema.parse({ ...base, type: 'single', linkedShowId });
  }
  const showIds = Array.isArray(v1.contains) ? (v1.contains as string[]) : [];
  return CollectionSchema.parse({ ...base, type: 'collection', showIds });
}

function transformRecommendation(id: string, v1: AnyRecord): Recommendation {
  const linkedTarget = parseLinkedPath(typeof v1.linkedShowId === 'string' ? v1.linkedShowId : '');
  const parsed: Recommendation = {
    id,
    recommenderName: String(v1.recommenderName ?? '').trim(),
    recommenderRole: String(v1.recommenderRole ?? ''),
    recommenderImage: String(v1.recommenderImage ?? ''),
    contactInfo: String(v1.contactInfo ?? ''),
    date: String(v1.date ?? ''),
    content: String(v1.content ?? ''),
    linkedTarget,
  };
  return RecommendationSchema.parse(parsed);
}

function transformAbout(v1: AnyRecord): AboutPage {
  const testimonialsRaw = Array.isArray(v1.testimonials) ? v1.testimonials : [];
  const testimonials = (testimonialsRaw as AnyRecord[]).map((t) => ({
    author: String(t.author ?? ''),
    fromShowTitle: String(t.fromPresention ?? ''),
    showId: String(t.linkP ?? ''),
    recommendationId: String(t.linkRecId ?? ''),
    text: String(t.text ?? ''),
  }));

  return AboutPageSchema.parse({
    title: String(v1.title ?? ''),
    mainImage: typeof v1.mainImage === 'string' ? v1.mainImage : '',
    mainDescription: String(v1.mainDescription ?? ''),
    testimonials,
  });
}

function transformPuppets(v1: AnyRecord): PuppetsPage {
  const ytRaw = typeof v1.youtubeVideoId === 'string' ? v1.youtubeVideoId : '';
  const youtubeVideoId = extractYoutubeId(ytRaw) ?? '';

  const infoList = Array.isArray(v1.infoList)
    ? (v1.infoList as AnyRecord[]).map((item) => ({
        title: String(item.title ?? ''),
        text: String(item.text ?? ''),
      }))
    : [];

  return PuppetsPageSchema.parse({
    title: String(v1.title ?? ''),
    subtitle: String(v1.subtitle ?? ''),
    paragraph: String(v1.paragraph ?? ''),
    youtubeVideoId,
    infoSectionTitle: String(v1.infoTitle ?? ''),
    infoListTitle: String(v1.subTitle ?? ''),
    infoList,
    summaryQuote: String(v1.summaryQuote ?? ''),
  });
}

function transformHomeGallery(v1: AnyRecord): HomeGallery {
  const images = Array.isArray(v1.images) ? (v1.images as string[]).filter(Boolean) : [];
  return HomeGallerySchema.parse({ images });
}

// --- runner ---

type Entry<T> = { id: string; v1: AnyRecord; v2: T };

async function run(): Promise<void> {
  console.log(`Migration run: ${runId}`);
  console.log(`Mode: ${CONFIRM ? 'LIVE (writing to Firestore v2)' : 'DRY-RUN (preview only)'}\n`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const showsV1 = (await getDocs(collection(db, V1_COLLECTIONS.shows))).docs;
  const collectionsV1 = (await getDocs(collection(db, V1_COLLECTIONS.collections))).docs;
  const recsV1 = (await getDocs(collection(db, V1_COLLECTIONS.recommendations))).docs;
  const pagesV1 = (await getDocs(collection(db, V1_COLLECTIONS.pages))).docs;
  const settingsV1 = (await getDocs(collection(db, V1_COLLECTIONS.settings))).docs;

  const shows: Entry<Show>[] = [];
  const failures: Array<{ scope: string; id: string; err: string }> = [];

  for (const d of showsV1) {
    try {
      shows.push({ id: d.id, v1: d.data(), v2: transformShow(d.id, d.data()) });
    } catch (e) {
      failures.push({ scope: 'shows', id: d.id, err: (e as Error).message });
    }
  }

  const cols: Entry<Collection>[] = [];
  for (const d of collectionsV1) {
    try {
      cols.push({ id: d.id, v1: d.data(), v2: transformCollection(d.id, d.data()) });
    } catch (e) {
      failures.push({ scope: 'collections', id: d.id, err: (e as Error).message });
    }
  }

  const recs: Entry<Recommendation>[] = [];
  for (const d of recsV1) {
    try {
      recs.push({ id: d.id, v1: d.data(), v2: transformRecommendation(d.id, d.data()) });
    } catch (e) {
      failures.push({ scope: 'recommendations', id: d.id, err: (e as Error).message });
    }
  }

  const pagesOut: Array<{ id: string; data: AboutPage | PuppetsPage }> = [];
  for (const d of pagesV1) {
    try {
      if (d.id === 'about') pagesOut.push({ id: 'about', data: transformAbout(d.data()) });
      else if (d.id === 'puppets') pagesOut.push({ id: 'puppets', data: transformPuppets(d.data()) });
    } catch (e) {
      failures.push({ scope: 'pages', id: d.id, err: (e as Error).message });
    }
  }

  const settingsOut: Array<{ id: string; data: HomeGallery }> = [];
  for (const d of settingsV1) {
    try {
      if (d.id === 'homeGallery') {
        settingsOut.push({ id: 'homeGallery', data: transformHomeGallery(d.data()) });
      }
    } catch (e) {
      failures.push({ scope: 'settings', id: d.id, err: (e as Error).message });
    }
  }

  console.log('Transform summary:');
  console.log(`  shows:           ${shows.length} / ${showsV1.length}`);
  console.log(`  collections:     ${cols.length} / ${collectionsV1.length}`);
  console.log(`  recommendations: ${recs.length} / ${recsV1.length}`);
  console.log(`  pages:           ${pagesOut.length} / ${pagesV1.length}`);
  console.log(`  settings:        ${settingsOut.length} / ${settingsV1.length}`);

  if (failures.length) {
    console.log(`\n⚠️  ${failures.length} transform failure(s):`);
    for (const f of failures) console.log(`  [${f.scope}/${f.id}] ${f.err}`);
  }

  if (!CONFIRM) {
    mkdirSync(previewDir, { recursive: true });
    const serialize = <T>(list: Array<Entry<T>>) =>
      list.map((e) => ({ _id: e.id, data: e.v2 }));
    writeFileSync(join(previewDir, 'shows_v2.json'), JSON.stringify(serialize(shows), null, 2));
    writeFileSync(join(previewDir, 'collections_v2.json'), JSON.stringify(serialize(cols), null, 2));
    writeFileSync(
      join(previewDir, 'recommendations_v2.json'),
      JSON.stringify(serialize(recs), null, 2),
    );
    writeFileSync(join(previewDir, 'pages_v2.json'), JSON.stringify(pagesOut, null, 2));
    writeFileSync(join(previewDir, 'settings_v2.json'), JSON.stringify(settingsOut, null, 2));
    writeFileSync(
      join(previewDir, '_failures.json'),
      JSON.stringify(failures, null, 2),
    );
    console.log(`\nDry-run preview written to:\n  ${previewDir}`);
    console.log('\nRe-run with --confirm to write these to Firestore v2 collections.');
    process.exit(0);
  }

  if (failures.length > 0) {
    console.error('\n❌ Refusing to write: fix the failures above first.');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error(
      '\n❌ ADMIN_EMAIL and ADMIN_PASSWORD env vars required for --confirm.\n' +
        '   Example: ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="..." npx tsx scripts/migrate-to-v2.ts --confirm',
    );
    process.exit(1);
  }

  const auth = getAuth(app);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log(`Signed in as ${email}`);
  } catch (err) {
    console.error('❌ Sign-in failed:', (err as Error).message);
    process.exit(1);
  }

  console.log('\nWriting to Firestore v2 collections...');
  for (const e of shows) {
    await setDoc(doc(db, V2_COLLECTIONS.shows, e.id), e.v2);
    console.log(`  wrote ${V2_COLLECTIONS.shows}/${e.id}`);
  }
  for (const e of cols) {
    await setDoc(doc(db, V2_COLLECTIONS.collections, e.id), e.v2);
    console.log(`  wrote ${V2_COLLECTIONS.collections}/${e.id}`);
  }
  for (const e of recs) {
    await setDoc(doc(db, V2_COLLECTIONS.recommendations, e.id), e.v2);
    console.log(`  wrote ${V2_COLLECTIONS.recommendations}/${e.id}`);
  }
  for (const p of pagesOut) {
    await setDoc(doc(db, V2_COLLECTIONS.pages, p.id), p.data);
    console.log(`  wrote ${V2_COLLECTIONS.pages}/${p.id}`);
  }
  for (const s of settingsOut) {
    await setDoc(doc(db, V2_COLLECTIONS.settings, s.id), s.data);
    console.log(`  wrote ${V2_COLLECTIONS.settings}/${s.id}`);
  }
  console.log('\n✅ Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
