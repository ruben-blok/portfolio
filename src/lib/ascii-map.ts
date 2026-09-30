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

export type AsciiTone = {
  /** Luminance treated as "no ink". */
  low: number;
  /** Luminance treated as "full ink". */
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

  const resolved = resolveTone(cellLuminance, tone);
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
 * Picks the tone window from the frame itself. A world view is mostly pale land plus a
 * few near-black coastlines, while a street view is pale buildings crossed by grey
 * roads, so a fixed window either clips the globe or blanks the street map. Anchoring
 * the window to the observed luminance range keeps both readable.
 */
function resolveTone(cellLuminance: Float32Array, tone?: Partial<AsciiTone>): AsciiTone {
  const override = { ...DEFAULT_TONE, ...tone };
  if (tone?.low !== undefined || tone?.high !== undefined) return override;

  let lightest = 0;
  for (const value of cellLuminance) {
    if (value > lightest) lightest = value;
  }

  return {
    low: override.low,
    high: Math.max(override.high, lightest),
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
