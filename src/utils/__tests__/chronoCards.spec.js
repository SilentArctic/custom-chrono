import { describe, expect, it } from 'vitest';
import { toEditorState, toMarkup } from '../chronoCards';

const art = (code) => [
   {
      gameAbsolutePath: `https://cdn.runeterra.ar/assets/img/card/en_us/${code}.webp`,
      fullAbsolutePath: `https://cdn.runeterra.ar/assets/img/card/en_us/${code}-full.webp`,
   },
];

const AGENT_OF_STABILITY = [
   {
      cardCode: '360',
      name: 'Agent of Stability',
      type: 'Agent',
      region: 'Phasetide',
      rarity: 'Lost',
      cost: 1,
      attack: 1,
      health: 1,
      spellSpeed: '',
      artistName: 'Romulo Reyes',
      assets: art(360),
      description:
         "Evasive. \nStrike: Create a The Firm Hand in hand or reduce its cost by 1 if you already have one. \nImmortalize: I've seen you Shift twice.",
   },
   {
      cardCode: '361',
      name: 'Vaia, Stone Reader',
      type: 'Immortalized Agent',
      region: 'Phasetide',
      rarity: 'Lost',
      cost: 1,
      attack: 1,
      health: 2,
      spellSpeed: '',
      artistName: 'Romulo Reyes',
      assets: art(361),
      description:
         'Evasive.\nStrike: Create a 0 cost The Firm Hand in hand. \nI have +1/+0 for each The One True Timeline in the Timeline Stack.',
   },
   {
      cardCode: '277',
      name: 'The Firm Hand',
      type: 'Action',
      region: 'Phasetide',
      rarity: 'Common',
      cost: 2,
      attack: 0,
      health: 0,
      spellSpeed: 'Slow',
      artistName: 'TheLastEmber',
      assets: art(277),
      description: 'Shift to The One True Timeline. \nDraw 1.',
   },
];

/* lists two Immortalized Agents: its own form, then the form of the card
   it summons */
const CHOIR_RECRUITER = [
   {
      cardCode: '651',
      name: 'Choir Recruiter',
      type: 'Agent',
      region: 'Phasetide',
      rarity: 'Lost',
      cost: 4,
      attack: 3,
      health: 3,
      spellSpeed: '',
      artistName: 'Sky Punch',
      assets: art(651),
      description:
         'Play: Summon a Fervent Follower.\nSlip: Summon another Fervent Follower.\nImmortalize: Round End: I see an ally with 6+ Strength.',
   },
   {
      cardCode: '652',
      name: 'Paradox Pontiff',
      type: 'Immortalized Agent',
      region: 'Phasetide',
      rarity: 'Lost',
      cost: 4,
      attack: 3,
      health: 3,
      spellSpeed: '',
      artistName: 'Sky Punch',
      assets: art(652),
      description:
         'Play: Summon a Pontifex Dhabu.\nSlip: Summon another Pontifex Dhabu.\nThe first time each round you Shift, summon a Pontifex Dhabu.',
   },
   {
      cardCode: '241',
      name: 'Fervent Follower',
      type: 'Agent',
      description: 'Round End: I Flourish.',
   },
   {
      cardCode: '242',
      name: 'Pontifex Dhabu',
      type: 'Immortalized Agent',
      description: 'Round End: I Flourish.',
   },
];

