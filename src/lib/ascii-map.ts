/**
 * Converts the rendered WebGL frame of the map into a grid of characters and paints
 * that grid onto a plain 2D canvas, so the map reads as ASCII art.
 */

/** Ordered from "no ink" to "full ink"; darker source pixels get denser glyphs. */
export const ASCII_RAMP = " .:-=+*#%@";

export const MONOSPACE_STACK =
  'ui-monospace, "SFMono-Regular", Menlo, Consolas, "DejaVu Sans Mono", monospace';

/** Cell width in CSS pixels. Characters are roughly twice as tall as they are wide. */
const CELL_WIDTH_CSS = 6;
const CELL_ASPECT = 2;
/** Sub-samples read per character cell horizontally; vertically this is doubled. */
const SUB_SAMPLES = 3;
const REFERENCE_FONT_SIZE = 100;
/** Share of the opaque frame that has to sit below the window's light end. */
const PAPER_QUANTILE = 0.9;
/** Resolution of the histogram that finds that light end. */
const TONE_BINS = 64;

export type AsciiTone = {
  /** Luminance mapped to a full glyph; everything at or below it is solid ink. */
  low: number;
  /** Luminance mapped to a blank cell; everything at or above it stays paper. */
  high: number;
  /** Contrast curve applied to the normalized luminance. */
  gamma: number;
};

/**
 * Tone mapping for the light "positron" basemap. Its land and water are both pale
 * while roads, text and buildings are grey to near-black, so the window is widened
 * downwards and `high` is left to `resolveTone`, which anchors it to the frame.
 */
export const DEFAULT_TONE: AsciiTone = { low: 0.45, high: 0.97, gamma: 0.75 };

/**
 * Tone window per zoom level. A world view needs a wide window because its frame is
 * pale paper plus near-black coastlines, while a street view only carries pale-grey
 * line work and therefore needs a narrower window aimed higher, towards paper, so
 * building outlines and roads stop collapsing into the same glyph. The low end runs
 * from zoom 6 (world) to zoom 13 (street) and stays put beyond that.
 */
export function toneForZoom(zoom: number): AsciiTone {
  const street = Math.min(1, Math.max(0, (zoom - 6) / 7));
  return { low: 0.45 + street * 0.28, high: 0.95, gamma: 0.75 };
}

export type AsciiSurface = {
  /** Backing store size of the target canvas. */
  width: number;
  height: number;
  /** Character grid resolution. */
  columns: number;
  rows: number;
  /** Cell size in backing store pixels. */
  cellWidth: number;
  cellHeight: number;
  color: string;
  background: string;
};

export type AsciiSample = {
  width: number;
  height: number;
  /** Horizontal sample count per character cell. */
  sub: number;
};

/**
 * Builds the character grid for a canvas of `cssWidth` x `cssHeight` at `ratio`
 * device pixels per CSS pixel. Cells keep a 2:1 height-to-width ratio so the glyphs
 * are not stretched, and the grid always has an even number of columns.
 */
export function asciiSurface(
  cssWidth: number,
  cssHeight: number,
  ratio: number,
  colors: { color: string; background: string },
): AsciiSurface {
  const width = Math.max(1, Math.round(cssWidth * ratio));
  const height = Math.max(1, Math.round(cssHeight * ratio));

  let columns = Math.max(24, Math.round(cssWidth / CELL_WIDTH_CSS));
  if (columns % 2 === 1) columns += 1;
  const rows = Math.max(12, Math.round((columns * height) / (width * CELL_ASPECT)));

  return {
    width,
    height,
    columns,
    rows,
    cellWidth: width / columns,
    cellHeight: height / rows,
    ...colors,
  };
}

/**
 * Size of the downscaled buffer the frame is sampled into. Every character cell owns
 * a `sub` x `2 * sub` block, which preserves the canvas aspect ratio while sampling
 * finer than one pixel per cell.
 */
export function asciiSample(surface: AsciiSurface): AsciiSample {
  return {
    width: surface.columns * SUB_SAMPLES,
    height: surface.rows * SUB_SAMPLES * CELL_ASPECT,
    sub: SUB_SAMPLES,
  };
}

/** Relative luminance of an RGB triple, 0 (black) to 1 (white). */
export function luminance(red: number, green: number, blue: number) {
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
}

/**
 * Turns RGBA pixels into one string of characters per grid row. A cell keeps the
 * darkest sample in its block so thin features such as roads survive the conversion,
 * and transparent cells stay blank so the globe keeps its silhouette against space.
 */
