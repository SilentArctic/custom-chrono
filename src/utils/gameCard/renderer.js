import {
   AUTO_SIZE_STEP,
   DEFAULT_PIXELS_PER_UNIT,
   ELLIPSIS,
   FORUM_METRICS,
   LAYOUT as L,
   TEXT_STYLES,
   createUnits,
   offset,
   rect,
} from './layout';
import { loadAssets } from './assets';
import {
   extractPills,
   getFrameKind,
   getTypeLine,
   parseMarkup,
   splitImmortalizeClause,
} from './cardText';

const SHADOW_SHIFT = 20000;

export { getFrameKind, getTypeLine } from './cardText';

export async function renderGameCard(canvas, model, options = {}) {
   const assets = await loadAssets();
   const units = createUnits(options.pixelsPerUnit ?? DEFAULT_PIXELS_PER_UNIT);
   const renderer = new CardRenderer(assets, units, options.cache ?? {});
   renderer.render(canvas, model);
}

class CardRenderer {
   constructor(assets, units, cache) {
      this.assets = assets;
      this.u = units;
      this.cache = cache;
      this.scratch = document.createElement('canvas');
   }

   render(canvas, model) {
      const { u } = this;
      canvas.width = u.width;
      canvas.height = u.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, u.width, u.height);

      const frame = getFrameKind(model);
      const isAction = frame === 'action';
      const frameRect = this.fittedFrameRect(frame);

      const layer = makeCanvas(u.width, u.height);
      const layerCtx = layer.getContext('2d');
      const rawArt = makeCanvas(u.width, u.height);

      this.drawArt(layerCtx, rawArt, model, isAction);
      this.drawArtWindowDecor(layerCtx, frame, frameRect);
      this.drawEffectArea(layerCtx, model, frame, rawArt);
      this.drawSprite(layerCtx, this.assets.frameWindows[frame], u.rect(frameRect), null, 'destination-in');

