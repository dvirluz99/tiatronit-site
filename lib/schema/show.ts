import { z } from 'zod';
import { UrlString, OptionalUrl, CaptionedClip, YoutubeId, Timestamped } from './common';

export const PresentationFormatSchema = z.object({
  image: UrlString,
  caption: z.string().default(''),
});
export type PresentationFormat = z.infer<typeof PresentationFormatSchema>;

export const ShowVideoSchema = z.object({
  trailers: z.array(YoutubeId).default([]),
  clips: z.array(CaptionedClip).default([]),
  customerClips: z.array(CaptionedClip).default([]),
});
export type ShowVideo = z.infer<typeof ShowVideoSchema>;

export const ShowCategoryEnum = z.enum(['kids', 'youth', 'adults']);
export type ShowCategory = z.infer<typeof ShowCategoryEnum>;

export const PriorityEnum = z.enum(['featured', 'normal']);
export type Priority = z.infer<typeof PriorityEnum>;

// Tells the renderer how to label a Show entity. A "workshop" is structurally
// the same Show — it just additionally contains references to other shows in
// `containedShowIds`. We use a single Show schema for both so workshops get
// every show feature for free (clips, recommendations, gallery, etc.).
export const ShowKindEnum = z.enum(['show', 'workshop']);
export type ShowKind = z.infer<typeof ShowKindEnum>;

export const ShowSchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),

  title: z.string().min(1, 'חסר שם הצגה'),
  category: ShowCategoryEnum,
  priority: PriorityEnum.default('normal'),
  kind: ShowKindEnum.default('show'),
  // For workshops: the shows shown in a grid on the workshop page.
  // For atomic shows: empty.
  containedShowIds: z.array(z.string()).default([]),

  mainImg: UrlString,
  presentationFormats: z.array(PresentationFormatSchema).default([]),
  gallery: z.array(UrlString).default([]),

  description: z.string().default(''),
  audience: z.string().default(''),
  creatorName: z.string().default(''),
  creatorIntro: z.string().default(''),
  creatorCredentials: z.string().default(''),
  socialProof: z.string().default(''),
  phone: z.string().default(''),

  video: ShowVideoSchema.default({ trailers: [], clips: [], customerClips: [] }),

  // Library-backed video selections — IDs into clips_v2 / customer_clips_v2.
  // Order in the array = display order on the show page.
  // (video.clips / video.customerClips remain for backward compatibility and
  // act as a fallback when these arrays are empty.)
  clipIds: z.array(z.string()).default([]),
  customerClipIds: z.array(z.string()).default([]),

  recommendationIds: z.array(z.string()).default([]),

  ...Timestamped,
});
export type Show = z.infer<typeof ShowSchema>;

export const ShowReadSchema = ShowSchema.partial({
  slug: true,
  priority: true,
  kind: true,
  containedShowIds: true,
  mainImg: true,
  presentationFormats: true,
  gallery: true,
  description: true,
  audience: true,
  creatorName: true,
  creatorIntro: true,
  creatorCredentials: true,
  socialProof: true,
  phone: true,
  video: true,
  recommendationIds: true,
  clipIds: true,
  customerClipIds: true,
});
