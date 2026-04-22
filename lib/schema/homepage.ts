import { z } from 'zod';

// One homepage entry — a card on the front grid. Each card resolves to either
// a show (or workshop, since workshops are shows) or a category page.
export const HomepageItemSchema = z.object({
  kind: z.enum(['show', 'category']),
  id: z.string().min(1),
});
export type HomepageItem = z.infer<typeof HomepageItemSchema>;

// Stored at settings_v2/homepage. Order in the array = display order.
export const HomepageSchema = z.object({
  items: z.array(HomepageItemSchema).default([]),
});
export type Homepage = z.infer<typeof HomepageSchema>;
