export const CANVAS_LEFT = -8.5;
export const CANVAS_BOTTOM = -1;
export const CANVAS_WIDTH = 164;
export const CANVAS_HEIGHT = 226;
export const CANVAS_TOP = CANVAS_BOTTOM + CANVAS_HEIGHT;
export const CARD_WIDTH = 150;
export const CARD_HEIGHT = 210;
export const DEFAULT_PIXELS_PER_UNIT = 10;
export const AUTO_SIZE_STEP = 0.05;
export const ELLIPSIS = '…';

export const rect = (x, y, w, h) => ({ x, y, w, h });
export const offset = (r, dx, dy) => rect(r.x + dx, r.y + dy, r.w, r.h);

export function createUnits(pixelsPerUnit) {
   const s = pixelsPerUnit;
   const x = (units) => (units - CANVAS_LEFT) * s;
   const y = (units) => (CANVAS_TOP - units) * s;
   return {
      s,
      x,
      y,
      width: Math.round(CANVAS_WIDTH * s),
      height: Math.round(CANVAS_HEIGHT * s),
      rect: (r) => ({ x: x(r.x), y: y(r.y + r.h), w: r.w * s, h: r.h * s }),
   };
}

export const FORUM_METRICS = { ascent: 0.856, descent: 0.248, lineHeight: 1.004 };

export const LAYOUT = {
   artAspectRatio: 0.7142857,
   artPivotY: 0.95,
   artDisplayLeft: 2,
   artDisplayWidth: CARD_WIDTH - 4,
   artDisplayTop: CARD_HEIGHT - 4,
   artDisplayAgentBottom: 8,
   artDisplayActionBottom: 11.5,

   agentFrameRect: rect(-6.3, -1, CARD_WIDTH + 6.3 + 5, CARD_HEIGHT + 1 + 9.7),
   actionFrameRect: rect(-8.1, 0, CARD_WIDTH + 8.1 + 6, CARD_HEIGHT + 15),

   artWindows: {
      base: [0.083333, 0.049689, 0.933333, 0.953416],
      token: [0.083333, 0.048913, 0.933333, 0.95264],
      immortal: [0.09375, 0.048137, 0.922917, 0.941382],
      action: [0.08125, 0.087271, 0.933333, 0.949695],
   },
   artOutlineWidth: 1.02,
   artOutlineInset: 0.34,
   artOutlineColor: 'rgba(255,255,255,0.239)',

   effectAreaActionLeft: 2,
   effectAreaAgentLeft: 2.69,
   effectAreaWidth: CARD_WIDTH - 4,
   effectPaddingSide: 13,
   effectTextActionMargin: 2.9,
   effectTextAgentMargin: 1.85,
   effectTextActionBottom: 31.5,
   effectTextAgentBottom: 27,
   effectTextImmortalBottom: 32,
   effectSpacing: 0.67,
   effectBackgroundActionBottom: 11.5,
   effectBackgroundAgentBottom: 8,
   effectBackgroundOverhang: 40,
   effectBackgroundOverhangWithPills: 10.75,
   effectBlurRadius: 3.5,
   effectBlurLevels: 6,
   effectBlurBottomWeight: 1 / 0.9372,
   bodyFontSize: 8.5,
   inlineSpriteScale: 1,

   immortalizeTagHeight: 18.15,
   immortalizeClauseSpacing: -2.69,
   immortalizeTagTextInsetSide: 30,
   immortalizeTagTextInsetBottom: 4.6,
   immortalizeTagTextInsetTop: 3.4,
   immortalizeTagFontSize: 6.5,
   immortalizeTagFontSizeMin: 5,
   immortalizeTagShadowTint: 'rgba(255,255,255,0.0196)',
   immortalizeTagFillTint: 'rgba(255,255,255,0.6196)',
   immortalizeTagOutlineTint: 'rgba(255,237,186,0.1294)',

   nameRect: rect(35.03, 193.76, 80, 14.4),
   nameFontSize: 9.5,
   nameFontSizeMin: 5.3,
   actionNameNudge: [-1.76, -0.03],
   typeRect: rect(35.37, 188.3, 46, 9),
   typeFontSize: 5.2,
   typeFontSizeMin: 4.5,
   actionTypeNudge: [-2.1, -0.11],
   typePlateMargin: 1,
   typePlateEnd: { base: 0.4415, immortal: 0.5624, token: 0.3674, action: 0.5116 },

   costRect: rect(-2.5, 178.4, 31, 31),
   costActionRect: rect(-2.5, 178.9, 31, 31),
   costFontSize: 22,
   costFontSizeMin: 12,
   costGlowRect: rect(-1.68, 178.55, 29.36, 30.7),
   costGlowActionRect: rect(-1.68, 179.05, 29.36, 30.7),
   costGlowTint: 'rgba(255,255,255,0.0706)',
   strengthRect: rect(2.53, 3.69, 22, 22),
   durabilityRect: rect(126.53, 4.03, 22, 22),
   statFontSize: 14.5,
   statFontSizeMin: 3,
   strengthGlowRect: rect(0.86, 1.44, 25.33, 26.5),
   durabilityGlowRect: rect(124.39, 1.78, 26.28, 26.5),
   statGlowTint: 'rgba(255,255,255,0.1216)',

   keywordPillHeight: 10.75,
   keywordPillIconInset: 6.64,
   keywordPillLabelInset: 18.14,
   keywordPillRightPadding: 6.89,
   keywordPillOverlap: 4.7,
   keywordPillRowGap: 1.34,
   keywordPillTextGap: 4.03,
   keywordPillMaxRowWidth: 123.65,
   keywordPillCapWidth: 60 / 5.952,
   keywordPillSourceCap: 60,
   keywordPillIconSize: 9.41,
   keywordPillIconOffsetY: 0.53,
   keywordPillLabelOffsetY: -0.14,
   keywordPillFontSize: 6.048,
   keywordPillMinLabelScale: 0.7,

   rarityAgentRect: rect(66.75, 0, 18.5, 12.8),
   rarityActionRect: rect(66.1, 1.9, 18.8, 13),
   syndicateRect: rect(122.5, 179.95, 23.6, 32.4),
   syndicateImmortalRect: rect(135.51, 161.3, 19.49, 50.41),
   actionIconRect: rect(15.07, 201.93, 20.7, 20.7),
};

