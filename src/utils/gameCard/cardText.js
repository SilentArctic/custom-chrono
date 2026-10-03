export const PILL_KEYWORDS = [
   'Blitz',
   'Cleave',
   'Confront',
   'Delay',
   'Evasive',
   'Exposed',
   'Overpower',
   'Rejuvenate',
   'Siphon',
   'Temporary',
   'Transient',
   'Fervor',
];

export const KEYWORD_COLOR = '#FFD23D';
export const REFERENCE_COLOR = '#8a8fc1';
export const TIMELINE_COLOR = '#83C7FF';

export const SPEED_LABELS = { fast: 'Fast', immediate: 'Immediate', slow: 'Slow' };

export function getFrameKind({ cardType, rarity, immortalized }) {
   if (cardType === 'action') return 'action';
   if (rarity === 'token') return 'token';
   return immortalized ? 'immortal' : 'base';
}

export function getTypeLine(frame, actionSpeed) {
   if (frame === 'action') return `${SPEED_LABELS[actionSpeed] ?? SPEED_LABELS.slow} Action`;
   if (frame === 'token') return 'Token';
   return frame === 'immortal' ? 'Immortalized Agent' : 'Base Agent';
}

const CLAUSE_MARKER = /(^|\n)[ \t]*\[?[ \t]*immortalize[ \t]*\]?[ \t]*:?[ \t]*/i;

export function splitImmortalizeClause(text) {
   const match = CLAUSE_MARKER.exec(text ?? '');
   if (!match) return { effect: text ?? '', clause: null };

   const clause = text.slice(match.index + match[0].length);
   if (!clause.trim()) return { effect: text, clause: null };

   return { effect: text.slice(0, match.index).replace(/\s+$/, ''), clause };
}

const pillKey = (name) =>
   PILL_KEYWORDS.find((keyword) => keyword.toLowerCase() === name.trim().toLowerCase());

function splitPillLine(line) {
   const names = [];
   const rest = line.replace(/\[([^\]]+)\]/g, (_, name) => {
      names.push(name);
      return '';
   });
   if (!names.length || /[^\s,;.]/.test(rest)) return null;

   const keys = names.map(pillKey).filter(Boolean);
   if (!keys.length) return null;

   const remaining = names.filter((name) => !pillKey(name)).map((name) => `[${name}]`);
   return { keys, remaining: remaining.join(' ') };
}

export function extractPills(text) {
   const lines = (text ?? '').split('\n');
   const pills = [];
   let index = 0;
   let changed = false;

   while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
         if (!changed) break;
         index += 1;
         continue;
      }

      const split = splitPillLine(line);
      if (!split) break;

      split.keys.forEach((key) => {
         if (!pills.includes(key)) pills.push(key);
      });
      changed = true;
      if (split.remaining) {
         lines[index] = split.remaining;
         break;
      }
      index += 1;
   }

   if (!changed) return { pills, text: text ?? '' };

   const kept = lines.slice(index);
   while (kept.length && !kept[0].trim()) kept.shift();
   return { pills, text: kept.join('\n') };
}

export function parseMarkup(input, defaultColor = '#ffffff') {
   const text = input ?? '';
   const tokens = [];
   const colors = [];
   let timeline = false;
   let italic = false;
   let bold = false;
   let buffer = '';

   const currentColor = () =>
      timeline ? TIMELINE_COLOR : colors.length ? colors[colors.length - 1] : defaultColor;

   const flush = () => {
      if (!buffer) return;
      const color = currentColor();
      buffer.match(/\s+|\S+/g).forEach((piece) => {
         tokens.push({ kind: 'text', text: piece, color, italic, bold });
      });
      buffer = '';
   };

   const hasCloser = (closer, from) => text.indexOf(closer, from) > from - 1;

   for (let i = 0; i < text.length; i += 1) {
      const c = text[i];
      if (c === '\r') continue;

      if (c === '\n') {
         flush();
         tokens.push({ kind: 'newline' });
         continue;
      }

      if (c === '@') {
         flush();
         tokens.push({ kind: 'sprite', name: 'CC' });
         continue;
      }

      if ((c === '[' || c === '{') && hasCloser(c === '[' ? ']' : '}', i + 1)) {
         flush();
         colors.push(c === '[' ? KEYWORD_COLOR : REFERENCE_COLOR);
         continue;
      }

      if ((c === ']' || c === '}') && colors.length) {
         flush();
         colors.pop();
         continue;
      }

      if (c === '$' && (timeline || hasCloser('$', i + 1))) {
         flush();
         timeline = !timeline;
         continue;
      }

      if (c === '_' && (italic || hasCloser('_', i + 1))) {
         flush();
         italic = !italic;
         continue;
      }

      if (c === '*' && (bold || hasCloser('*', i + 1))) {
         flush();
         bold = !bold;
         continue;
      }

      buffer += c;
   }

   flush();
   return tokens;
}
