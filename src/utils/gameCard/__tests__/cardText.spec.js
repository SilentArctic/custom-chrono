import { describe, expect, it } from 'vitest';
import {
   extractPills,
   getFrameKind,
   getTypeLine,
   parseMarkup,
   splitImmortalizeClause,
} from '../cardText';

describe('splitImmortalizeClause', () => {
   it('separates the clause from the effect text', () => {
      const { effect, clause } = splitImmortalizeClause(
         'Deal 2 damage.\n[Immortalize]: Gain [Blitz].',
      );
      expect(effect).toBe('Deal 2 damage.');
      expect(clause).toBe('Gain [Blitz].');
   });

   it('accepts the plain word with or without the colon', () => {
      expect(splitImmortalizeClause('Immortalize: Heal 1.').clause).toBe('Heal 1.');
      expect(splitImmortalizeClause('Draw.\nIMMORTALIZE Heal 1.').effect).toBe('Draw.');
   });

   it('returns no clause when the marker is missing or empty', () => {
      expect(splitImmortalizeClause('Draw a card.').clause).toBeNull();
      expect(splitImmortalizeClause('Draw.\n[Immortalize]:').clause).toBeNull();
   });
});

describe('extractPills', () => {
   it('turns leading keyword-only lines into pills', () => {
      const { pills, text } = extractPills('[Blitz] [evasive]\n[Siphon]\n\nWhen played, draw.');
      expect(pills).toEqual(['Blitz', 'Evasive', 'Siphon']);
      expect(text).toBe('When played, draw.');
   });

   it('pills the leading keywords even when text follows on the same line', () => {
      expect(extractPills('[Blitz] [Evasive] [hola] s  [Confront]')).toEqual({
         pills: ['Blitz', 'Evasive'],
         text: '[hola] s  [Confront]',
      });
      expect(extractPills('[Blitz] when played\nDraw.')).toEqual({
         pills: ['Blitz'],
         text: 'when played\nDraw.',
      });
   });

   it('keeps keywords mentioned in the body as text', () => {
      const source = 'This agent gains [Evasive] when a thing happens.';
      expect(extractPills(source)).toEqual({ pills: [], text: source });
   });

   it('leaves the Immortalize clause untouched', () => {
      const { effect, clause } = splitImmortalizeClause('[Blitz] [hola] s\n\n[Immortalize]: Gain [Evasive].');
      expect(extractPills(effect)).toEqual({ pills: ['Blitz'], text: '[hola] s' });
      expect(clause).toBe('Gain [Evasive].');
   });

   it('leaves the text alone when it holds no game keywords', () => {
      const source = '[Elusive] [hola]\nDraw.';
      expect(extractPills(source)).toEqual({ pills: [], text: source });
   });
});

describe('parseMarkup', () => {
   it('colours keywords, references and timelines', () => {
      const tokens = parseMarkup('Gain [Blitz] on {Chrono} at $dawn$', '#fff');
      const byText = Object.fromEntries(tokens.map((t) => [t.text, t.color]));
      expect(byText.Gain).toBe('#fff');
      expect(byText.Blitz).toBe('#FFD23D');
      expect(byText.Chrono).toBe('#8a8fc1');
      expect(byText.dawn).toBe('#83C7FF');
   });

   it('emits sprites, line breaks and emphasis', () => {
      const tokens = parseMarkup('Pay @\n*bold* _it_', '#fff');
      expect(tokens.map((t) => t.kind)).toEqual([
         'text', 'text', 'sprite', 'newline', 'text', 'text', 'text',
      ]);
      expect(tokens[4]).toMatchObject({ text: 'bold', bold: true, italic: false });
      expect(tokens[6]).toMatchObject({ text: 'it', italic: true, bold: false });
   });

   it('leaves unmatched markers in the text', () => {
      expect(parseMarkup('5 $ and [x', '#fff').map((t) => t.text).join('')).toBe('5 $ and [x');
   });
});

describe('frame selection', () => {
   it('maps the editor state to the game frames', () => {
      expect(getFrameKind({ cardType: 'action', rarity: 'rare' })).toBe('action');
      expect(getFrameKind({ cardType: 'agent', rarity: 'token' })).toBe('token');
      expect(getFrameKind({ cardType: 'agent', rarity: 'common', immortalized: true })).toBe('immortal');
      expect(getFrameKind({ cardType: 'agent', rarity: 'lost' })).toBe('base');
   });

   it('writes the type line like the game', () => {
      expect(getTypeLine('action', 'fast')).toBe('Fast Action');
      expect(getTypeLine('token')).toBe('Token');
      expect(getTypeLine('immortal')).toBe('Immortalized Agent');
      expect(getTypeLine('base')).toBe('Base Agent');
   });
});
