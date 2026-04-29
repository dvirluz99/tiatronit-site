import { z } from 'zod';

// One curated home-carousel item. Points at a recommendations_v2 record.
// Override fields are optional pull-quote presentation tweaks; empty = derive
// from the linked recommendation.
export const HomeTestimonialItemSchema = z.object({
  recommendationId: z.string().min(1),
  quoteOverride: z.string().default(''),
  authorOverride: z.string().default(''),
  fromShowTitleOverride: z.string().default(''),
});
export type HomeTestimonialItem = z.infer<typeof HomeTestimonialItemSchema>;

// Stored at settings_v2/homeTestimonials. Order in the array = carousel order.
// autoplaySeconds: 0 disables auto-advance.
export const HomeTestimonialsSchema = z.object({
  items: z.array(HomeTestimonialItemSchema).default([]),
  autoplaySeconds: z.number().int().min(0).max(60).default(0),
});
export type HomeTestimonials = z.infer<typeof HomeTestimonialsSchema>;
