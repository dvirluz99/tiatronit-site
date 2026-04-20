import { z } from 'zod';
import { UrlString, YoutubeId, Timestamped } from './common';

export const AboutTestimonialSchema = z.object({
  author: z.string().min(1),
  fromShowTitle: z.string().default(''),
  showId: z.string().default(''),
  recommendationId: z.string().default(''),
  text: z.string().min(1),
});
export type AboutTestimonial = z.infer<typeof AboutTestimonialSchema>;

export const AboutPageSchema = z.object({
  title: z.string().min(1),
  mainImage: UrlString,
  mainDescription: z.string().min(1),
  testimonials: z.array(AboutTestimonialSchema).default([]),
  ...Timestamped,
});
export type AboutPage = z.infer<typeof AboutPageSchema>;

export const PuppetInfoItemSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});
export type PuppetInfoItem = z.infer<typeof PuppetInfoItemSchema>;

export const PuppetsPageSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().default(''),
  paragraph: z.string().default(''),
  youtubeVideoId: YoutubeId.or(z.literal('')).default(''),
  infoSectionTitle: z.string().default(''),
  infoListTitle: z.string().default(''),
  infoList: z.array(PuppetInfoItemSchema).default([]),
  summaryQuote: z.string().default(''),
  ...Timestamped,
});
export type PuppetsPage = z.infer<typeof PuppetsPageSchema>;
