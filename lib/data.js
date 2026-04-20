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
