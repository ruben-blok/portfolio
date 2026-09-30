import { describe, expect, it } from "vitest";
import {
  DEFAULT_LABEL_METRICS,
  LABEL_RULES,
  LABELLED_LAYERS,
  type LabelFeature,
  labelText,
  toLabels,
} from "@/lib/map-labels";

const VIEWPORT = { zoom: 4, maxLabels: 20, width: 600, height: 400 };

function feature(
  layer: string,
  name: string,
  coordinates: [number, number] = [0, 0],
): LabelFeature {
  return {
    layer: { id: layer },
    properties: { name },
    geometry: { type: "Point", coordinates },
  } as unknown as LabelFeature;
}

/** Projects longitude/latitude onto a fixed spot so collisions are easy to reason about. */
const project = ([longitude]: [number, number]) => ({ x: 300 + longitude * 100, y: 200 });

describe("kaartlabels", () => {
  it("leest alleen namen uit lagen die als label zijn aangemerkt", () => {
    expect(LABELLED_LAYERS).toContain("label_city");
    expect(LABELLED_LAYERS).toContain("highway-name-major");
    expect(LABELLED_LAYERS).not.toContain("building");
    expect(labelText(feature("label_city", "Rotterdam") as LabelFeature, "name")).toBe("Rotterdam");
    expect(labelText(feature("label_city", "  ") as LabelFeature, "name")).toBe("");
  });

  it("toont landen, steden en wegen als naam", () => {
    const labels = toLabels(
      [
        feature("label_country_1", "Duitsland", [-2, 51]),
        feature("label_city", "Rotterdam", [0, 52]),
        feature("highway-name-major", "A4", [1, 52]),
      ],
      project,
      { ...VIEWPORT, zoom: 13 },
    );

    // Ordered by rank: a country outranks a numbered road, which outranks a city.
    expect(labels.map((label) => label.text)).toEqual(["Duitsland", "A4", "Rotterdam"]);
  });

  it("verbergt labels die pas op een hoger zoomniveau verschijnen", () => {
    const villageRule = LABEL_RULES.find((rule) => rule.layer === "label_village");
    expect(villageRule).toBeDefined();

    const labels = toLabels([feature("label_village", "Kralingen")], project, {
      ...VIEWPORT,
      zoom: (villageRule?.minZoom ?? 9) - 0.1,
    });

    expect(labels).toHaveLength(0);
  });

  it("laat buitenbeeld liggende punten vallen", () => {
    const labels = toLabels(
      [feature("label_city", "Rotterdam", [0, 52]), feature("label_city", "Tokio", [99, 35])],
      project,
      VIEWPORT,
    );

    expect(labels.map((label) => label.text)).toEqual(["Rotterdam"]);
  });

  it("kiest de hoogste rang wanneer namen elkaar overlappen", () => {
    const labels = toLabels(
      [
        feature("label_city", "Rotterdam", [0, 52]),
        feature("label_country_1", "Nederland", [0.2, 52]),
      ],
      project,
      VIEWPORT,
    );

    expect(labels).toHaveLength(1);
    expect(labels[0].text).toBe("Nederland");
  });

  it("laat iedere naam maar een keer toe", () => {
    const labels = toLabels(
      [feature("label_city", "Rotterdam", [0, 52]), feature("label_city", "rotterdam", [0.3, 52])],
      project,
      VIEWPORT,
    );

    expect(labels).toHaveLength(1);
  });

  it("begrenst het aantal labels op straatniveau", () => {
    // Spread the candidates over the full viewport height so only the cap limits them.
    const labels = toLabels(
      Array.from({ length: 40 }, (_, index) =>
        feature("highway-name-path", `straat ${index}`, [0, index / 20]),
      ),
      ([, latitude]) => ({ x: 300, y: 200 + latitude * 100 }),
      { ...VIEWPORT, zoom: 18, maxLabels: 12 },
    );

    expect(labels).toHaveLength(12);
  });

  it("rekent met de gemeten tekstbreedte bij het vermijden van overlap", () => {
    const near = [
      feature("label_city", "Kort", [-0.4, 52]),
      feature("label_city", "HeelLangNaam", [0.4, 52]),
    ];

    // At the fallback advance width the two names still fit side by side.
    expect(toLabels(near, project, VIEWPORT)).toHaveLength(2);

    // A measuring callback that reports a huge width makes them overlap.
    expect(toLabels(near, project, { ...VIEWPORT, measure: () => 200 })).toHaveLength(1);
  });

  it("gebruikt een leesbare tekenmaat als er geen context is", () => {
    const labels = toLabels([feature("label_city", "Rotterdam")], project, VIEWPORT);
    expect(labels[0].x).toBeCloseTo(300);
    expect(DEFAULT_LABEL_METRICS.charWidth).toBeGreaterThan(0);
  });
});
