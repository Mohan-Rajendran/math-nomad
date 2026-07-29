"use client";

import { Math as KaTeXMath } from "./Math";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type Point = { x: number; y: number };
type Line = { first: Point; second: Point };
type Preset = "free" | "medieval" | "perigal" | "ferrarese";

type Shape = {
  a: number;
  b: number;
  epsilon: number;
  horizontal: number;
  origin: Point;
  vertexA: Point;
  vertexB: Point;
  u: Point;
  v: Point;
  bTileOffset: Point;
};

const DEFAULT_ANGLE = 30;
const PLANE = { minX: -2.25, minY: -1.62, width: 4.5, height: 3.24 };

const PRESET_COPY: Record<Preset, string> = {
  free: "Mahlo–MacMahon–Siddons continuous family",
  medieval: "Medieval corner · attributed to Thābit ibn Qurra, via al-Nayrīzī",
  perigal: "Perigal · symmetric five-piece dissection",
  ferrarese: "Symmetric twin · attributed to Giorgio Ferrarese",
};

const add = (first: Point, second: Point): Point => ({
  x: first.x + second.x,
  y: first.y + second.y,
});

const subtract = (first: Point, second: Point): Point => ({
  x: first.x - second.x,
  y: first.y - second.y,
});

const scale = (factor: number, point: Point): Point => ({
  x: factor * point.x,
  y: factor * point.y,
});

const translatePolygon = (polygon: Point[], offset: Point): Point[] =>
  polygon.map((point) => add(point, offset));

const points = (polygon: Point[]): string =>
  polygon.map((point) => `${point.x},${point.y}`).join(" ");

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

function shapeForAngle(angle: number, mirrored: boolean): Shape {
  const radians = (angle * Math.PI) / 180;
  const a = Math.cos(radians);
  const b = Math.sin(radians);
  const epsilon = mirrored ? 1 : -1;
  const horizontal = -epsilon;

  return {
    a,
    b,
    epsilon,
    horizontal,
    origin: { x: 0, y: 0 },
    vertexA: { x: horizontal * a, y: 0 },
    vertexB: { x: 0, y: b },
    u: { x: epsilon * a, y: b },
    v: { x: -epsilon * b, y: a },
    bTileOffset: {
      x: (epsilon * (a - b)) / 2,
      y: (a + b) / 2,
    },
  };
}

function square(center: Point, size: number): Point[] {
  const radius = size / 2;
  return [
    { x: center.x - radius, y: center.y - radius },
    { x: center.x + radius, y: center.y - radius },
    { x: center.x + radius, y: center.y + radius },
    { x: center.x - radius, y: center.y + radius },
  ];
}

function tileFamilies(shape: Shape, radius = 7): {
  aTiles: Point[][];
  bTiles: Point[][];
} {
  const aTiles: Point[][] = [];
  const bTiles: Point[][] = [];

  for (let row = -radius; row <= radius; row += 1) {
    for (let column = -radius; column <= radius; column += 1) {
      const centre = add(scale(row, shape.u), scale(column, shape.v));
      aTiles.push(square(centre, shape.a));
      bTiles.push(square(add(centre, shape.bTileOffset), shape.b));
    }
  }

  return { aTiles, bTiles };
}

function gridLines(
  anchor: Point,
  firstVector: Point,
  secondVector: Point,
  radius = 8,
): Line[] {
  const lines: Line[] = [];

  for (let index = -radius; index <= radius; index += 1) {
    const onSecond = add(anchor, scale(index, secondVector));
    lines.push({
      first: add(onSecond, scale(-radius, firstVector)),
      second: add(onSecond, scale(radius, firstVector)),
    });

    const onFirst = add(anchor, scale(index, firstVector));
    lines.push({
      first: add(onFirst, scale(-radius, secondVector)),
      second: add(onFirst, scale(radius, secondVector)),
    });
  }

  return lines;
}

