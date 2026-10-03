import { FONT_FACES } from './layout';

const files = import.meta.glob('@/assets/game/**/*.png', {
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
   Blitz: ['Blitz_icon.png', OFFENSE],
   Cleave: ['Cleave_icon.png', OFFENSE],
   Confront: ['Confront_icon.png', OFFENSE],
   Delay: ['Delay_Icon.png', STATUS],
   Evasive: ['Evasive_icon.png', OFFENSE],
   Exposed: ['Exposed_icon.png', STATUS],
   Overpower: ['Overpower_icon.png', OFFENSE],
   Rejuvenate: ['Rejuvenate_icon.png', DRAIN],
   Siphon: ['Siphon_icon.png', DRAIN],
   Temporary: ['Temporary_icon.png', STATUS],
   Transient: ['Transient_icon.png', STATUS],
   Fervor: ['Fervor_Icon.png', OFFENSE],
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
      'CardFrame_Base.png',
      'CardFrame_Immortal.png',
      'CardFrame_Token.png',
      'CardFrame_Action.png',
      'CardFrameWindow_Base.png',
      'CardFrameWindow_Immortal.png',
      'CardFrameWindow_Token.png',
      'CardFrameWindow_Action.png',
      'NewCardArtMask.png',
      'CardArtInnerGlow.png',
      'ArtOutlineLine.png',
      'CardDigitGlow.png',
      'Card_Text_mask.png',
      'CardTextBackground.png',
      'ImmortalHeader_Shadow.png',
      'Union.png',
      'ImmortalHeader_Outline.png',
      'KeywordPill.png',
      'Rarities.png',
      'Syndicates.png',
      'Syndicates_Immortal.png',
      'Actions.png',
      'CC.png',
      ...Object.values(KEYWORD_ICONS).map(([file]) => file),
   ];

   const [images] = await Promise.all([
      Promise.all(names.map(loadImage)),
      Promise.all(FONT_FACES.map((face) => document.fonts.load(face))),
   ]);
   const img = Object.fromEntries(names.map((name, i) => [name, images[i]]));

   const rarities = img['Rarities.png'];
   const rarity = (bottom) => unitySprite(rarities, 28, bottom, 220, 152);
   const syndicates = img['Syndicates.png'];
   const syndicate = (bottom) => unitySprite(syndicates, 28, bottom, 150, 206);
   const immortals = img['Syndicates_Immortal.png'];
   const immortal = (bottom) => unitySprite(immortals, 52, bottom, 116, 300);
   const actions = img['Actions.png'];

   return {
      frames: {
         base: sprite(img['CardFrame_Base.png']),
         immortal: sprite(img['CardFrame_Immortal.png']),
         token: sprite(img['CardFrame_Token.png']),
         action: sprite(img['CardFrame_Action.png']),
      },
      frameWindows: {
         base: sprite(img['CardFrameWindow_Base.png']),
         immortal: sprite(img['CardFrameWindow_Immortal.png']),
         token: sprite(img['CardFrameWindow_Token.png']),
         action: sprite(img['CardFrameWindow_Action.png']),
      },
      artMask: sprite(img['NewCardArtMask.png']),
      artInnerGlow: sprite(img['CardArtInnerGlow.png']),
      artOutline: sprite(img['ArtOutlineLine.png']),
      digitGlow: sprite(img['CardDigitGlow.png']),
      textMask: sprite(img['Card_Text_mask.png']),
      textBackground: sprite(img['CardTextBackground.png']),
      immortalizeTagShadow: sprite(img['ImmortalHeader_Shadow.png']),
      immortalizeTagFill: sprite(img['Union.png']),
      immortalizeTagOutline: sprite(img['ImmortalHeader_Outline.png']),
      keywordPill: sprite(img['KeywordPill.png']),
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
      inlineSprites: { CC: sprite(img['CC.png']) },
   };
}
