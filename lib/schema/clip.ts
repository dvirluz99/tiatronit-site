import { z } from 'zod';
import { YoutubeId } from './common';

// Optional admin-tag pointing at the show or category this clip is "about".
// Doesn't drive what appears on the site (that's still per-entity clipIds);
// purely a memory aid for the CMS librarian.
export const ClipLinkedTargetSchema = z.object({
  kind: z.enum(['show', 'category']),
  id: z.string().min(1),
});
export type ClipLinkedTarget = z.infer<typeof ClipLinkedTargetSchema>;

// "טעימות" — short YouTube clips. Stored in `clips_v2` and referenced from
// shows / categories via their clipIds arrays.
export const ClipSchema = z.object({
  id: z.string().min(1),
  youtubeId: YoutubeId,
  caption: z.string().default(''),
  linkedTarget: ClipLinkedTargetSchema.nullable().default(null),
});
export type Clip = z.infer<typeof ClipSchema>;

// "אנשים מדברים" — customer testimonial videos. Same shape, separate
// collection so the CMS lists them in their own library tab.
export const CustomerClipSchema = z.object({
  id: z.string().min(1),
  youtubeId: YoutubeId,
  caption: z.string().default(''),
  linkedTarget: ClipLinkedTargetSchema.nullable().default(null),
});
export type CustomerClip = z.infer<typeof CustomerClipSchema>;
