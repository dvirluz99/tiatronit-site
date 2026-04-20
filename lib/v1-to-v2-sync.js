// Transforms a v1 document shape (as edited by the existing admin forms)
// into the v2 shape and writes it to the corresponding *_v2 collection.
//
// Called from admin CRUD save handlers so edits continue to sync to the
// new collections while the full admin rebuild is still in progress.

import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const YOUTUBE_EMBED_RE = /embed\/([A-Za-z0-9_-]{11})/;
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_WATCH_RE = /[?&]v=([A-Za-z0-9_-]{11})/;
const YOUTUBE_SHORT_RE = /youtu\.be\/([A-Za-z0-9_-]{11})/;

function extractYoutubeId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (YOUTUBE_ID_RE.test(s)) return s;
  const m = s.match(YOUTUBE_EMBED_RE) || s.match(YOUTUBE_WATCH_RE) || s.match(YOUTUBE_SHORT_RE);
  return m ? m[1] : null;
}

function flattenGallery(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => (typeof item === 'string' ? item : item?.img || ''))
    .filter(Boolean);
}

function normalizePriority(importance) {
  return importance === 'recommended' ? 'featured' : 'normal';
}

function extractClips(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((raw) => {
      const yid = extractYoutubeId(raw?.youtubeId);
      if (!yid) return null;
      return { youtubeId: yid, caption: String(raw?.caption || '') };
    })
    .filter(Boolean);
}

function parseLinkedPath(raw) {
  if (!raw) return null;
  const cleaned = String(raw).trim().replace(/^\/+/, '').replace(/\/+$/, '');
  const parts = cleaned.split('/');
  if (parts.length !== 2) return null;
  const [kind, id] = parts;
  if ((kind !== 'show' && kind !== 'collection') || !id) return null;
  return { kind, id };
}

export function showV1ToV2(id, v1) {
  const showData = v1.showData || {};
  const vidue = v1.vidue || {};

  const presentationFormats = [];
  const mainImg1 = (v1.mainImg1 || '').trim?.() || v1.mainImg1 || '';
  const mainImg2 = (v1.mainImg2 || '').trim?.() || v1.mainImg2 || '';
  if (mainImg1) {
    presentationFormats.push({ image: mainImg1, caption: v1.textUnderImg1 || '' });
  }
  if (mainImg2) {
    presentationFormats.push({ image: mainImg2, caption: v1.textUnderImg2 || '' });
  }

  const category = ['kids', 'youth', 'adults'].includes(v1.category) ? v1.category : 'adults';

  return {
    id,
    title: String(v1.title || showData.title || '').trim(),
    category,
    priority: normalizePriority(v1.importance),
    mainImg: v1.mainImg || '',
    presentationFormats,
    gallery: flattenGallery(v1.arrayGallery),
    description: String(showData.description || ''),
    audience: String(showData.audience || ''),
    creatorName: String(showData.creatorName || ''),
    creatorIntro: String(showData.creatorIntro || ''),
    creatorCredentials: String(showData.creatorCredentials || ''),
    socialProof: String(showData.socialProof || ''),
    phone: String(showData.phone || ''),
    video: {
      trailers: Array.isArray(vidue.Trailer)
        ? vidue.Trailer.map((x) => extractYoutubeId(x)).filter(Boolean)
        : [],
      clips: extractClips(vidue.clips),
      customerClips: extractClips(vidue.customers),
    },
    recommendationIds: Array.isArray(v1.linkRec) ? v1.linkRec : [],
  };
}

export function collectionV1ToV2(id, v1) {
  const base = {
    id,
    title: String(v1.title || '').trim(),
    description: String(v1.description || ''),
    extendedHtml: String(v1.extraContent || ''),
    mainImg: v1.mainImg || '',
    priority: normalizePriority(v1.importance),
    gallery: flattenGallery(v1.collectionGallery),
    videos: Array.isArray(v1.collectionVideo)
      ? v1.collectionVideo.map((x) => extractYoutubeId(x)).filter(Boolean)
      : [],
    recommendationIds: Array.isArray(v1.linkRec) ? v1.linkRec : [],
  };

  if (v1.type === 'single') {
    return { ...base, type: 'single', linkedShowId: String(v1.linkedShowId || '').trim() };
  }
  return {
    ...base,
    type: 'collection',
    showIds: Array.isArray(v1.contains) ? v1.contains : [],
  };
}