function anchorForPreset(preset: Preset, shape: Shape): Point {
  if (preset === "medieval") {
    return { x: (shape.epsilon * shape.a) / 2, y: shape.a / 2 };
  }
  if (preset === "ferrarese") return shape.bTileOffset;
  return { x: 0, y: 0 };
}

function pointerPoint(event: PointerEvent<SVGSVGElement>): Point | null {
  const matrix = event.currentTarget.getScreenCTM();
  if (!matrix) return null;
  const point = event.currentTarget.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: -local.y };
}

function translatedLine(line: Line, offset: Point): Line {
  return {
    first: add(line.first, offset),
    second: add(line.second, offset),
  };
}

function TriangleDiagram({
  shape,
  angle,
  anchor,
}: {
  shape: Shape;
  angle: number;
  anchor: Point;
}) {
  const rawId = useId().replaceAll(":", "");
  const clipA = `${rawId}-square-a`;
  const clipB = `${rawId}-square-b`;
  const clipC = `${rawId}-square-c`;
  const { a, b, epsilon, horizontal, origin, vertexA, vertexB, u, v } = shape;
  const squareA = [origin, vertexA, { x: vertexA.x, y: -a }, { x: 0, y: -a }];
  const squareB = [origin, vertexB, { x: epsilon * b, y: b }, { x: epsilon * b, y: 0 }];
  const squareC = [vertexA, vertexB, add(vertexB, v), add(vertexA, v)];
  const grid = gridLines(anchor, u, v, 9);
  const tiles = tileFamilies(shape, 5);
  const offsetA = { x: (horizontal * a) / 2, y: -a / 2 };
  const offsetB = subtract(
    { x: (epsilon * b) / 2, y: b / 2 },
    shape.bTileOffset,
  );
  const offsetC = subtract(vertexA, anchor);
  const rightMarkSize = Math.min(a, b) * 0.13;
  const rightMark =
    epsilon < 0
      ? [
          { x: 0, y: rightMarkSize },
          { x: rightMarkSize, y: rightMarkSize },
          { x: rightMarkSize, y: 0 },
        ]
      : [
          { x: 0, y: rightMarkSize },
          { x: -rightMarkSize, y: rightMarkSize },
          { x: -rightMarkSize, y: 0 },
        ];

  return (
    <section className="mn-proof-panel" aria-labelledby="mn-proof-shape-heading">
      <div className="mn-proof-panel-heading">
        <div>
          <span>Shape</span>
          <h2 id="mn-proof-shape-heading">Right triangle and its squares</h2>
        </div>
        <strong>{angle.toFixed(1)}°</strong>
      </div>

      <svg
        className="mn-proof-triangle-svg"
        viewBox="-1.55 -1.72 3.1 3.16"
        role="img"
        aria-label={`Right triangle with smallest angle ${angle.toFixed(1)} degrees and squares on all three sides`}
      >
        <defs>
          <clipPath id={clipA}><polygon points={points(squareA)} /></clipPath>
          <clipPath id={clipB}><polygon points={points(squareB)} /></clipPath>
          <clipPath id={clipC}><polygon points={points(squareC)} /></clipPath>
        </defs>
        <g transform="scale(1 -1)">
          <polygon className="mn-proof-fill-a" points={points(squareA)} />
          <g className="mn-proof-grid" clipPath={`url(#${clipA})`}>
            {grid.map((line, index) => {
              const shifted = translatedLine(line, offsetA);
              return <line key={`a-${index}`} x1={shifted.first.x} y1={shifted.first.y} x2={shifted.second.x} y2={shifted.second.y} />;
            })}
          </g>

          <polygon className="mn-proof-fill-b" points={points(squareB)} />
          <g className="mn-proof-grid" clipPath={`url(#${clipB})`}>
            {grid.map((line, index) => {
              const shifted = translatedLine(line, offsetB);
              return <line key={`b-${index}`} x1={shifted.first.x} y1={shifted.first.y} x2={shifted.second.x} y2={shifted.second.y} />;
            })}
          </g>

          <g className="mn-proof-tiles" clipPath={`url(#${clipC})`}>
            {tiles.aTiles.map((polygon, index) => (
              <polygon className="mn-proof-tile-a" key={`copy-a-${index}`} points={points(translatePolygon(polygon, offsetC))} />
            ))}
            {tiles.bTiles.map((polygon, index) => (
              <polygon className="mn-proof-tile-b" key={`copy-b-${index}`} points={points(translatePolygon(polygon, offsetC))} />
            ))}
          </g>

          <polygon className="mn-proof-outline" points={points(squareA)} />
          <polygon className="mn-proof-outline" points={points(squareB)} />
          <polygon className="mn-proof-outline" points={points(squareC)} />
          <polygon className="mn-proof-triangle" points={points([origin, vertexA, vertexB])} />
          <polyline className="mn-proof-right-mark" points={points(rightMark)} />
        </g>
      </svg>
    </section>
  );
}

