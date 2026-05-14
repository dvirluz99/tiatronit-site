import { z } from 'zod';
import { UrlString, YoutubeId, Timestamped } from './common';

// Optional per-category overrides for hard-coded section headings on the
// public category page. Empty string ⇒ fall back to the built-in default.
export const CategoryLabelsSchema = z.object({
  eyebrow: z.string().default(''),
  itemsTitle: z.string().default(''),
  trailersTitle: z.string().default(''),
  clipsTitle: z.string().default(''),
  galleryTitle: z.string().default(''),
  textTestimonialsTitle: z.string().default(''),
  videoTestimonialsTitle: z.string().default(''),
});
export type CategoryLabels = z.infer<typeof CategoryLabelsSchema>;

const EMPTY_CATEGORY_LABELS: CategoryLabels = {
  eyebrow: '',
  itemsTitle: '',
  trailersTitle: '',
  clipsTitle: '',
  galleryTitle: '',
  textTestimonialsTitle: '',
  videoTestimonialsTitle: '',
};

// A pure grouping of shows/workshops with its own page. Replaces the old
// `collections_v2` (type='collection') concept. Like a show, a category can
// carry its own intro content (trailers, library clips, customer clips,
// recommendations, gallery) — those are all optional.
export const CategorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),

  title: z.string().min(1, 'חסר כותרת לקטגוריה'),
  description: z.string().default(''),
  mainImg: UrlString,

  // The shows / workshops grouped under this category, in display order.
  itemIds: z.array(z.string()).default([]),

  // Optional content shared across the items in the category.
  trailers: z.array(YoutubeId).default([]),
  clipIds: z.array(z.string()).default([]),
  customerClipIds: z.array(z.string()).default([]),
  recommendationIds: z.array(z.string()).default([]),
  gallery: z.array(UrlString).default([]),

  // Free-form rich content (HTML).
  extendedHtml: z.string().default(''),

  // Per-entity overrides for hardcoded section headings (see CategoryLabelsSchema).
  labels: CategoryLabelsSchema.default(EMPTY_CATEGORY_LABELS),

  ...Timestamped,
});
export type Category = z.infer<typeof CategorySchema>;