export function recommendationV1ToV2(id, v1) {
  return {
    id,
    recommenderName: String(v1.recommenderName || '').trim(),
    recommenderRole: String(v1.recommenderRole || ''),
    contactInfo: String(v1.contactInfo || ''),
    date: String(v1.date || ''),
    content: String(v1.content || ''),
    linkedTarget: parseLinkedPath(v1.linkedShowId),
  };
}

export function aboutV1ToV2(v1) {
  const testimonials = Array.isArray(v1.testimonials) ? v1.testimonials : [];
  return {
    title: String(v1.title || ''),
    mainImage: v1.mainImage || '',
    mainDescription: String(v1.mainDescription || ''),
    testimonials: testimonials.map((t) => ({
      author: String(t.author || ''),
      fromShowTitle: String(t.fromPresention || ''),
      showId: String(t.linkP || ''),
      recommendationId: String(t.linkRecId || ''),
      text: String(t.text || ''),
    })),
  };
}

export function puppetsV1ToV2(v1) {
  return {
    title: String(v1.title || ''),
    subtitle: String(v1.subtitle || ''),
    paragraph: String(v1.paragraph || ''),
    youtubeVideoId: extractYoutubeId(v1.youtubeVideoId) || '',
    infoSectionTitle: String(v1.infoTitle || ''),
    infoListTitle: String(v1.subTitle || ''),
    infoList: Array.isArray(v1.infoList)
      ? v1.infoList.map((it) => ({
          title: String(it.title || ''),
          text: String(it.text || ''),
        }))
      : [],
    summaryQuote: String(v1.summaryQuote || ''),
  };
}

// --- Double-write helpers: save to v1 AND v2 in one call. ---

export async function saveShow(id, v1Data) {
  await setDoc(doc(db, 'shows', id), { id, ...v1Data });
  await setDoc(doc(db, 'shows_v2', id), showV1ToV2(id, v1Data));
}

export async function saveCollection(id, v1Data) {
  await setDoc(doc(db, 'collections', id), { id, ...v1Data });
  await setDoc(doc(db, 'collections_v2', id), collectionV1ToV2(id, v1Data));
}

export async function saveRecommendation(id, v1Data) {
  await setDoc(doc(db, 'recommendations', id), { id, ...v1Data });
  await setDoc(doc(db, 'recommendations_v2', id), recommendationV1ToV2(id, v1Data));
}

export async function savePageAbout(v1Data) {
  await setDoc(doc(db, 'pages', 'about'), v1Data);
  await setDoc(doc(db, 'pages_v2', 'about'), aboutV1ToV2(v1Data));
}

export async function savePagePuppets(v1Data) {
  await setDoc(doc(db, 'pages', 'puppets'), v1Data);
  await setDoc(doc(db, 'pages_v2', 'puppets'), puppetsV1ToV2(v1Data));
}

export async function saveHomeGallery(v1Data) {
  const images = Array.isArray(v1Data?.images) ? v1Data.images.filter(Boolean) : [];
  await setDoc(doc(db, 'settings', 'homeGallery'), { images });
  await setDoc(doc(db, 'settings_v2', 'homeGallery'), { images });
}

export async function deleteShow(id) {
  await deleteDoc(doc(db, 'shows', id));
  await deleteDoc(doc(db, 'shows_v2', id));
}

export async function deleteCollection(id) {
  await deleteDoc(doc(db, 'collections', id));
  await deleteDoc(doc(db, 'collections_v2', id));
}

export async function deleteRecommendation(id) {
  await deleteDoc(doc(db, 'recommendations', id));
  await deleteDoc(doc(db, 'recommendations_v2', id));
}
