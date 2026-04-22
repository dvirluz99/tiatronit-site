import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { unstable_cache } from 'next/cache';

const REVALIDATE_TIME = 60;

// All readers target the v2 collections. Field names match lib/schema/*.ts.

export const getHomePageStructure = unstable_cache(
  async () => {
    const snap = await getDocs(collection(db, 'collections_v2'));
    const cards = [];
    snap.forEach((d) => cards.push({ id: d.id, ...d.data() }));
    return cards.sort((a, b) => a.id.localeCompare(b.id));
  },
  ['home-page-structure-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getAllShows = unstable_cache(
  async () => {
    const snap = await getDocs(collection(db, 'shows_v2'));
    const shows = {};
    snap.forEach((d) => {
      shows[d.id] = { id: d.id, ...d.data() };
    });
    return shows;
  },
  ['all-shows-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getShowById = async (showId) =>
  unstable_cache(
    async () => {
      const snap = await getDoc(doc(db, 'shows_v2', showId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    [`show-v2-${showId}`],
    { revalidate: REVALIDATE_TIME },
  )();

export const getCollectionById = async (cardId) =>
  unstable_cache(
    async () => {
      const snap = await getDoc(doc(db, 'collections_v2', cardId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    [`collection-v2-${cardId}`],
    { revalidate: REVALIDATE_TIME },
  )();

export const getAboutData = unstable_cache(
  async () => {
    const snap = await getDoc(doc(db, 'pages_v2', 'about'));
    return snap.exists() ? snap.data() : null;
  },
  ['about-data-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getPuppetsData = unstable_cache(
  async () => {
    const snap = await getDoc(doc(db, 'pages_v2', 'puppets'));
    return snap.exists() ? snap.data() : null;
  },
  ['puppets-data-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getRecommendations = unstable_cache(
  async () => {
    const snap = await getDocs(collection(db, 'recommendations_v2'));
    const recs = {};
    snap.forEach((d) => {
      recs[d.id] = { id: d.id, ...d.data() };
    });
    return recs;
  },
  ['recommendations-data-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getClips = unstable_cache(
  async () => {
    const snap = await getDocs(collection(db, 'clips_v2'));
    const clips = {};
    snap.forEach((d) => {
      clips[d.id] = { id: d.id, ...d.data() };
    });
    return clips;
  },
  ['clips-data-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getCustomerClips = unstable_cache(
  async () => {
    const snap = await getDocs(collection(db, 'customer_clips_v2'));
    const clips = {};
    snap.forEach((d) => {
      clips[d.id] = { id: d.id, ...d.data() };
    });
    return clips;
  },
  ['customer-clips-data-v2'],
  { revalidate: REVALIDATE_TIME },
);

// Resolve a show's clip references — prefers library (clipIds → clips_v2),
// falls back to the legacy embedded video.clips for shows that haven't
// been migrated yet. Drops references that no longer exist in the library.
export function resolveShowClips(show, library) {
  if (!show) return [];
  const ids = Array.isArray(show.clipIds) ? show.clipIds : [];
  if (ids.length > 0 && library) {
    return ids.map((id) => library[id]).filter(Boolean);
  }
  return Array.isArray(show.video?.clips) ? show.video.clips : [];
}

export function resolveShowCustomerClips(show, library) {
  if (!show) return [];
  const ids = Array.isArray(show.customerClipIds) ? show.customerClipIds : [];
  if (ids.length > 0 && library) {
    return ids.map((id) => library[id]).filter(Boolean);
  }
  return Array.isArray(show.video?.customerClips) ? show.video.customerClips : [];
}

// ——— Categories (replaces the old "type=collection" cards) ———

export const getAllCategories = unstable_cache(
  async () => {
    const snap = await getDocs(collection(db, 'categories_v2'));
    const cats = {};
    snap.forEach((d) => {
      cats[d.id] = { id: d.id, ...d.data() };
    });
    return cats;
  },
  ['all-categories-v2'],
  { revalidate: REVALIDATE_TIME },
);

export const getCategoryById = async (catId) =>
  unstable_cache(
    async () => {
      const snap = await getDoc(doc(db, 'categories_v2', catId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    [`category-v2-${catId}`],
    { revalidate: REVALIDATE_TIME },
  )();

// ——— Homepage manifest ———
//
// Reads settings_v2/homepage which is an ordered array of
// { kind: 'show' | 'category', id }. If the doc doesn't exist yet (we're
// pre-migration), returns null and the caller should fall back to the legacy
// homepage source (collections_v2 cards).
export const getHomepageManifest = unstable_cache(
  async () => {
    const snap = await getDoc(doc(db, 'settings_v2', 'homepage'));
    if (!snap.exists()) return null;
    const data = snap.data();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.filter((it) => it && (it.kind === 'show' || it.kind === 'category') && it.id);
  },
  ['homepage-manifest-v2'],
  { revalidate: REVALIDATE_TIME },
);

// Resolve manifest entries to full display data (title, image, target href).
// Items pointing at missing shows/categories are dropped.
export function resolveHomepageItems(manifest, shows, categories) {
  if (!Array.isArray(manifest)) return [];
  return manifest
    .map((it) => {
      if (it.kind === 'show') {
        const s = shows?.[it.id];
        if (!s) return null;
        return {
          key: `show:${it.id}`,
          href: `/show/${it.id}`,
          title: s.title || it.id,
          mainImg: s.mainImg || s.presentationFormats?.[0]?.image || '',
          priority: s.priority || 'normal',
          isWorkshop: s.kind === 'workshop',
        };
      }
      if (it.kind === 'category') {
        const c = categories?.[it.id];
        if (!c) return null;
        return {
          key: `category:${it.id}`,
          href: `/category/${it.id}`,
          title: c.title || it.id,
          mainImg: c.mainImg || '',
          priority: 'normal',
          isCategory: true,
        };
      }
      return null;
    })
    .filter(Boolean);
}

export const getHomeGalleryImages = unstable_cache(
  async () => {
    const snap = await getDoc(doc(db, 'settings_v2', 'homeGallery'));
    return snap.exists() ? snap.data().images || [] : [];
  },
  ['home-gallery-v2'],
  { revalidate: REVALIDATE_TIME },
);

// URL helper: recommendations store linkedTarget as { kind, id } — build path from that.
export function linkedTargetHref(linkedTarget) {
  if (!linkedTarget || !linkedTarget.kind || !linkedTarget.id) return null;
  return `/${linkedTarget.kind}/${linkedTarget.id}`;
}

// Title lookup: derive what `relatedShow` used to display.
export function linkedTargetTitle(linkedTarget, shows, collectionsByCard) {
  if (!linkedTarget) return '';
  if (linkedTarget.kind === 'show') return shows?.[linkedTarget.id]?.title || '';
  if (linkedTarget.kind === 'collection') return collectionsByCard?.[linkedTarget.id]?.title || '';
  return '';
}
