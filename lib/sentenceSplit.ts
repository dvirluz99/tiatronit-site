export type Sentence = {
  text: string;
  paragraphIndex: number;
};

export function splitIntoSentences(content: string): Sentence[] {
  if (!content) return [];
  const paragraphs = content
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: Sentence[] = [];
  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const flat = paragraphs[pIdx].replace(/\s+/g, ' ').trim();
    const matches = flat.match(/[^.!?…]+[.!?…]+["'״׳]?|[^.!?…]+$/g);
    if (!matches) continue;
    for (const m of matches) {
      const t = m.trim();
      if (t) out.push({ text: t, paragraphIndex: pIdx });
    }
  }
  return out;
}

export function joinSentences(sentences: Sentence[]): string {
  if (!sentences.length) return '';
  let out = '';
  let lastPara = -1;
  for (const s of sentences) {
    if (lastPara === -1) {
      out = s.text;
    } else if (s.paragraphIndex !== lastPara) {
      out += '\n\n' + s.text;
    } else {
      out += ' ' + s.text;
    }
    lastPara = s.paragraphIndex;
  }
  return out;
}

export function summarizeContent(content: string, opts?: { minLen?: number; maxLen?: number }): string {
  const minLen = opts?.minLen ?? 80;
  const maxLen = opts?.maxLen ?? 220;
  const sentences = splitIntoSentences(content);
  if (!sentences.length) return '';

  let i = 0;
  while (i < sentences.length - 1 && sentences[i].text.length < 15) i++;

  const picked: Sentence[] = [];
  let total = 0;
  for (; i < sentences.length; i++) {
    const next = sentences[i];
    const projected = total === 0 ? next.text.length : total + 1 + next.text.length;
    if (picked.length > 0 && projected > maxLen) break;
    picked.push(next);
    total = projected;
    if (total >= minLen) break;
  }
  return joinSentences(picked);
}