function PlaneDiagram({
  shape,
  anchor,
  preset,
  setPreset,
  setAnchor,
  onReset,
  onMirror,
  mirrored,
}: {
  shape: Shape;
  anchor: Point;
  preset: Preset;
  setPreset: (preset: Preset) => void;
  setAnchor: (anchor: Point) => void;
  onReset: () => void;
  onMirror: () => void;
  mirrored: boolean;
}) {
  const dragging = useRef(false);
  const tiles = useMemo(() => tileFamilies(shape, 7), [shape]);
  const grid = useMemo(
    () => gridLines(anchor, shape.u, shape.v, 10),
    [anchor, shape.u, shape.v],
  );

  function moveAnchor(event: PointerEvent<SVGSVGElement>) {
    const next = pointerPoint(event);
    if (!next) return;
    setPreset("free");
    setAnchor({
      x: clamp(next.x, PLANE.minX + 0.08, PLANE.minX + PLANE.width - 0.08),
      y: clamp(next.y, PLANE.minY + 0.08, PLANE.minY + PLANE.height - 0.08),
    });
  }

  function moveAnchorWithKeyboard(event: KeyboardEvent<SVGCircleElement>) {
    if (event.key === "Home") {
      event.preventDefault();
      onReset();
      return;
    }

    const step = event.shiftKey ? 0.12 : 0.035;
    const delta: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    const change = delta[event.key];
    if (!change) return;

    event.preventDefault();
    setPreset("free");
    const next = add(anchor, change);
    setAnchor({
      x: clamp(next.x, PLANE.minX + 0.08, PLANE.minX + PLANE.width - 0.08),
      y: clamp(next.y, PLANE.minY + 0.08, PLANE.minY + PLANE.height - 0.08),
    });
  }

  function choosePreset(event: ChangeEvent<HTMLSelectElement>) {
    const nextPreset = event.target.value as Preset;
    setPreset(nextPreset);
    if (nextPreset !== "free") setAnchor(anchorForPreset(nextPreset, shape));
  }

  return (
    <section className="mn-proof-panel" aria-labelledby="mn-proof-plane-heading">
      <div className="mn-proof-panel-heading">
        <div>
          <span>Dissection</span>
          <h2 id="mn-proof-plane-heading">Two tilings of the plane</h2>
        </div>
        <button className="mn-proof-chip" type="button" aria-pressed={mirrored} onClick={onMirror}>
          Mirror
        </button>
      </div>

      <div className="mn-proof-controls">
        <label>
          <span>Historical anchor</span>
          <select value={preset} onChange={choosePreset}>
            <option value="free">Free / continuous family</option>
            <option value="medieval">Medieval corner</option>
            <option value="perigal">Perigal</option>
            <option value="ferrarese">Ferrarese twin</option>
          </select>
        </label>
        <button type="button" onClick={onReset}>Reset</button>
      </div>

      <p className="mn-proof-attribution" aria-live="polite">{PRESET_COPY[preset]}</p>

      <svg
        className="mn-proof-plane-svg"
        viewBox={`${PLANE.minX} ${PLANE.minY} ${PLANE.width} ${PLANE.height}`}
        role="img"
        aria-label="Pastel Pythagorean tiling overlaid by a movable grid of hypotenuse squares"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragging.current = true;
          moveAnchor(event);
        }}
        onPointerMove={(event) => {
          if (dragging.current) moveAnchor(event);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <g transform="scale(1 -1)">
          <rect className="mn-proof-plane-background" x={PLANE.minX} y={PLANE.minY} width={PLANE.width} height={PLANE.height} />
          <g className="mn-proof-plane-tiles">
            {tiles.aTiles.map((polygon, index) => (
              <polygon className="mn-proof-tile-a" key={`plane-a-${index}`} points={points(polygon)} />
            ))}
            {tiles.bTiles.map((polygon, index) => (
              <polygon className="mn-proof-tile-b" key={`plane-b-${index}`} points={points(polygon)} />
            ))}
          </g>
          <g className="mn-proof-grid">
            {grid.map((line, index) => (
              <line key={`grid-${index}`} x1={line.first.x} y1={line.first.y} x2={line.second.x} y2={line.second.y} />
            ))}
          </g>
          <circle
            className="mn-proof-anchor-hit"
            cx={anchor.x}
            cy={anchor.y}
            r="0.18"
            tabIndex={0}
            role="button"
            aria-label="Movable square-grid anchor. Use the arrow keys to move it and Home to reset it."
            onKeyDown={moveAnchorWithKeyboard}
          />
          <circle className="mn-proof-anchor" cx={anchor.x} cy={anchor.y} r="0.074" aria-hidden="true" />
          <circle className="mn-proof-anchor-centre" cx={anchor.x} cy={anchor.y} r="0.023" aria-hidden="true" />
        </g>
      </svg>
      <p className="mn-proof-hint">Drag the small anchor to move continuously between dissections.</p>
    </section>
  );
}

