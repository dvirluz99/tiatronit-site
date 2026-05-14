// Aggregates every image URL currently referenced by a show or category in
// Firestore, and tags each URL with the list of entities/fields using it.
// Used by:
//   - components/admin/v2/ImagesLibraryTab.tsx   (the "see what exists" view)
//   - components/admin/v2/fields/ImagePickerModal.tsx (reuse existing images)

import type { Show, Category } from './schema';

export type ImageUsage = {
  entityKind: 'show' | 'category';
  entityId: string;
  entityTitle: string;
  entitySubtype?: 'show' | 'workshop'; // for shows only
  field: 'mainImg' | 'presentationFormats' | 'gallery';
  index?: number;
};

export type LibraryImage = {
  url: string;
  usages: ImageUsage[];
};

function pushUrl(map: Map<string, ImageUsage[]>, url: string | undefined, usage: ImageUsage) {
  if (!url) return;
  const trimmed = url.trim();
  if (!trimmed) return;
  const list = map.get(trimmed);
  if (list) list.push(usage);
  else map.set(trimmed, [usage]);
}

export function aggregateImages(
  shows: Array<{ id: string; data: Show }>,
  categories: Array<{ id: string; data: Category }>,
): LibraryImage[] {
  const map = new Map<string, ImageUsage[]>();

  for (const { id, data } of shows) {
    const title = data.title || id;
    const subtype = data.kind === 'workshop' ? 'workshop' : 'show';
    pushUrl(map, data.mainImg, {
      entityKind: 'show',
      entityId: id,
      entityTitle: title,
      entitySubtype: subtype,
      field: 'mainImg',
    });
    (data.presentationFormats || []).forEach((pf, idx) => {
      pushUrl(map, pf?.image, {
        entityKind: 'show',
        entityId: id,
        entityTitle: title,
        entitySubtype: subtype,
        field: 'presentationFormats',
        index: idx,
      });
    });
    (data.gallery || []).forEach((url, idx) => {
      pushUrl(map, url, {
        entityKind: 'show',
        entityId: id,
        entityTitle: title,
        entitySubtype: subtype,
        field: 'gallery',
        index: idx,
      });
    });
  }

  for (const { id, data } of categories) {
    const title = data.title || id;
    pushUrl(map, data.mainImg, {
      entityKind: 'category',
      entityId: id,
      entityTitle: title,
      field: 'mainImg',
    });
    (data.gallery || []).forEach((url, idx) => {
      pushUrl(map, url, {
        entityKind: 'category',
        entityId: id,
        entityTitle: title,
        field: 'gallery',
        index: idx,
      });
    });
  }

  const result: LibraryImage[] = [];
  for (const [url, usages] of map.entries()) {
    result.push({ url, usages });
  }
  result.sort((a, b) => b.usages.length - a.usages.length);
  return result;
}

export function describeUsage(usage: ImageUsage): string {
  const fieldLabel: Record<ImageUsage['field'], string> = {
    mainImg: 'תמונה ראשית',
    presentationFormats: 'גרסאות הצגה',
    gallery: 'גלריה',
  };
  return `${fieldLabel[usage.field]}${usage.index != null ? ` #${usage.index + 1}` : ''}`;
}

export function entityBadge(usage: ImageUsage): string {
  if (usage.entityKind === 'category') return '🗂️';
  return usage.entitySubtype === 'workshop' ? '🎭' : '📺';
}
