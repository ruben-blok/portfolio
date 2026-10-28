import type { ReactNode } from "react";
import type { Project } from "@/data/projects";

function PlateFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.35"
        vectorEffect="non-scaling-stroke"
      >
        <path d="M16 24v-8h8" />
        <path d="M296 16h8v8" />
        <path d="M304 156v8h-8" />
        <path d="M24 164h-8v-8" />
      </g>
      {children}
    </svg>
  );
}

function Topography() {
  return (
    <g
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    >
      <path
        d="M54 112c6-30 40-54 80-52 38 2 72 24 80 50 8 26-18 46-52 48-36 2-70-4-90-18-12-8-22-16-18-28Z"
        strokeOpacity="0.45"
      />
      <path
        d="M80 108c6-22 32-38 60-36 28 2 52 18 56 38 4 20-16 32-42 33-28 1-52-4-66-14-8-6-12-12-8-21Z"
        strokeOpacity="0.6"
      />
      <path
        d="M106 104c5-14 20-24 38-23 18 1 32 12 34 24 2 12-10 20-26 21-18 1-32-3-40-10-4-4-8-7-6-12Z"
        strokeOpacity="0.8"
      />
      <circle cx="168" cy="94" r="46" strokeDasharray="3 5" strokeOpacity="0.55" />
      <path d="M168 84l9 10-9 10-9-10Z" fill="currentColor" stroke="none" />
    </g>
  );
}

const satelliteCells = new Set(["2-1", "3-1", "4-1", "2-2", "5-3", "6-3", "7-2", "8-2", "8-3"]);

function SatelliteGrid() {
  const cells: ReactNode[] = [];

  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 12; column += 1) {
      const key = `${column}-${row}`;
      const isFilled = satelliteCells.has(key);

      cells.push(
        <rect
          key={key}
          x={40 + column * 20}
          y={30 + row * 20}
          width="20"
          height="20"
          stroke="currentColor"
          strokeOpacity="0.25"
          fill={isFilled ? "currentColor" : "none"}
          fillOpacity={isFilled ? 0.14 : 0}
        />,
      );
    }
  }

  return (
    <g>
      {cells}
      <path
        d="M150 30c-12 34 14 56 0 120"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 5"
        strokeOpacity="0.8"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x="200"
        y="70"
        width="20"
        height="20"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M210 74l4 6-4 6-4-6Z" fill="currentColor" />
    </g>
  );
}

function FloorPlan() {
  return (
    <g
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M40 40h190M260 40h20M280 40v100M280 140h-20M260 140H90M60 140H40M40 140V40" />
      <path d="M40 90h50M110 90h170" />
      <path d="M150 40v25M150 85v55" />
      <path d="M90 90v20" strokeOpacity="0.6" />
      <path d="M90 110a20 20 0 0 1 20-20" strokeOpacity="0.6" />
      <path d="M150 65h-18" strokeOpacity="0.6" />
      <path d="M132 65a18 18 0 0 0 18 18" strokeOpacity="0.6" />
      <path d="M75 140V100H100V75H165V55H245V40" strokeDasharray="4 4" strokeOpacity="0.9" />
      <circle cx="75" cy="100" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="100" cy="75" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="165" cy="55" r="2.5" fill="currentColor" stroke="none" />
      <path d="M245 36l4 4-4 4-4-4Z" fill="currentColor" stroke="none" />
    </g>
  );
}

const timetableSlots = new Set(["1-1", "2-2", "3-1", "4-2"]);
const TIMETABLE_X = 40;
const TIMETABLE_Y = 40;
const TIMETABLE_CELL_WIDTH = 48;
const TIMETABLE_CELL_HEIGHT = 27;
const TIMETABLE_COLUMNS = 5;
const TIMETABLE_ROWS = 4;

function Timetable() {
  const gridWidth = TIMETABLE_CELL_WIDTH * TIMETABLE_COLUMNS;
  const gridHeight = TIMETABLE_CELL_HEIGHT * TIMETABLE_ROWS;
  const columnPositions = Array.from(
    { length: TIMETABLE_COLUMNS + 1 },
    (_, index) => TIMETABLE_X + index * TIMETABLE_CELL_WIDTH,
  );
  const rowPositions = Array.from(
    { length: TIMETABLE_ROWS + 1 },
    (_, index) => TIMETABLE_Y + index * TIMETABLE_CELL_HEIGHT,
  );

  return (
    <g stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
      <rect
        x={TIMETABLE_X}
        y={TIMETABLE_Y}
        width={gridWidth}
        height={TIMETABLE_CELL_HEIGHT}
        fill="currentColor"
        fillOpacity="0.08"
        strokeOpacity="0.35"
      />
      {columnPositions.map((x) => (
        <path key={x} d={`M${x} ${TIMETABLE_Y}v${gridHeight}`} strokeOpacity="0.25" />
      ))}
      {rowPositions.map((y) => (
        <path key={y} d={`M${TIMETABLE_X} ${y}h${gridWidth}`} strokeOpacity="0.25" />
      ))}
      {[...timetableSlots].map((slot) => {
        const [column, row] = slot.split("-").map(Number);

        return (
          <rect
            key={slot}
            x={TIMETABLE_X + column * TIMETABLE_CELL_WIDTH + 3}
            y={TIMETABLE_Y + (row + 1) * TIMETABLE_CELL_HEIGHT + 3}
            width={TIMETABLE_CELL_WIDTH - 6}
            height={TIMETABLE_CELL_HEIGHT - 6}
            fill="currentColor"
            fillOpacity="0.16"
          />
        );
      })}
      <rect
        x={TIMETABLE_X + 3 * TIMETABLE_CELL_WIDTH + 3}
        y={TIMETABLE_Y + 2 * TIMETABLE_CELL_HEIGHT + 3}
        width={TIMETABLE_CELL_WIDTH - 6}
        height={TIMETABLE_CELL_HEIGHT - 6}
        strokeDasharray="3 3"
      />
    </g>
  );
}

function Fallback() {
  return (
    <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" vectorEffect="non-scaling-stroke">
      <path d="M60 60h200v80H60z" />
      <path d="M60 100h200M160 60v80" />
      <path d="M160 80l10 10-10 10-10-10Z" fill="currentColor" stroke="none" />
    </g>
  );
}

const plates: Record<string, ReactNode> = {
  urbexium: <Topography />,
  urbexbench: <SatelliteGrid />,
  "escape-room": <FloorPlan />,
  ouderavond: <Timetable />,
};

export function ProjectPlate({ project }: { project: Project }) {
  return (
    <div
      aria-hidden="true"
      className="aspect-[16/9] w-full overflow-hidden border border-forest/25 bg-chalk text-forest transition-[border-color] duration-200 ease-settle group-hover:border-forest/50 group-focus-within:border-forest/50 motion-reduce:transition-none"
    >
      <PlateFrame>{plates[project.id] ?? <Fallback />}</PlateFrame>
    </div>
  );
}