export const TEXT_STYLES = {
   stat: {
      family: 'Barlow',
      weight: 700,
      color: '#ffffff',
      outlineEm: 0.027,
      outlineColor: 'rgb(9,6,6)',
      underlay: { color: 'rgba(0,0,0,0.851)', offsetEm: 0.029, dilateEm: 0.012, softnessEm: 0.012 },
   },
   statGem: {
      family: 'Barlow',
      weight: 700,
      color: '#ffffff',
      outlineEm: 0.02,
      innerOutlineEm: 0.02,
      outlineColor: 'rgb(9,6,6)',
      underlay: { color: 'rgba(0,0,0,0.851)', offsetEm: 0.042, dilateEm: 0.009, softnessEm: 0.014 },
   },
   name: { family: 'Barlow Semi Condensed', weight: 600, color: '#ffffff', smallCaps: true },
   type: { family: 'Barlow Semi Condensed', weight: 600, color: 'rgb(238,222,192)', smallCaps: true },
   pill: { family: 'Barlow Semi Condensed', weight: 600, color: 'rgb(255,210,61)', smallCaps: true },
   body: { family: 'Forum', weight: 400, color: '#ffffff' },
   clause: { family: 'Forum', weight: 400, color: 'rgb(255,217,146)' },
   immortalizeTag: {
      family: 'Barlow Condensed',
      weight: 600,
      color: 'rgb(248,194,121)',
      gradientLeft: 'rgb(255,221,174)',
      charSpacingEm: 0.04,
      underlay: { color: 'rgba(0,0,0,0.651)', offsetEm: 0.06, dilateEm: 0, softnessEm: 0.008 },
   },
};

export const FONT_FACES = [
   '400 10px Forum',
   '700 10px Barlow',
   '600 10px "Barlow Semi Condensed"',
   '600 10px "Barlow Condensed"',
];
