import { z } from 'zod';

export const UrlString = z.string().trim().url().or(z.literal(''));
export const OptionalUrl = UrlString.default('');

export const YoutubeIdRegex = /^[A-Za-z0-9_-]{11}$/;
export const YoutubeId = z.string().regex(YoutubeIdRegex, 'Invalid YouTube video ID');

export const CaptionedClip = z.object({
  youtubeId: YoutubeId,
  caption: z.string().default(''),
});
export type CaptionedClip = z.infer<typeof CaptionedClip>;

export const LinkedTargetSchema = z.object({
  kind: z.enum(['show', 'collection']),
  id: z.string().min(1),
});
export type LinkedTarget = z.infer<typeof LinkedTargetSchema>;

export const Timestamped = {
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
};

export function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (YoutubeIdRegex.test(trimmed)) return trimmed;
  const embedMatch = trimmed.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  return null;
}

export function parseLinkedPath(raw: string): LinkedTarget | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  const parts = cleaned.split('/');
  if (parts.length !== 2) return null;
  const [kind, id] = parts;
  if (kind !== 'show' && kind !== 'collection') return null;
  if (!id) return null;
  return { kind, id };
}
