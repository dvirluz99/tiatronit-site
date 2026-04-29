// Shared helpers for "copy recommendation to clipboard" used by admin tabs.
// Output is plain text designed to look good in WhatsApp / email — uses
// WhatsApp's *bold* markdown, blank lines between sections, and emoji
// separators.

import type { Recommendation } from './schema';

export type RecommendationClipboardContext = {
  /** Title of the linked show / category, e.g. "הצגת הקרקס". */
  linkedTitle?: string;
  /** Public permalink to /recommendation/<id>. Optional — included if present. */
  permalink?: string;
};

function stripHtmlToText(content: string): string {
  return (content || '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;|&#39;/g, "'")
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Build the WhatsApp-friendly clipboard string for a recommendation.
 *
 * Layout:
 *   ✨ *<name>*
 *   <role>
 *   📅 <date>
 *
 *   <content with paragraph breaks>
 *
 *   — מתייחס ל-<linked title>
 *   🔗 <permalink>
 */
export function formatRecommendationForClipboard(
  rec: Pick<Recommendation, 'recommenderName' | 'recommenderRole' | 'date' | 'content'>,
  ctx: RecommendationClipboardContext = {},
): string {
  const lines: string[] = [];
  const name = (rec.recommenderName || '').trim();
  if (name) lines.push(`✨ *${name}*`);

  const role = (rec.recommenderRole || '').trim();
  if (role) lines.push(role);

  const date = (rec.date || '').trim();
  if (date) lines.push(`📅 ${date}`);

  const body = stripHtmlToText(rec.content || '');
  if (body) {
    lines.push(''); // blank line before body
    lines.push(body);
  }

  const linkedTitle = (ctx.linkedTitle || '').trim();
  const permalink = (ctx.permalink || '').trim();
  if (linkedTitle || permalink) {
    lines.push(''); // blank line before footer
    if (linkedTitle) lines.push(`— מתייחס ל-${linkedTitle}`);
    if (permalink) lines.push(`🔗 ${permalink}`);
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Copy `text` to the clipboard. Uses the modern Clipboard API when available
 * (requires a secure context), falls back to a transient textarea + execCommand.
 * Returns whether the copy succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