describe('toMarkup', () => {
   it('turns leading keywords into pills', () => {
      expect(toMarkup('Evasive. \nStrike: Draw 1.')).toBe(
         '[Evasive]\nStrike: Draw 1.',
      );
      expect(toMarkup('Blitz. Cleave. ')).toBe('[Blitz] [Cleave]');
      expect(toMarkup('Evasive.\nFervor.')).toBe('[Evasive] [Fervor]');
      expect(toMarkup('Overpower\nWhen you Deplete an Agent, I Flourish.')).toBe(
         '[Overpower]\nWhen you Deplete an Agent, I Flourish.',
      );
   });

   it('leaves a keyword that starts a sentence in the text', () => {
      expect(toMarkup('Confront. Fervor grants an extra +1/+1.')).toBe(
         '[Confront]\nFervor grants an extra +1/+1.',
      );
      expect(toMarkup('Rewind an ally.')).toBe('Rewind an ally.');
   });

   it('replaces both chain icon spellings', () => {
      expect(toMarkup('Play: [icon] Deplete an enemy.')).toBe(
         'Play: @ Deplete an enemy.',
      );
      expect(toMarkup('Play: [icon]Phase an Agent.')).toBe(
         'Play: @ Phase an Agent.',
      );
      expect(toMarkup('Play: (C) Erase an Agent.')).toBe(
         'Play: @ Erase an Agent.',
      );
      expect(toMarkup('Minimum 1 (Max 5).')).toBe('Minimum 1 (Max 5).');
   });

   it('highlights card references and timelines', () => {
      expect(
         toMarkup('Create a The Firm Hand in hand.', ['The Firm Hand']),
      ).toBe('Create a {The Firm Hand} in hand.');
      expect(toMarkup('Round Start: I see Voiceless Sky.')).toBe(
         'Round Start: I see $Voiceless Sky$.',
      );
      expect(
         toMarkup('Shift to Torment, then create a Tormented Soul.', [
            'Tormented Soul',
         ]),
      ).toBe('Shift to $Torment$, then create a {Tormented Soul}.');
   });

   it('moves an inline Immortalize clause onto its own line', () => {
      expect(
         toMarkup('Slip: Grant me Blitz. Immortalize: I see no Agents.'),
      ).toBe('Slip: Grant me Blitz.\nImmortalize: I see no Agents.');
      expect(
         toMarkup('Enter or when I Immortalize: Give an enemy Exposed.'),
      ).toBe('Enter or when I Immortalize: Give an enemy Exposed.');
   });

   it('handles a missing description', () => {
      expect(toMarkup(null)).toBe('');
   });
});

describe('toEditorState', () => {
   it('maps an agent and its immortalized form', () => {
      const state = toEditorState(AGENT_OF_STABILITY);

      expect(state.cardType).toBe('agent');
      expect(state.syndicate).toBe('phasetide');
      expect(state.rarity).toBe('lost');
      expect(state.cards).toHaveLength(2);

      expect(state.cards[0]).toMatchObject({
         name: 'Agent of Stability',
         art: 'https://cdn.runeterra.ar/assets/img/card/en_us/360-full.webp',
         artLocal: '',
         artCredit: 'Romulo Reyes',
         artPos: { x: 0, y: 0, z: 0, r: 0 },
         cost: 1,
         strength: 1,
         durability: 1,
         description:
            "[Evasive]\nStrike: Create a {The Firm Hand} in hand or reduce its cost by 1 if you already have one.\nImmortalize: I've seen you Shift twice.",
      });
      expect(state.cards[1]).toMatchObject({
         name: 'Vaia, Stone Reader',
         art: 'https://cdn.runeterra.ar/assets/img/card/en_us/361-full.webp',
         strength: 1,
         durability: 2,
         description:
            '[Evasive]\nStrike: Create a 0 cost {The Firm Hand} in hand.\nI have +1/+0 for each $The One True Timeline$ in the Timeline Stack.',
      });
   });

   it('maps an action', () => {
      const state = toEditorState([AGENT_OF_STABILITY[2]]);

      expect(state.cardType).toBe('action');
      expect(state.rarity).toBe('common');
      expect(state.cards).toHaveLength(2);
      expect(state.cards[0]).toMatchObject({
         name: 'The Firm Hand',
         cost: 2,
         actionSpeed: 'slow',
         description: 'Shift to $The One True Timeline$.\nDraw 1.',
      });
      expect(state.cards[1].name).toBe('');
   });

   it('uses the first immortalized form when several are listed', () => {
      const state = toEditorState(CHOIR_RECRUITER);

      expect(state.cards[0].description).toBe(
         'Play: Summon a {Fervent Follower}.\nSlip: Summon another {Fervent Follower}.\nImmortalize: Round End: I see an ally with 6+ Strength.',
      );
      expect(state.cards[1].name).toBe('Paradox Pontiff');
      expect(state.cards[1].description).toContain('{Pontifex Dhabu}');
   });

   it('rejects an empty response', () => {
      expect(() => toEditorState([])).toThrow();
   });
});