export function toAsciiArt(
  pixels: Uint8ClampedArray | Uint8Array,
  sample: AsciiSample,
  columns: number,
  rows: number,
  tone?: Partial<AsciiTone>,
): string[] {
  const { width: sampleWidth, height: sampleHeight, sub } = sample;
  const blockHeight = sampleHeight / rows;
  const lastIndex = ASCII_RAMP.length - 1;

  // First pass: the darkest luminance per cell, kept so the second pass can map it.
  const cellLuminance = new Float32Array(columns * rows);
  const cellOpaque = new Uint8Array(columns * rows);

  for (let row = 0; row < rows; row += 1) {
    const startY = row * blockHeight;
    const endY = Math.min(sampleHeight, startY + blockHeight);

    for (let column = 0; column < columns; column += 1) {
      const startX = column * sub;
      let darkest = 1;
      let opaque = false;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < startX + sub; x += 1) {
          const index = (y * sampleWidth + x) * 4;
          if (pixels[index + 3] < 128) continue;
          opaque = true;
          const value = luminance(pixels[index], pixels[index + 1], pixels[index + 2]);
          if (value < darkest) darkest = value;
        }
      }

      const cell = row * columns + column;
      cellOpaque[cell] = opaque ? 1 : 0;
      cellLuminance[cell] = darkest;
    }
  }

  const resolved = resolveTone(cellLuminance, cellOpaque, tone);
  const span = resolved.high - resolved.low || 1;
  const art: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    let line = "";

    for (let column = 0; column < columns; column += 1) {
      const cell = row * columns + column;
      if (!cellOpaque[cell]) {
        line += " ";
        continue;
      }

      const normalized = Math.min(1, Math.max(0, (cellLuminance[cell] - resolved.low) / span));
      const ink = (1 - normalized) ** resolved.gamma;
      line += ASCII_RAMP[Math.round(ink * lastIndex)];
    }

    art.push(line);
  }

  return art;
}

/**
 * Light value that most of the frame shares: the paper the map is drawn on. It is read as a
 * high quantile of the opaque cells rather than the single lightest one, because transparent
 * space around the globe and blown-white road casings would otherwise lift the top of the
 * window to pure white and ink every other cell.
 */
function paperLevel(cellLuminance: Float32Array, cellOpaque: Uint8Array) {
  const histogram = new Uint32Array(TONE_BINS);
  let opaque = 0;

  for (let cell = 0; cell < cellLuminance.length; cell += 1) {
    if (!cellOpaque[cell]) continue;
    opaque += 1;
    histogram[Math.min(TONE_BINS - 1, Math.floor(cellLuminance[cell] * TONE_BINS))] += 1;
  }

  if (opaque === 0) return 1;

  const target = opaque * PAPER_QUANTILE;
  let seen = 0;

  for (let bin = 0; bin < TONE_BINS; bin += 1) {
    seen += histogram[bin];
    if (seen >= target) return (bin + 1) / TONE_BINS;
  }

  return 1;
}

/**
 * Picks the tone window from the frame itself. `low` is the caller's; `high` is this frame's
 * paper level, so the paper stays blank at every zoom while everything darker spreads over
 * the rest of the ramp. The caller's `high` acts as a floor for frames without a light end.
 */
function resolveTone(
  cellLuminance: Float32Array,
  cellOpaque: Uint8Array,
  tone?: Partial<AsciiTone>,
): AsciiTone {
  const override = { ...DEFAULT_TONE, ...tone };

  return {
    low: override.low,
    high: Math.max(override.high, paperLevel(cellLuminance, cellOpaque)),
    gamma: override.gamma,
  };
}

/**
 * Picks a font size whose glyph advance is exactly one cell wide, so every row of
 * characters stays on the grid instead of drifting across the canvas.
 */
export function asciiFontSize(context: CanvasRenderingContext2D, cellWidth: number) {
  context.save();
  context.font = `${REFERENCE_FONT_SIZE}px ${MONOSPACE_STACK}`;
  const advance = context.measureText("M").width;
  context.restore();
  return advance > 0 ? (REFERENCE_FONT_SIZE * cellWidth) / advance : REFERENCE_FONT_SIZE;
}

/** Paints already converted ASCII art onto the target canvas. */
export function drawAsciiArt(
  context: CanvasRenderingContext2D,
  art: string[],
  surface: AsciiSurface,
) {
  context.save();
  context.fillStyle = surface.background;
  context.fillRect(0, 0, surface.width, surface.height);
  context.fillStyle = surface.color;
  context.font = `${asciiFontSize(context, surface.cellWidth)}px ${MONOSPACE_STACK}`;
  context.textAlign = "left";
  context.textBaseline = "top";

  for (let row = 0; row < art.length && row < surface.rows; row += 1) {
    context.fillText(art[row], 0, row * surface.cellHeight);
  }

  context.restore();
}