      ctx.drawImage(layer, 0, 0);
      this.drawSprite(ctx, this.assets.frames[frame], u.rect(frameRect));
      this.drawPanels(ctx, model, frame, frameRect);
   }

   fittedFrameRect(frame) {
      const sprite = this.assets.frames[frame];
      const base = frame === 'action' ? L.actionFrameRect : L.agentFrameRect;
      return fitPreservingAspect(base, sprite.sw, sprite.sh, 0, 0);
   }

   drawArt(layerCtx, rawArt, model, isAction) {
      const { u } = this;
      const displayBottom = isAction ? L.artDisplayActionBottom : L.artDisplayAgentBottom;
      const display = rect(L.artDisplayLeft, displayBottom, L.artDisplayWidth, L.artDisplayTop - displayBottom);
      const artWidth = display.w;
      const artHeight = artWidth / L.artAspectRatio;
      const artTop = display.y + L.artPivotY * display.h + (1 - L.artPivotY) * artHeight;
      const artPx = u.rect(rect(display.x, artTop - artHeight, artWidth, artHeight));
      const displayPx = u.rect(display);

      const paint = (ctx) => {
         const art = model.art;
         if (!art || !art.width || !art.height) return;
         const { x = 0, y = 0, z = 0, r = 0 } = model.artPos ?? {};
         const cover = Math.max(artPx.w / art.width, artPx.h / art.height);
         const w = art.width * cover;
         const h = art.height * cover;
         ctx.save();
         ctx.imageSmoothingQuality = 'high';
         ctx.translate(artPx.x + artPx.w / 2 + (artPx.w * x) / 500, artPx.y + artPx.h / 2 + (artPx.h * y) / 500);
         ctx.rotate((r * Math.PI) / 180);
         const scale = 1 + z / 100;
         ctx.scale(scale, scale);
         ctx.drawImage(art, -w / 2, -h / 2, w, h);
         ctx.restore();
      };

      paint(rawArt.getContext('2d'));

      const artLayer = makeCanvas(u.width, u.height);
      const artCtx = artLayer.getContext('2d');
      artCtx.save();
      artCtx.beginPath();
      artCtx.rect(displayPx.x, displayPx.y, displayPx.w, displayPx.h);
      artCtx.clip();
      paint(artCtx);
      artCtx.restore();
      this.drawSprite(artCtx, this.assets.artMask, displayPx, null, 'destination-in');
      layerCtx.drawImage(artLayer, 0, 0);
   }

   artWindow(frame, frameRect) {
      const window = L.artWindows[frame];
      return rect(
         frameRect.x + window[0] * frameRect.w,
         frameRect.y + (1 - window[3]) * frameRect.h,
         (window[2] - window[0]) * frameRect.w,
         (window[3] - window[1]) * frameRect.h,
      );
   }

   drawArtWindowDecor(ctx, frame, frameRect) {
      const { u } = this;
      const art = this.artWindow(frame, frameRect);
      this.drawSprite(ctx, this.assets.artInnerGlow, u.rect(art));
      if (frame === 'immortal') return;

      const left = rect(art.x - L.artOutlineInset, art.y, L.artOutlineWidth, art.h);
      const right = rect(art.x + art.w - L.artOutlineWidth + L.artOutlineInset, art.y, L.artOutlineWidth, art.h);
      this.drawSprite(ctx, this.assets.artOutline, u.rect(left), L.artOutlineColor);
      this.drawSprite(ctx, this.assets.artOutline, u.rect(right), L.artOutlineColor);
   }

   drawEffectArea(ctx, model, frame, rawArt) {
      const { u } = this;
      const isAction = frame === 'action';
      const description = model.description ?? '';
      const split = frame === 'base' ? splitImmortalizeClause(description) : { effect: description, clause: null };
      const { pills: pillKeys, text: effectText } = extractPills(split.effect);
      const pills = this.buildKeywordPills(pillKeys);
      const hasClause = split.clause !== null;

      const areaLeft = isAction ? L.effectAreaActionLeft : L.effectAreaAgentLeft;
      const textMargin = isAction ? L.effectTextActionMargin : L.effectTextAgentMargin;
      const contentLeft = areaLeft + L.effectPaddingSide - textMargin;
      const contentWidth = L.effectAreaWidth - L.effectPaddingSide * 2 + textMargin * 2;
      const contentWidthPx = contentWidth * u.s;
      const bodySize = L.bodyFontSize * u.s;

      const effect = this.layoutRichText(ctx, parseMarkup(effectText, TEXT_STYLES.body.color), TEXT_STYLES.body, bodySize, contentWidthPx);
      const clause = hasClause
         ? this.layoutRichText(ctx, parseMarkup(split.clause, TEXT_STYLES.clause.color), TEXT_STYLES.clause, bodySize, contentWidthPx)
         : null;

      const effectHeight = effect.height / u.s;
      const clauseHeight = clause ? clause.height / u.s : 0;
      const textBottom = isAction
         ? L.effectTextActionBottom
         : frame === 'immortal'
           ? L.effectTextImmortalBottom
           : L.effectTextAgentBottom;
      const tagBottom = textBottom + clauseHeight + L.immortalizeClauseSpacing;
      const effectBottom = hasClause ? tagBottom + L.immortalizeTagHeight + L.effectSpacing : textBottom;
      const effectTop = effectBottom + effectHeight;

      const rowsHeight = this.layoutKeywordPills(ctx, pills);
      const areaTop = pills.length ? effectTop + L.effectSpacing + rowsHeight : effectTop;
      const overhang = pills.length
         ? Math.max(L.effectBackgroundOverhang - rowsHeight, L.effectBackgroundOverhangWithPills)
         : L.effectBackgroundOverhang;
      const backgroundBottom = isAction ? L.effectBackgroundActionBottom : L.effectBackgroundAgentBottom;
      const background = rect(areaLeft, backgroundBottom, L.effectAreaWidth, areaTop + overhang - backgroundBottom);
      this.drawEffectBackground(ctx, background, rawArt, model);
      this.drawKeywordPills(ctx, pills, areaLeft + L.effectAreaWidth / 2, areaTop);

      this.drawRichTextBlock(ctx, effect, u.x(contentLeft), u.y(effectTop));

      if (!hasClause) return;

      const fill = this.assets.immortalizeTagFill;
      const tagWidth = (L.immortalizeTagHeight * fill.sw) / fill.sh;
      const tag = rect(areaLeft + (L.effectAreaWidth - tagWidth) / 2, tagBottom, tagWidth, L.immortalizeTagHeight);
      const tagPx = u.rect(tag);
      this.drawSprite(ctx, this.assets.immortalizeTagShadow, tagPx, L.immortalizeTagShadowTint);
      this.drawSprite(ctx, fill, tagPx, L.immortalizeTagFillTint);
      this.drawSprite(ctx, this.assets.immortalizeTagOutline, tagPx, L.immortalizeTagOutlineTint);

      const tagText = rect(
         tag.x + L.immortalizeTagTextInsetSide,
         tag.y + L.immortalizeTagTextInsetBottom,
         tag.w - L.immortalizeTagTextInsetSide * 2,
         tag.h - L.immortalizeTagTextInsetBottom - L.immortalizeTagTextInsetTop,
      );
      const label = 'IMMORTALIZE';
      applyFont(ctx, TEXT_STYLES.immortalizeTag, L.immortalizeTagFontSize * u.s);
      const labelWidth = ctx.measureText(label).width / u.s;
      const tagFit = rect(tagText.x + (tagText.w - labelWidth) / 2, tagText.y, labelWidth, tagText.h);
      this.drawSingleLine(ctx, label, TEXT_STYLES.immortalizeTag, L.immortalizeTagFontSize, tagFit, 'center', L.immortalizeTagFontSizeMin);

      this.drawRichTextBlock(ctx, clause, u.x(contentLeft), u.y(textBottom + clauseHeight));
   }

   buildKeywordPills(keys) {
      return keys.map((key) => ({ key, label: key, icon: this.assets.keywordIcons[key] ?? null }));
   }

   layoutKeywordPills(ctx, pills) {
      if (!pills.length) return 0;
      const { u } = this;

      applyFont(ctx, TEXT_STYLES.pill, L.keywordPillFontSize * u.s);
      pills.forEach((pill) => {
         const labelX = pill.icon ? L.keywordPillLabelInset : L.keywordPillIconInset;
         const interior = L.keywordPillMaxRowWidth - labelX - L.keywordPillRightPadding;
         const preferred = ctx.measureText(pill.label).width / u.s;
         pill.labelX = labelX;
         pill.labelWidth = Math.min(preferred, interior);
         pill.width = labelX + pill.labelWidth + L.keywordPillRightPadding;
      });

      let row = 0;
      let rowWidth = 0;
      pills.forEach((pill, i) => {
         let first = i === 0 || rowWidth === 0;
         if (!first && rowWidth + pill.width - L.keywordPillOverlap > L.keywordPillMaxRowWidth) {
            row += 1;
            rowWidth = 0;
            first = true;
         }
         pill.row = row;
         pill.x = first ? 0 : rowWidth - L.keywordPillOverlap;
         rowWidth = pill.x + pill.width;
      });

      const rows = row + 1;
      return rows * L.keywordPillHeight + (rows - 1) * L.keywordPillRowGap + L.keywordPillTextGap;
   }

   drawKeywordPills(ctx, pills, centerX, top) {
      const { u } = this;
      const rows = new Map();
      pills.forEach((pill) => {
         if (!rows.has(pill.row)) rows.set(pill.row, []);
         rows.get(pill.row).push(pill);
      });

      rows.forEach((rowPills, rowIndex) => {
         const last = rowPills[rowPills.length - 1];
         const rowLeft = centerX - (last.x + last.width) / 2;
         const rowTop = top - rowIndex * (L.keywordPillHeight + L.keywordPillRowGap);
         rowPills.forEach((pill) => {
            const r = rect(rowLeft + pill.x, rowTop - L.keywordPillHeight, pill.width, L.keywordPillHeight);
            this.drawKeywordPillBackground(ctx, r);
            if (pill.icon) {
               const icon = rect(r.x + L.keywordPillIconInset, r.y + L.keywordPillIconOffsetY, L.keywordPillIconSize, L.keywordPillIconSize);
               this.drawSprite(ctx, pill.icon.sprite, u.rect(icon), pill.icon.color);
            }
            const label = rect(r.x + pill.labelX, r.y + L.keywordPillLabelOffsetY, pill.labelWidth, L.keywordPillHeight);
            this.drawSingleLine(
               ctx,
               pill.label,
               TEXT_STYLES.pill,
               L.keywordPillFontSize,
               label,
               'left',
               L.keywordPillFontSize * L.keywordPillMinLabelScale,
               true,
            );
         });
      });
   }

   drawKeywordPillBackground(ctx, r) {
      const { u } = this;
      const s = this.assets.keywordPill;
      const d = u.rect(r);
      const cap = Math.min(L.keywordPillCapWidth * u.s, d.w / 2);
      const sc = L.keywordPillSourceCap;
      const part = (sx, sw) => ({ image: s.image, sx: s.sx + sx, sy: s.sy, sw, sh: s.sh });
      this.drawSprite(ctx, part(0, sc), { x: d.x, y: d.y, w: cap, h: d.h });
      this.drawSprite(ctx, part(sc, s.sw - sc * 2), { x: d.x + cap, y: d.y, w: d.w - cap * 2, h: d.h });
      this.drawSprite(ctx, part(s.sw - sc, sc), { x: d.x + d.w - cap, y: d.y, w: cap, h: d.h });
   }

   drawEffectBackground(ctx, background, rawArt, model) {
      const { u } = this;
      const px = u.rect(background);
      const r = {
         x: Math.round(px.x),
         y: Math.round(px.y),
         w: Math.round(px.x + px.w) - Math.round(px.x),
         h: Math.round(px.y + px.h) - Math.round(px.y),
      };
      if (r.w <= 0 || r.h <= 0) return;

      const layer = makeCanvas(r.w, r.h);
      const lctx = layer.getContext('2d');
      const blur = this.progressiveBlur(rawArt, r, model);
      if (blur) lctx.drawImage(blur, 0, 0);

      const full = { x: 0, y: 0, w: r.w, h: r.h };
      this.drawSprite(lctx, this.assets.textBackground, full);
      this.drawSprite(lctx, this.assets.textMask, full, null, 'destination-in');
      ctx.drawImage(layer, r.x, r.y);
   }

   progressiveBlur(rawArt, r, model) {
      if (!model.art) return null;
      const { u } = this;
      const { x = 0, y = 0, z = 0, r: rotation = 0 } = model.artPos ?? {};
      const key = [model.art.src, model.art.width, model.art.height, x, y, z, rotation, r.x, r.y, r.w, r.h, u.s].join('|');
      if (this.cache.blurKey === key && this.cache.blur) return this.cache.blur;

      const levels = L.effectBlurLevels;
      const maxRadius = L.effectBlurRadius * u.s;
      const pad = Math.ceil(maxRadius * 2);
      const source = { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };

      const output = makeCanvas(r.w, r.h);
      const octx = output.getContext('2d');
      const level = makeCanvas(source.w, source.h);
      const lctx = level.getContext('2d');
      const masked = makeCanvas(r.w, r.h);
      const mctx = masked.getContext('2d');
      const supportsFilter = 'filter' in lctx;

      for (let i = 0; i <= levels; i += 1) {
         const sigma = (maxRadius * i) / levels / 2;
         lctx.clearRect(0, 0, source.w, source.h);
         if (supportsFilter) lctx.filter = sigma > 0 ? `blur(${sigma}px)` : 'none';
         lctx.drawImage(rawArt, -source.x, -source.y);

         mctx.clearRect(0, 0, r.w, r.h);
         mctx.globalCompositeOperation = 'source-over';
         mctx.drawImage(level, pad, pad, r.w, r.h, 0, 0, r.w, r.h);

         const gradient = mctx.createLinearGradient(0, 0, 0, r.h);
         const stops = 64;
         for (let step = 0; step <= stops; step += 1) {
            const fraction = step / stops;
            const t = fraction * L.effectBlurBottomWeight;
            const strength = Math.min(1, t) * levels;
            const weight = Math.max(0, 1 - Math.abs(strength - i));
            const alpha = Math.min(1, t * 4);
            gradient.addColorStop(fraction, `rgba(0,0,0,${weight * alpha})`);
         }
         mctx.globalCompositeOperation = 'destination-in';
         mctx.fillStyle = gradient;
         mctx.fillRect(0, 0, r.w, r.h);

         octx.globalCompositeOperation = 'lighter';
         octx.drawImage(masked, 0, 0);
      }

      this.cache.blurKey = key;
      this.cache.blur = output;
      return output;
   }

   drawPanels(ctx, model, frame, frameRect) {
      const { u } = this;
      const isAction = frame === 'action';
      const isImmortal = frame === 'immortal';

      if (!isAction) {
         this.drawSprite(ctx, this.assets.digitGlow, u.rect(L.strengthGlowRect), L.statGlowTint);
         this.drawSingleLine(ctx, String(model.strength ?? 0), TEXT_STYLES.statGem, L.statFontSize, L.strengthRect, 'center', L.statFontSizeMin);
         this.drawSprite(ctx, this.assets.digitGlow, u.rect(L.durabilityGlowRect), L.statGlowTint);
         this.drawSingleLine(ctx, String(model.durability ?? 0), TEXT_STYLES.statGem, L.statFontSize, L.durabilityRect, 'center', L.statFontSizeMin);
      }

      const rarity = frame === 'token' ? null : this.assets.rarities[model.rarity] ?? this.assets.rarities.common;
      if (rarity) {
         this.drawSprite(ctx, rarity, u.rect(isAction ? L.rarityActionRect : L.rarityAgentRect));
      }

      const syndicate = this.assets.syndicates[model.syndicate];
      if (syndicate) {
         const sprite = isImmortal ? syndicate.immortal : syndicate.base;
         const fitted = fitPreservingAspect(isImmortal ? L.syndicateImmortalRect : L.syndicateRect, sprite.sw, sprite.sh, 0.5, 0.5);
         this.drawSprite(ctx, sprite, u.rect(fitted));
      }

      if (isAction) {
         const speed = this.assets.speeds[model.actionSpeed] ?? this.assets.speeds.slow;
         this.drawSprite(ctx, speed, u.rect(fitPreservingAspect(L.actionIconRect, speed.sw, speed.sh, 0, 0.5)));
      }

      this.drawSprite(ctx, this.assets.digitGlow, u.rect(isAction ? L.costGlowActionRect : L.costGlowRect), L.costGlowTint);
      this.drawSingleLine(ctx, String(model.cost ?? 0), TEXT_STYLES.stat, L.costFontSize, isAction ? L.costActionRect : L.costRect, 'center', L.costFontSizeMin);

      const nameRect = isAction ? offset(L.nameRect, ...L.actionNameNudge) : L.nameRect;
      this.drawSingleLine(ctx, model.name ?? '', TEXT_STYLES.name, L.nameFontSize, nameRect, 'left', L.nameFontSizeMin, true);

      const typeBase = isAction ? offset(L.typeRect, ...L.actionTypeNudge) : L.typeRect;
      const typeRight = Math.min(typeBase.x + typeBase.w, frameRect.x + L.typePlateEnd[frame] * frameRect.w - L.typePlateMargin);
      const typeRect = rect(typeBase.x, typeBase.y, typeRight - typeBase.x, typeBase.h);
      this.drawSingleLine(ctx, getTypeLine(frame, model.actionSpeed), TEXT_STYLES.type, L.typeFontSize, typeRect, 'left', L.typeFontSizeMin);
   }

   drawSingleLine(ctx, text, style, fontSizeUnits, r, anchor, minFontSizeUnits = 0, ellipsis = false) {
      if (!text) return;
      const { u } = this;
      const px = u.rect(r);
      let sizePx = fontSizeUnits * u.s;
      const minPx = Math.max(1, minFontSizeUnits * u.s);
      const step = AUTO_SIZE_STEP * u.s;

      const measure = (value) => {
         applyFont(ctx, style, sizePx);
         return ctx.measureText(value);
      };

      let metrics = measure(text);
      if (minFontSizeUnits > 0) {
         while (metrics.width > px.w && sizePx - step >= minPx) {
            sizePx -= step;
            metrics = measure(text);
         }
      }

      let value = text;
      if (ellipsis && metrics.width > px.w) {
         let trimmed = text;
         while (trimmed.length > 0 && measure(trimmed.trimEnd() + ELLIPSIS).width > px.w) {
            trimmed = trimmed.slice(0, -1);
         }
         value = trimmed.trimEnd() + ELLIPSIS;
         metrics = measure(value);
      }

      const x = anchor === 'center' ? px.x + px.w / 2 - metrics.width / 2 : px.x;
      const top = -metrics.actualBoundingBoxAscent;
      const bottom = metrics.actualBoundingBoxDescent;
      const baseline = px.y + px.h / 2 - (top + bottom) / 2;
      drawStyledText(ctx, value, style, sizePx, x, baseline, metrics.width);
   }

   layoutRichText(ctx, tokens, style, sizePx, widthPx) {
      const metrics = FORUM_METRICS;
      const ascent = metrics.ascent * sizePx;
      const descent = metrics.descent * sizePx;
      const lineHeight = metrics.lineHeight * sizePx;
      const lines = [];
      let segments = [];
      let width = 0;
      let hasContent = false;

      const flush = () => {
         lines.push({ segments, width });
         segments = [];
         width = 0;
         hasContent = false;
      };

      tokens.forEach((token) => {
         if (token.kind === 'newline') {
            flush();
            return;
         }

         if (token.kind === 'sprite') {
            const sprite = this.assets.inlineSprites[token.name];
            if (!sprite) return;
            const size = sizePx * L.inlineSpriteScale;
            if (width + size > widthPx && width > 0) flush();
            segments.push({ kind: 'sprite', sprite, w: size, h: size });
            width += size;
            hasContent = true;
            return;
         }

         const text = token.text ?? '';
         const blank = !text.trim();
         if (!hasContent && blank) return;

         applyFont(ctx, style, sizePx, token);
         const w = ctx.measureText(text).width;
         if (width + w > widthPx && width > 0) {
            flush();
            if (blank) return;
         }

         segments.push({ kind: 'text', text, color: token.color, italic: token.italic, bold: token.bold, w });
         width += w;
         hasContent = true;
      });

      if (segments.length || !lines.length) flush();

      return {
         lines,
         style,
         sizePx,
         lineHeight,
         ascent,
         widthPx,
         height: (lines.length - 1) * lineHeight + ascent + descent,
         centerOffset: (-(metrics.ascent - metrics.descent) * sizePx) / 2,
      };
   }

   drawRichTextBlock(ctx, block, leftPx, topPx) {
      let baseline = topPx + block.ascent;
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      block.lines.forEach((line) => {
         let x = leftPx + (block.widthPx - line.width) / 2;
         const centerY = baseline + block.centerOffset;
         line.segments.forEach((segment) => {
            if (segment.kind === 'sprite') {
               this.drawSprite(ctx, segment.sprite, { x, y: centerY - segment.h / 2, w: segment.w, h: segment.h });
            } else {
               applyFont(ctx, block.style, block.sizePx, segment);
               ctx.fillStyle = segment.color;
               ctx.fillText(segment.text, x, baseline);
            }
            x += segment.w;
         });
         baseline += block.lineHeight;
      });
      ctx.restore();
   }

   drawSprite(ctx, sprite, dest, tint = null, composite = 'source-over') {
      if (dest.w <= 0 || dest.h <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = composite;
      ctx.imageSmoothingQuality = 'high';
      if (!tint) {
         ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, dest.x, dest.y, dest.w, dest.h);
      } else {
         const w = Math.ceil(dest.w);
         const h = Math.ceil(dest.h);
         const scratch = this.scratch;
         if (scratch.width < w || scratch.height < h) {
            scratch.width = Math.max(scratch.width, w);
            scratch.height = Math.max(scratch.height, h);
         }
         const [r, g, b, a] = parseColor(tint);
         const sctx = scratch.getContext('2d');
         sctx.save();
         sctx.clearRect(0, 0, scratch.width, scratch.height);
         sctx.imageSmoothingQuality = 'high';
         sctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, dest.w, dest.h);
         sctx.globalCompositeOperation = 'multiply';
         sctx.fillStyle = `rgb(${r},${g},${b})`;
         sctx.fillRect(0, 0, w, h);
         sctx.globalCompositeOperation = 'destination-in';
         sctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, dest.w, dest.h);
         sctx.restore();
         ctx.globalAlpha = a;
         ctx.drawImage(scratch, 0, 0, w, h, dest.x, dest.y, w, h);
      }
      ctx.restore();
   }
}