export function PythagorasPreview() {
  const [angle, setAngle] = useState(DEFAULT_ANGLE);
  const [mirrored, setMirrored] = useState(false);
  const [preset, setPreset] = useState<Preset>("perigal");
  const [anchor, setAnchor] = useState<Point>({ x: 0, y: 0 });
  const shape = useMemo(() => shapeForAngle(angle, mirrored), [angle, mirrored]);

  function changeAngle(event: ChangeEvent<HTMLInputElement>) {
    const nextAngle = Number(event.target.value);
    const nextShape = shapeForAngle(nextAngle, mirrored);
    setAngle(nextAngle);
    if (preset !== "free") setAnchor(anchorForPreset(preset, nextShape));
  }

  function mirror() {
    const nextMirrored = !mirrored;
    const nextShape = shapeForAngle(angle, nextMirrored);
    setMirrored(nextMirrored);
    setAnchor(
      preset === "free"
        ? { x: -anchor.x, y: anchor.y }
        : anchorForPreset(preset, nextShape),
    );
  }

  function reset() {
    setPreset("perigal");
    setAnchor({ x: 0, y: 0 });
  }

  return (
    <div className="mn-pythagoras-preview">
      <div className="mn-proof-toolbar">
      <div className="mn-proof-equation" aria-label="a squared plus b squared equals c squared">
        <KaTeXMath tex="a^2+b^2=c^2" />
      </div>
        <label htmlFor="mn-proof-angle">
          <span>Smallest angle</span>
          <input
            id="mn-proof-angle"
            type="range"
            min="1"
            max="45"
            step="0.1"
            value={angle}
            onChange={changeAngle}
          />
          <output htmlFor="mn-proof-angle">{angle.toFixed(1)}°</output>
        </label>
      </div>

      <div className="mn-proof-stage">
        <TriangleDiagram shape={shape} angle={angle} anchor={anchor} />
        <PlaneDiagram
          shape={shape}
          anchor={anchor}
          preset={preset}
          setPreset={setPreset}
          setAnchor={setAnchor}
          onReset={reset}
          onMirror={mirror}
          mirrored={mirrored}
        />
      </div>
    </div>
  );
}
