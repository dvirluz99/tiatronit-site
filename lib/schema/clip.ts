import { z } from 'zod';
import { YoutubeId } from './common';

// "טעימות" — short YouTube clips from a show. Stored in `clips_v2`
// and selected per-show via Show.clipIds (same pattern as recommendations).
export const ClipSchema = z.object({
  id: z.string().min(1),
  youtubeId: YoutubeId,
  caption: z.string().default(''),
});
export type Clip = z.infer<typeof ClipSchema>;

// "אנשים מדברים" — customer testimonial videos. Same shape, separate
// collection so the CMS lists them in their own library tab.
export const CustomerClipSchema = z.object({
  id: z.string().min(1),
  youtubeId: YoutubeId,
  caption: z.string().default(''),
});
export type CustomerClip = z.infer<typeof CustomerClipSchema>;
