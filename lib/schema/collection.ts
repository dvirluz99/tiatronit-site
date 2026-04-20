import { z } from 'zod';
import { UrlString, YoutubeId, Timestamped } from './common';
import { PriorityEnum } from './show';

export const CollectionTypeEnum = z.enum(['single', 'collection']);
export type CollectionType = z.infer<typeof CollectionTypeEnum>;

const CollectionBase = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),

  title: z.string().min(1, 'חסר כותרת לאוסף'),
  mainImg: UrlString,
  priority: PriorityEnum.default('normal'),

  description: z.string().default(''),
  extendedHtml: z.string().default(''),

  gallery: z.array(UrlString).default([]),
  videos: z.array(YoutubeId).default([]),

  recommendationIds: z.array(z.string()).default([]),

  ...Timestamped,
});

export const SingleCollectionSchema = CollectionBase.extend({
  type: z.literal('single'),
  linkedShowId: z.string().min(1, 'חסר מזהה הצגה מקושרת'),
});
export type SingleCollection = z.infer<typeof SingleCollectionSchema>;

export const MultiCollectionSchema = CollectionBase.extend({
  type: z.literal('collection'),
  showIds: z.array(z.string()).min(1, 'אוסף חייב להכיל לפחות הצגה אחת'),
});
export type MultiCollection = z.infer<typeof MultiCollectionSchema>;

export const CollectionSchema = z.discriminatedUnion('type', [
  SingleCollectionSchema,
  MultiCollectionSchema,
]);
export type Collection = z.infer<typeof CollectionSchema>;