function applyFont(ctx, style, sizePx, variant = {}) {
   const weight = variant.bold ? Math.min(900, style.weight + 200) : style.weight;
   ctx.font = `${variant.italic ? 'italic ' : ''}${weight} ${sizePx}px "${style.family}"`;
   ctx.fontVariantCaps = style.smallCaps ? 'small-caps' : 'normal';
   if ('letterSpacing' in ctx) ctx.letterSpacing = `${(style.charSpacingEm ?? 0) * sizePx}px`;
   ctx.textAlign = 'left';
   ctx.textBaseline = 'alphabetic';
}

function drawStyledText(ctx, text, style, sizePx, x, baseline, width) {
   ctx.save();
   applyFont(ctx, style, sizePx);
   ctx.lineJoin = 'round';
   ctx.lineCap = 'round';

   if (style.underlay) {
      const underlay = style.underlay;
      ctx.save();
      ctx.shadowColor = underlay.color;
      ctx.shadowBlur = underlay.softnessEm * sizePx * 2;
      ctx.shadowOffsetX = SHADOW_SHIFT;
      ctx.shadowOffsetY = underlay.offsetEm * sizePx;
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#000';
      ctx.fillText(text, x - SHADOW_SHIFT, baseline);
      const dilate = ((style.outlineEm ?? 0) + underlay.dilateEm) * sizePx * 2;
      if (dilate > 0) {
         ctx.lineWidth = dilate;
         ctx.strokeText(text, x - SHADOW_SHIFT, baseline);
      }
      ctx.restore();
   }

   if (style.outlineEm > 0) {
      ctx.strokeStyle = style.outlineColor;
      ctx.lineWidth = style.outlineEm * sizePx * 2;
      ctx.strokeText(text, x, baseline);
   }

   if (style.gradientLeft) {
      const gradient = ctx.createLinearGradient(x, baseline, x + width, baseline);
      gradient.addColorStop(0, style.gradientLeft);
      gradient.addColorStop(1, style.color);
      ctx.fillStyle = gradient;
   } else {
      ctx.fillStyle = style.color;
   }
   ctx.fillText(text, x, baseline);

   if (style.innerOutlineEm > 0) {
      ctx.strokeStyle = style.outlineColor;
      ctx.lineWidth = style.innerOutlineEm * sizePx * 2;
      ctx.strokeText(text, x, baseline);
   }

   ctx.restore();
}

function parseColor(color) {
   const parts = color.match(/[\d.]+/g).map(Number);
   return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
}

function fitPreservingAspect(r, spriteWidth, spriteHeight, pivotX, pivotY) {
   const spriteRatio = spriteWidth / spriteHeight;
   const rectRatio = r.w / r.h;
   const fitted = { ...r };
   if (spriteRatio > rectRatio) {
      const height = r.w / spriteRatio;
      fitted.y += (r.h - height) * pivotY;
      fitted.h = height;
   } else {
      const width = r.h * spriteRatio;
      fitted.x += (r.w - width) * pivotX;
      fitted.w = width;
   }
   return fitted;
}

function makeCanvas(width, height) {
   const canvas = document.createElement('canvas');
   canvas.width = Math.max(1, Math.ceil(width));
   canvas.height = Math.max(1, Math.ceil(height));
   return canvas;
}
