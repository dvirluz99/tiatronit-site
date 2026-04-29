import { z } from 'zod';
import { LinkedTargetSchema, OptionalUrl, Timestamped } from './common';

export const RecommendationSchema = z.object({
  id: z.string().min(1),

  recommenderName: z.string().min(1, 'חסר שם ממליץ'),
  recommenderRole: z.string().default(''),
  recommenderImage: OptionalUrl,
  contactInfo: z.string().default(''),
  date: z.string().default(''),

  content: z.string().min(1, 'חסר תוכן ההמלצה'),

  linkedTarget: LinkedTargetSchema.nullable().default(null),

  ...Timestamped,
});
export type Recommendation = z.infer<typeof RecommendationSchema>;
