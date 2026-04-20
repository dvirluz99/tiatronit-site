import { z } from 'zod';
import { UrlString, Timestamped } from './common';

export const HomeGallerySchema = z.object({
  images: z.array(UrlString).default([]),
  ...Timestamped,
});
export type HomeGallery = z.infer<typeof HomeGallerySchema>;
