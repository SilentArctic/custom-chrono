import { FONT_FACES } from './layout';

const files = import.meta.glob('@/assets/game/**/*.webp', {
   eager: true,
   query: '?url',
   import: 'default',
});

const urlOf = (name) => {
   const key = Object.keys(files).find((path) => path.endsWith(`/${name}`));
   if (!key) throw new Error(`Missing card asset ${name}`);
   return files[key];
};

const loadImage = (name) =>
   new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load ${name}`));
      image.src = urlOf(name);
   });

export const sprite = (image, sx = 0, sy = 0, sw = image.width, sh = image.height) => ({
   image,
   sx,
   sy,
   sw,
   sh,
});

const unitySprite = (image, x, bottom, width, height) =>
   sprite(image, x, image.height - bottom - height, width, height);

export const SYNDICATES = [
   'lifeblood',
   'sungrace',
   'silence',
   'singularity',
   'splintergleam',
   'phasetide',
];

const OFFENSE = 'rgb(255,136,0)';
const DRAIN = 'rgb(255,0,18)';
const STATUS = 'rgb(181,0,255)';

const KEYWORD_ICONS = {
   Blitz: ['Blitz_icon.webp', OFFENSE],
   Cleave: ['Cleave_icon.webp', OFFENSE],
   Confront: ['Confront_icon.webp', OFFENSE],
   Delay: ['Delay_Icon.webp', STATUS],
   Evasive: ['Evasive_icon.webp', OFFENSE],
   Exposed: ['Exposed_icon.webp', STATUS],
   Overpower: ['Overpower_icon.webp', OFFENSE],
   Rejuvenate: ['Rejuvenate_icon.webp', DRAIN],
   Siphon: ['Siphon_icon.webp', DRAIN],
   Temporary: ['Temporary_icon.webp', STATUS],
   Transient: ['Transient_icon.webp', STATUS],
   Fervor: ['Fervor_Icon.webp', OFFENSE],
};

export function keywordIcon(name) {
   const entry = KEYWORD_ICONS[name];
   return entry ? { url: urlOf(entry[0]), color: entry[1] } : null;
}

let pending = null;

export function loadAssets() {
   if (pending) return pending;
   pending = load().catch((error) => {
      pending = null;
      throw error;
   });
   return pending;
}

async function load() {
   const names = [
      'CardFrame_Base.webp',
      'CardFrame_Immortal.webp',
      'CardFrame_Token.webp',
      'CardFrame_Action.webp',
      'CardFrameWindow_Base.webp',
      'CardFrameWindow_Immortal.webp',
      'CardFrameWindow_Token.webp',
      'CardFrameWindow_Action.webp',
      'NewCardArtMask.webp',
      'CardArtInnerGlow.webp',
      'ArtOutlineLine.webp',
      'CardDigitGlow.webp',
      'Card_Text_mask.webp',
      'CardTextBackground.webp',
      'ImmortalHeader_Shadow.webp',
      'Union.webp',
      'ImmortalHeader_Outline.webp',
      'KeywordPill.webp',
      'Rarities.webp',
      'Syndicates.webp',
      'Syndicates_Immortal.webp',
      'Actions.webp',
      'CC.webp',
      ...Object.values(KEYWORD_ICONS).map(([file]) => file),
   ];

   const [images] = await Promise.all([
      Promise.all(names.map(loadImage)),
      Promise.all(FONT_FACES.map((face) => document.fonts.load(face))),
   ]);
   const img = Object.fromEntries(names.map((name, i) => [name, images[i]]));

   const rarities = img['Rarities.webp'];
   const rarity = (bottom) => unitySprite(rarities, 28, bottom, 220, 152);
   const syndicates = img['Syndicates.webp'];
   const syndicate = (bottom) => unitySprite(syndicates, 28, bottom, 150, 206);
   const immortals = img['Syndicates_Immortal.webp'];
   const immortal = (bottom) => unitySprite(immortals, 52, bottom, 116, 300);
   const actions = img['Actions.webp'];

   return {
      frames: {
         base: sprite(img['CardFrame_Base.webp']),
         immortal: sprite(img['CardFrame_Immortal.webp']),
         token: sprite(img['CardFrame_Token.webp']),
         action: sprite(img['CardFrame_Action.webp']),
      },
      frameWindows: {
         base: sprite(img['CardFrameWindow_Base.webp']),
         immortal: sprite(img['CardFrameWindow_Immortal.webp']),
         token: sprite(img['CardFrameWindow_Token.webp']),
         action: sprite(img['CardFrameWindow_Action.webp']),
      },
      artMask: sprite(img['NewCardArtMask.webp']),
      artInnerGlow: sprite(img['CardArtInnerGlow.webp']),
      artOutline: sprite(img['ArtOutlineLine.webp']),
      digitGlow: sprite(img['CardDigitGlow.webp']),
      textMask: sprite(img['Card_Text_mask.webp']),
      textBackground: sprite(img['CardTextBackground.webp']),
      immortalizeTagShadow: sprite(img['ImmortalHeader_Shadow.webp']),
      immortalizeTagFill: sprite(img['Union.webp']),
      immortalizeTagOutline: sprite(img['ImmortalHeader_Outline.webp']),
      keywordPill: sprite(img['KeywordPill.webp']),
      keywordIcons: Object.fromEntries(
         Object.entries(KEYWORD_ICONS).map(([key, [file, color]]) => [
            key,
            { sprite: sprite(img[file]), color },
         ]),
      ),
      rarities: {
         common: rarity(636),
         divergent: rarity(12),
         rare: rarity(428),
         lost: rarity(220),
      },
      syndicates: Object.fromEntries(
         SYNDICATES.map((name, i) => [
            name,
            {
               base: syndicate([880, 16, 664, 448, 1096, 232][i]),
               immortal: immortal([1310, 62, 1006, 696, 1620, 372][i]),
            },
         ]),
      ),
      speeds: {
         fast: unitySprite(actions, 31, 461, 128, 137),
         immediate: unitySprite(actions, 33, 252, 128, 137),
         slow: unitySprite(actions, 33, 48, 128, 137),
      },
      inlineSprites: { CC: sprite(img['CC.webp']) },
   };
}
