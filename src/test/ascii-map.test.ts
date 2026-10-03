import { describe, expect, it } from "vitest";
import {
  ASCII_RAMP,
  type AsciiSample,
  asciiSample,
  asciiSurface,
  DEFAULT_TONE,
  luminance,
  toAsciiArt,
  toneForZoom,
} from "@/lib/ascii-map";

const COLORS = { color: "#000000", background: "#ffffff" };

function fill(pixels: Uint8ClampedArray, red: number, green: number, blue: number, alpha = 255) {
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = red;
    pixels[index + 1] = green;
    pixels[index + 2] = blue;
    pixels[index + 3] = alpha;
  }
  return pixels;
}

function paintBlock(
  pixels: Uint8ClampedArray,
  sample: AsciiSample,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  red: number,
  green: number,
  blue: number,
) {
  for (let y = fromY; y < toY; y += 1) {
    for (let x = fromX; x < toX; x += 1) {
      const index = (y * sample.width + x) * 4;
      pixels[index] = red;
      pixels[index + 1] = green;
      pixels[index + 2] = blue;
      pixels[index + 3] = 255;
    }
  }
  return pixels;
}

describe("ascii-kaart", () => {
  it("bouwt een raster met een even aantal kolommen en 2:1 cellen", () => {
    const surface = asciiSurface(600, 400, 2, COLORS);

    expect(surface.width).toBe(1200);
    expect(surface.height).toBe(800);
    expect(surface.columns % 2).toBe(0);
    // Whole rows mean the aspect is approximate, but stays close to 2:1.
    expect(surface.cellWidth / surface.cellHeight).toBeCloseTo(0.5, 1);
  });

  it("houdt de buffergrootte in verhouding met het raster", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);

    expect(sample.width).toBe(surface.columns * sample.sub);
    expect(sample.height % sample.sub).toBe(0);
    expect(sample.width / sample.height).toBeCloseTo(surface.width / surface.height, 1);
  });

  it("laat doorzichtige cellen leeg zodat de globe-silhouet behouden blijft", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);
    const art = toAsciiArt(new Uint8ClampedArray(sample.width * sample.height * 4), sample, 24, 16);

    expect(art).toHaveLength(16);
    expect(art.every((line) => line === " ".repeat(24))).toBe(true);
  });

  it("zet donkere pixels op een dichter teken dan lichte pixels", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);

    const dark = fill(new Uint8ClampedArray(sample.width * sample.height * 4), 0, 0, 0);
    const light = fill(new Uint8ClampedArray(sample.width * sample.height * 4), 250, 250, 250);

    const darkArt = toAsciiArt(dark, sample, surface.columns, surface.rows, DEFAULT_TONE);
    const lightArt = toAsciiArt(light, sample, surface.columns, surface.rows, DEFAULT_TONE);

    // A uniform frame collapses to a single glyph: black is fully inked, paper is faint.
    expect(new Set(darkArt.join(""))).toEqual(new Set([ASCII_RAMP.at(-1)]));
    expect(lightArt.every((line) => line === lightArt[0])).toBe(true);
    expect(ASCII_RAMP.indexOf(lightArt[0])).toBeLessThan(ASCII_RAMP.length / 2);
  });

  it("neemt alleen het donkerste sample per cel zodat dunne lijnen blijven", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);
    const flat = toAsciiArt(
      fill(new Uint8ClampedArray(sample.width * sample.height * 4), 255, 255, 255),
      sample,
      surface.columns,
      surface.rows,
      DEFAULT_TONE,
    );

    const pixels = fill(new Uint8ClampedArray(sample.width * sample.height * 4), 255, 255, 255);
    // A single dark sample pixel inside the first cell block must change that cell.
    paintBlock(pixels, sample, 0, 0, 1, 1, 0, 0, 0);
    const speckled = toAsciiArt(pixels, sample, surface.columns, surface.rows, DEFAULT_TONE);

    expect(speckled[0][0]).not.toBe(flat[0][0]);
    expect(speckled[0][0]).not.toBe(" ");
  });

  it("berekent luminantie van zwart tot wit", () => {
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 5);
    expect(luminance(255, 0, 0)).toBeCloseTo(0.299, 3);
  });

  it("scheidt een grijs straatbeeld in twee tinten", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);

    // A pale street-level frame: light buildings crossed by mid-grey roads.
    const street = fill(new Uint8ClampedArray(sample.width * sample.height * 4), 228, 228, 228);
    paintBlock(street, sample, 0, 0, sample.width, sample.height / 2, 150, 150, 150);
    const art = toAsciiArt(street, sample, surface.columns, surface.rows, DEFAULT_TONE);

    // Both halves must land on a different glyph, so roads read against buildings.
    // The top half is the darker grey band, the bottom half the pale background.
    expect(art[0][0]).not.toBe(art[art.length - 1][0]);
    expect(ASCII_RAMP.indexOf(art[0][0])).toBeGreaterThan(
      ASCII_RAMP.indexOf(art[art.length - 1][0]),
    );
  });

  it("houdt het papier leeg en gebruikt het hoge uiteinde als ondergrens", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);

    const glyphFor = (grey: number, tone?: Parameters<typeof toAsciiArt>[4]) => {
      const pixels = fill(
        new Uint8ClampedArray(sample.width * sample.height * 4),
        grey,
        grey,
        grey,
      );
      return toAsciiArt(pixels, sample, surface.columns, surface.rows, tone)[0][0];
    };

    // A frame lighter than the given top end lifts the window, so its paper stays blank.
    expect(ASCII_RAMP.indexOf(glyphFor(245, { low: 0.45, high: 0.95, gamma: 0.75 }))).toBe(0);

    // A frame darker than that top end keeps the given value, so it takes ink.
    expect(
      ASCII_RAMP.indexOf(glyphFor(200, { low: 0.45, high: 0.95, gamma: 0.75 })),
    ).toBeGreaterThan(0);
  });

  it("laat één witte cel het toonvenster niet naar beneden trekken", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);
    const pixels = fill(new Uint8ClampedArray(sample.width * sample.height * 4), 242, 242, 242);
    // A single blown-white cell, as a road casing produces, must not ink the paper around it.
    paintBlock(pixels, sample, 0, 0, sample.sub, sample.height / surface.rows, 255, 255, 255);

    const art = toAsciiArt(pixels, sample, surface.columns, surface.rows, toneForZoom(16.5));

    expect(art[surface.rows - 1].trim()).toBe("");
    expect(ASCII_RAMP.indexOf(art[0][0])).toBe(0);
  });

  it("maakt gebouwvlakken op straatzoom zichtbaar tegen leeg papier", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);
    // Pale paper with a band of building grey on the upper half.
    const pixels = fill(new Uint8ClampedArray(sample.width * sample.height * 4), 242, 242, 242);
    paintBlock(pixels, sample, 0, 0, sample.width, Math.floor(sample.height / 2), 200, 200, 200);

    const art = toAsciiArt(pixels, sample, surface.columns, surface.rows, toneForZoom(16.5));
    const paper = ASCII_RAMP.indexOf(art[surface.rows - 1][0]);
    const buildings = ASCII_RAMP.indexOf(art[0][0]);

    expect(paper).toBe(0);
    expect(buildings).toBeGreaterThanOrEqual(3);
  });

  it("houdt het wereldbeeld op hetzelfde toonvenster als voorheen", () => {
    expect(toneForZoom(1.35).low).toBe(0.45);
    expect(toneForZoom(0).low).toBe(0.45);
  });

  it("schuift op straatzoom naar het papier en stopt daarna", () => {
    expect(toneForZoom(13).low).toBe(0.73);
    expect(toneForZoom(13).high).toBe(0.95);
    expect(toneForZoom(19).low).toBe(0.73);
  });

  it("laat het toonvenster monotoon naar het papier schuiven", () => {
    expect(toneForZoom(9).low).toBeGreaterThan(toneForZoom(6).low);
    expect(toneForZoom(9).low).toBeLessThan(toneForZoom(13).low);
  });

  it("leest een straatframe met het hoge uiteinde als papier en zet donkere cellen dik in", () => {
    const surface = asciiSurface(600, 400, 1, COLORS);
    const sample = asciiSample(surface);
    const tone = toneForZoom(13);
    const paperGrey = Math.round(tone.high * 255);

    // Every cell sits on the high end of the street window, so the frame stays blank.
    const paper = fill(
      new Uint8ClampedArray(sample.width * sample.height * 4),
      paperGrey,
      paperGrey,
      paperGrey,
    );
    const blank = toAsciiArt(paper, sample, surface.columns, surface.rows, tone);

    expect(blank.every((line) => line === " ".repeat(surface.columns))).toBe(true);

    // A single darker cell inside the frame must still take a dense glyph.
    const inked = fill(
      new Uint8ClampedArray(sample.width * sample.height * 4),
      paperGrey,
      paperGrey,
      paperGrey,
    );
    paintBlock(inked, sample, 0, 0, sample.sub, sample.sub, 120, 120, 120);
    const art = toAsciiArt(inked, sample, surface.columns, surface.rows, tone);

    expect(ASCII_RAMP.indexOf(art[0][0])).toBeGreaterThanOrEqual(ASCII_RAMP.indexOf("#"));
  });
});
