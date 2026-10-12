import { createCard } from '@/stores/card.store';
import * as ActionSpeeds from '@/constants/actionSpeeds.constants';
import * as CreatorTypes from '@/constants/creatorTypes';
import * as Rarities from '@/constants/rarities.constants';
import * as Syndicates from '@/constants/syndicates.constants';
import * as Timelines from '@/constants/timelines.constants';
import { PILL_KEYWORDS } from '@/utils/gameCard/cardText';

const API = 'https://runeterra.ar/api/cards';
const QUERY = 'en_us?game=chrono';

const IMMORTALIZED = 'Immortalized Agent';
const ACTION = 'Action';

/* The list endpoint is POST-only and pages at 20 cards unless `take` is
   raised. It carries no card text, so only what the picker shows is kept. */
export async function fetchCardList() {
   const response = await fetch(`${API}/builder/get/${QUERY}&take=1000`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
   });
   if (!response.ok)
      throw new Error(`Card list request failed (${response.status})`);

   const { cards } = await response.json();
   return (cards ?? [])
      .map((card) => ({
         code: card.cardCode,
         name: card.name,
         type: card.type,
         syndicate: card.region,
         cost: card.cost,
         immortalizedName:
            (card.associatedCards ?? []).find((c) => c.type === IMMORTALIZED)
               ?.name ?? '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
}

/* Returns the card followed by its associated cards (its Immortalized form
   and any cards its text refers to), each with its description. */
export async function fetchCardDetail(code) {
   const response = await fetch(
      `${API}/get/cards/${encodeURIComponent(code)}/${QUERY}`,
   );
   if (!response.ok)
      throw new Error(`Card request failed (${response.status})`);
   return response.json();
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CHAIN_ICON = /[ \t]*(?:\[icon\]|\(C\))[ \t]*/g;
const INLINE_CLAUSE = /([.!?])[ \t]+(Immortalize:)/g;
const LEADING_KEYWORD = new RegExp(
   `^\\s*(${PILL_KEYWORDS.join('|')})(?:\\.[ \\t]*|[ \\t]*(?=\\n|$))`,
);

/* Wraps card names as {references} and timeline names as $timelines$ in one
   pass, longest name first, so a name inside a longer name is left alone. */
function highlightNames(text, referenceNames) {
   const wrappers = new Map();
   referenceNames.forEach((name) => wrappers.set(name, `{${name}}`));
   Timelines.ALL.forEach((name) => wrappers.set(name, `$${name}$`));

   const names = [...wrappers.keys()]
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
   if (!names.length) return text;

   const pattern = new RegExp(
      `(?<!\\w)(?:${names.map(escapeRegExp).join('|')})(?!\\w)`,
      'g',
   );
   return text.replace(pattern, (name) => wrappers.get(name));
}

/* Converts the API's plain description into the editor's markup. */
export function toMarkup(description, referenceNames = []) {
   let text = (description ?? '')
      .replace(/\r/g, '')
      .replace(CHAIN_ICON, ' @ ')
      /* the clause marker is only recognised at the start of a line */
      .replace(INLINE_CLAUSE, '$1\n$2')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');

   /* keywords listed ahead of the text are drawn as pills */
   const pills = [];
   for (
      let match = LEADING_KEYWORD.exec(text);
      match;
      match = LEADING_KEYWORD.exec(text)
   ) {
      if (!pills.includes(match[1])) pills.push(match[1]);
      text = text.slice(match[0].length);
   }

   text = highlightNames(text.trim(), referenceNames);
   if (!pills.length) return text;

   const pillLine = pills.map((pill) => `[${pill}]`).join(' ');
   return text ? `${pillLine}\n${text}` : pillLine;
}

const matchConstant = (value, allowed, fallback) => {
   const normalized = (value ?? '').toLowerCase();
   return allowed.includes(normalized) ? normalized : fallback;
};

function toCard(source, detail) {
   const references = detail
      .map((card) => card.name)
      .filter((name) => name !== source.name);

   return {
      ...createCard(),
      name: source.name ?? '',
      art: source.assets?.[0]?.fullAbsolutePath ?? '',
      artCredit: source.artistName ?? '',
      description: toMarkup(source.description, references),
      cost: Number(source.cost) || 0,
      strength: Number(source.attack) || 0,
      durability: Number(source.health) || 0,
      actionSpeed: matchConstant(
         source.spellSpeed,
         Object.values(ActionSpeeds),
         ActionSpeeds.IMMEDIATE,
      ),
   };
}

/* Maps a fetchCardDetail response onto the card store's state. */
export function toEditorState(detail) {
   if (!Array.isArray(detail) || !detail.length)
      throw new Error('Card details are empty');

   const [card] = detail;
   const isAction = card.type === ACTION;
   const immortalized = isAction
      ? null
      : detail.find((c) => c.type === IMMORTALIZED);

   return {
      cardType: isAction ? CreatorTypes.ACTION : CreatorTypes.AGENT,
      syndicate: matchConstant(card.region, Object.values(Syndicates), ''),
      rarity: matchConstant(card.rarity, Rarities.ALL, Rarities.COMMON),
      cards: [
         toCard(card, detail),
         immortalized ? toCard(immortalized, detail) : createCard(),
      ],
   };
}
