import { z } from 'zod';
import { YoutubeId } from './common';

// "טעימות" — short YouTube clips from a show. Stored in `clips_v2`
// and selected per-show via Show.clipIds (same pattern as recommendations).
export const ClipSchema = z.object({
  id: z.string().min(1),
  youtubeId: YoutubeId,
  caption: z.string().default(''),
  // Admin tag: which show this clip is "about". Does NOT drive what appears
  // on the site (that's still Show.clipIds). It's a memory aid for the CMS
  // so the librarian can tell clips apart at a glance. Empty = general.
  linkedShowId: z.string().default(''),
});
export type Clip = z.infer<typeof ClipSchema>;

// "אנשים מדברים" — customer testimonial videos. Same shape, separate
// collection so the CMS lists them in their own library tab.
export const CustomerClipSchema = z.object({
  id: z.string().min(1),
  youtubeId: YoutubeId,
  caption: z.string().default(''),
  linkedShowId: z.string().default(''),
});
export type CustomerClip = z.infer<typeof CustomerClipSchema>;
