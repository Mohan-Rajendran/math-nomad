"use client";

import { Math as KaTeXMath } from "./Math";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type Point = { x: number; y: number };
type Shape = { a: number; b: number };
type Regime = "acute" | "right" | "obtuse";

const DEFAULT_SHAPE: Shape = { a: 0.84, b: 0.73 };
const DEFAULT_ANCHOR: Point = { x: 0.16, y: 0.14 };
const PLANE = { minX: -2.3, minY: -1.8, width: 4.6, height: 3.6 };

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

const quarterTurn = (point: Point): Point => ({ x: -point.y, y: point.x });

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const points = (vertices: Point[]): string =>
  vertices.map(({ x, y }) => `${x},${y}`).join(" ");

function triangleGeometry({ a, b }: Shape) {
  const cosine = clamp((a * a + b * b - 1) / (2 * a * b), -1, 1);
  const sine = Math.sqrt(Math.max(0, 1 - cosine * cosine));
  const p = { x: a, y: 0 };
  const q = { x: b * cosine, y: b * sine };
  const d = subtract(p, q);
  const jp = quarterTurn(p);
  const jq = quarterTurn(q);
  const jd = quarterTurn(d);
  const angle = (Math.acos(cosine) * 180) / Math.PI;
  const regime: Regime =
    Math.abs(cosine) < 0.008 ? "right" : cosine > 0 ? "acute" : "obtuse";

  return { a, b, cosine, p, q, d, jp, jq, jd, angle, regime };
}

function keepInsideModuli(rawA: number, rawB: number): Shape {
  let a = clamp(rawA, 0.5, 1);
  let b = clamp(rawB, 0, 1);

  if (b > a) {
    const midpoint = (a + b) / 2;
    a = midpoint;
    b = midpoint;
  }

  const nondegenerateSum = 1.025;
  if (a + b < nondegenerateSum) {
    const correction = (nondegenerateSum - a - b) / 2;
    a += correction;
    b += correction;
  }

  a = clamp(a, 0.5125, 1);
  b = clamp(b, 0.0125, a);
  if (a + b < nondegenerateSum) b = nondegenerateSum - a;

  return { a, b };
}

function planeTiles(
  geometry: ReturnType<typeof triangleGeometry>,
  translation: Point = { x: 0, y: 0 },
  reach = 5,
) {
  const first: Point[][] = [];
  const second: Point[][] = [];
  const { p, q, d, jp, jq, jd } = geometry;

  for (let row = -reach; row <= reach; row += 1) {
    for (let column = -reach; column <= reach; column += 1) {
      const origin = add(add(scale(row, d), scale(column, jd)), translation);
      first.push([origin, add(origin, p), add(add(origin, p), jp), add(origin, jp)]);

      const secondOrigin = add(add(origin, p), jp);
      second.push([
        secondOrigin,
        subtract(secondOrigin, q),
        subtract(subtract(secondOrigin, q), jq),
        subtract(secondOrigin, jq),
      ]);
    }
  }

  return { first, second };
}

function gridLines(anchor: Point, d: Point, jd: Point, reach = 7) {
  const lines: { first: Point; second: Point }[] = [];

  for (let index = -reach; index <= reach; index += 1) {
    const alongD = add(anchor, scale(index, d));
    lines.push({
      first: add(alongD, scale(-reach, jd)),
      second: add(alongD, scale(reach, jd)),
    });

    const alongJd = add(anchor, scale(index, jd));
    lines.push({
      first: add(alongJd, scale(-reach, d)),
      second: add(alongJd, scale(reach, d)),
    });
  }

  return lines;
}

function moduliPoint(shape: Shape): Point {
  return { x: 70 + (shape.a - 0.5) * 520, y: 260 - shape.b * 220 };
}

function shapeFromModuliPoint(point: Point): Shape {
  return keepInsideModuli(
    0.5 + (point.x - 70) / 520,
    (260 - point.y) / 220,
  );
}

function pointerInSvg(event: PointerEvent<SVGSVGElement>): Point | null {
  const matrix = event.currentTarget.getScreenCTM();
  if (!matrix) return null;
  const point = event.currentTarget.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

function ModuliChamber({
  shape,
  setShape,
}: {
  shape: Shape;
  setShape: (shape: Shape) => void;
}) {
  const dragging = useRef(false);
  const rawId = useId().replaceAll(":", "");
  const rightLabelId = `${rawId}-right-curve`;
  const limitLabelId = `${rawId}-limit`;
  const current = moduliPoint(shape);
  const chamber = [
    moduliPoint({ a: 1, b: 1 }),
    moduliPoint({ a: 0.5, b: 0.5 }),
    moduliPoint({ a: 1, b: 0 }),
  ];
  const rightCurve = Array.from({ length: 42 }, (_, index) => {
    const a = Math.SQRT1_2 + ((1 - Math.SQRT1_2) * index) / 41;
    return moduliPoint({ a, b: Math.sqrt(Math.max(0, 1 - a * a)) });
  });
  const rightPath = rightCurve
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const angle = triangleGeometry(shape).angle;

  function update(event: PointerEvent<SVGSVGElement>) {
    const point = pointerInSvg(event);
    if (point) setShape(shapeFromModuliPoint(point));
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 0.035 : 0.012;
    const change: Record<string, Shape> = {
      ArrowLeft: { a: -step, b: 0 },
      ArrowRight: { a: step, b: 0 },
      ArrowUp: { a: 0, b: step },
      ArrowDown: { a: 0, b: -step },
    };
    if (event.key === "Home") {
      event.preventDefault();
      setShape(DEFAULT_SHAPE);
      return;
    }
    const delta = change[event.key];
    if (!delta) return;
    event.preventDefault();
    setShape(keepInsideModuli(shape.a + delta.a, shape.b + delta.b));
  }

  return (
    <section className="mn-cosine-panel" aria-labelledby="mn-cosine-moduli-heading">
      <div className="mn-cosine-heading">
        <div>
          <span>Shape space</span>
          <h2 id="mn-cosine-moduli-heading">Triangles up to similarity</h2>
        </div>
        <strong>{angle.toFixed(1)}°</strong>
      </div>

      <div className="mn-cosine-svg-wrap mn-cosine-moduli-wrap">
        <svg
          className="mn-cosine-moduli-svg"
          viewBox="0 0 400 300"
          role="img"
          aria-label="Moduli chamber of triangle shapes. Drag the point to change the triangle."
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragging.current = true;
            update(event);
          }}
          onPointerMove={(event) => {
            if (dragging.current) update(event);
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
          <defs>
            <path id={rightLabelId} d={rightPath} />
            <path
              id={limitLabelId}
              d={`M ${chamber[1].x + 18} ${chamber[1].y + 7} L ${chamber[2].x - 18} ${chamber[2].y - 7}`}
            />
          </defs>
          <polygon className="mn-cosine-moduli-region" points={points(chamber)} />
          <path className="mn-cosine-right-curve" d={rightPath} />
          <text className="mn-cosine-path-label">
            <textPath href={`#${rightLabelId}`} startOffset="50%" textAnchor="middle">
              right
            </textPath>
          </text>
          <text className="mn-cosine-path-label">
            <textPath href={`#${limitLabelId}`} startOffset="50%" textAnchor="middle">
              degenerate limit
            </textPath>
          </text>
          <text className="mn-cosine-equilateral" x={chamber[0].x} y={chamber[0].y - 15} textAnchor="middle">
            equilateral
          </text>
          <circle className="mn-cosine-halo" cx={current.x} cy={current.y} r="13" />
          <circle className="mn-cosine-moduli-point" cx={current.x} cy={current.y} r="6.5" />
        </svg>
        <button
          className="mn-cosine-native-handle"
          type="button"
          style={{ left: `${(current.x / 400) * 100}%`, top: `${(current.y / 300) * 100}%` }}
          aria-label={`Triangle shape: angle ${angle.toFixed(1)} degrees. Use arrow keys to move; Home resets.`}
          onKeyDown={moveWithKeyboard}
        />
      </div>

      <div className="mn-cosine-presets" aria-label="Triangle shape presets">
        <button type="button" onClick={() => setShape({ a: 0.84, b: 0.73 })}>Acute</button>
        <button type="button" onClick={() => setShape({ a: Math.sqrt(3) / 2, b: 0.5 })}>Right</button>
        <button type="button" onClick={() => setShape({ a: 0.72, b: 0.48 })}>Obtuse</button>
      </div>
    </section>
  );
}

const triangleScreen = (point: Point): Point => ({
  x: 150 + 145 * point.x,
  y: 205 - 145 * point.y,
});

function TriangleDiagram({ shape, anchor }: { shape: Shape; anchor: Point }) {
  const geometry = useMemo(() => triangleGeometry(shape), [shape]);
  const rawId = useId().replaceAll(":", "");
  const clipA = `${rawId}-square-a`;
  const clipB = `${rawId}-square-b`;
  const clipC = `${rawId}-square-c`;
  const { p, q, d, jp, jq, jd } = geometry;
  const zero = { x: 0, y: 0 };
  const squareA = [zero, p, subtract(p, jp), scale(-1, jp)];
  const squareB = [q, zero, jq, add(q, jq)];
  const squareC = [p, q, add(q, jd), add(p, jd)];
  const screenPolygon = (polygon: Point[]) => points(polygon.map(triangleScreen));

  const aTranslation = scale(-1, jp);
  const bTranslation = subtract(add(q, jq), add(p, jp));
  const cTranslation = subtract(q, anchor);
  const aGrid = gridLines(add(anchor, aTranslation), d, jd, 5);
  const bGrid = gridLines(add(anchor, bTranslation), d, jd, 5);
  const copiedTiles = planeTiles(geometry, cTranslation, 4);

  const renderLine = (line: { first: Point; second: Point }, key: string) => {
    const first = triangleScreen(line.first);
    const second = triangleScreen(line.second);
    return <line key={key} x1={first.x} y1={first.y} x2={second.x} y2={second.y} />;
  };

  return (
    <section className="mn-cosine-panel" aria-labelledby="mn-cosine-triangle-heading">
      <div className="mn-cosine-heading">
        <div>
          <span>Representative</span>
          <h2 id="mn-cosine-triangle-heading">The triangle and its squares</h2>
        </div>
        <strong className={`mn-cosine-regime is-${geometry.regime}`}>{geometry.regime}</strong>
      </div>

      <svg
        className="mn-cosine-triangle-svg"
        viewBox="0 0 500 360"
        role="img"
        aria-label={`A ${geometry.regime} triangle with squares on sides a, b, and c`}
      >
        <defs>
          <clipPath id={clipA}><polygon points={screenPolygon(squareA)} /></clipPath>
          <clipPath id={clipB}><polygon points={screenPolygon(squareB)} /></clipPath>
          <clipPath id={clipC}><polygon points={screenPolygon(squareC)} /></clipPath>
        </defs>

        <polygon className="mn-cosine-copy-square mn-cosine-copy-a" points={screenPolygon(squareA)} />
        <g className="mn-cosine-grid" clipPath={`url(#${clipA})`}>
          {aGrid.map((line, index) => renderLine(line, `a-${index}`))}
        </g>

        <polygon className="mn-cosine-copy-square mn-cosine-copy-b" points={screenPolygon(squareB)} />
        <g className="mn-cosine-grid" clipPath={`url(#${clipB})`}>
          {bGrid.map((line, index) => renderLine(line, `b-${index}`))}
        </g>

        <g className="mn-cosine-copied-tiles" clipPath={`url(#${clipC})`}>
          {copiedTiles.first.map((tile, index) => (
            <polygon className="mn-cosine-tile-a" points={screenPolygon(tile)} key={`copy-first-${index}`} />
          ))}
          {copiedTiles.second.map((tile, index) => (
            <polygon className="mn-cosine-tile-b" points={screenPolygon(tile)} key={`copy-second-${index}`} />
          ))}
        </g>

        <polygon className="mn-cosine-square-border" points={screenPolygon(squareA)} />
        <polygon className="mn-cosine-square-border" points={screenPolygon(squareB)} />
        <polygon className="mn-cosine-square-border" points={screenPolygon(squareC)} />
        <polygon className="mn-cosine-triangle-face" points={screenPolygon([zero, p, q])} />

        <g className="mn-cosine-square-labels" aria-hidden="true">
          <text x={triangleScreen(scale(0.5, add(squareA[0], squareA[2]))).x} y={triangleScreen(scale(0.5, add(squareA[0], squareA[2]))).y}>a²</text>
          <text x={triangleScreen(scale(0.5, add(squareB[0], squareB[2]))).x} y={triangleScreen(scale(0.5, add(squareB[0], squareB[2]))).y}>b²</text>
          <text x={triangleScreen(scale(0.5, add(squareC[0], squareC[2]))).x} y={triangleScreen(scale(0.5, add(squareC[0], squareC[2]))).y}>c²</text>
        </g>
        <text className="mn-cosine-angle-label" x={triangleScreen({ x: 0.13, y: 0.08 }).x} y={triangleScreen({ x: 0.13, y: 0.08 }).y}>C</text>
      </svg>
    </section>
  );
}

function PlaneTessellation({
  shape,
  anchor,
  setAnchor,
}: {
  shape: Shape;
  anchor: Point;
  setAnchor: (point: Point) => void;
}) {
  const geometry = useMemo(() => triangleGeometry(shape), [shape]);
  const dragging = useRef(false);
  const tiles = useMemo(() => planeTiles(geometry), [geometry]);
  const lines = useMemo(
    () => gridLines(anchor, geometry.d, geometry.jd),
    [anchor, geometry.d, geometry.jd],
  );

  function updateAnchor(event: PointerEvent<SVGSVGElement>) {
    const point = pointerInSvg(event);
    if (!point) return;
    setAnchor({
      x: clamp(point.x, PLANE.minX + 0.12, PLANE.minX + PLANE.width - 0.12),
      y: clamp(-point.y, -PLANE.minY - PLANE.height + 0.12, -PLANE.minY - 0.12),
    });
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const amount = event.shiftKey ? 0.12 : 0.035;
    const movement: Record<string, Point> = {
      ArrowLeft: { x: -amount, y: 0 },
      ArrowRight: { x: amount, y: 0 },
      ArrowUp: { x: 0, y: amount },
      ArrowDown: { x: 0, y: -amount },
    };
    if (event.key === "Home") {
      event.preventDefault();
      setAnchor(DEFAULT_ANCHOR);
      return;
    }
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    setAnchor({
      x: clamp(anchor.x + delta.x, PLANE.minX + 0.12, PLANE.minX + PLANE.width - 0.12),
      y: clamp(anchor.y + delta.y, PLANE.minY + 0.12, PLANE.minY + PLANE.height - 0.12),
    });
  }

  const anchorLeft = ((anchor.x - PLANE.minX) / PLANE.width) * 100;
  const anchorTop = ((PLANE.minY + PLANE.height - anchor.y) / PLANE.height) * 100;

  return (
    <section className="mn-cosine-panel mn-cosine-plane-panel" aria-labelledby="mn-cosine-plane-heading">
      <div className="mn-cosine-plane-topline">
        <div>
          <span>Tessellation of the plane</span>
          <h2 id="mn-cosine-plane-heading">Two square families, one moving grid</h2>
        </div>
        <button type="button" onClick={() => setAnchor(DEFAULT_ANCHOR)}>Reset anchor</button>
      </div>

      <div className="mn-cosine-legend" aria-label="Tessellation colour key">
        <span><i className="mn-cosine-legend-a" />a² squares</span>
        <span><i className="mn-cosine-legend-b" />b² squares</span>
        <span>
          <i className={`mn-cosine-legend-correction is-${geometry.regime}`} />
          {geometry.regime === "acute" ? "overlap" : geometry.regime === "obtuse" ? "gap" : "no correction"}
        </span>
      </div>

      <div className="mn-cosine-svg-wrap mn-cosine-plane-wrap">
        <svg
          className="mn-cosine-plane-svg"
          viewBox={`${PLANE.minX} ${PLANE.minY} ${PLANE.width} ${PLANE.height}`}
          role="img"
          aria-label={`${geometry.regime} triangle tessellation. Drag the anchor to translate the c squared grid.`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragging.current = true;
            updateAnchor(event);
          }}
          onPointerMove={(event) => {
            if (dragging.current) updateAnchor(event);
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
            <rect x={PLANE.minX} y={-PLANE.minY - PLANE.height} width={PLANE.width} height={PLANE.height} className="mn-cosine-plane-background" />
            <g className="mn-cosine-square-layer">
              {tiles.first.map((tile, index) => <polygon className="mn-cosine-tile-a" points={points(tile)} key={`first-${index}`} />)}
              {tiles.second.map((tile, index) => <polygon className="mn-cosine-tile-b" points={points(tile)} key={`second-${index}`} />)}
            </g>
            <g className="mn-cosine-c-grid">
              {lines.map((line, index) => (
                <line key={`grid-${index}`} x1={line.first.x} y1={line.first.y} x2={line.second.x} y2={line.second.y} />
              ))}
            </g>
            <g className="mn-cosine-plane-square-boundaries" aria-hidden="true">
              {tiles.first.map((tile, index) => (
                <polygon
                  className="mn-cosine-plane-square-boundary"
                  points={points(tile)}
                  key={`first-boundary-${index}`}
                />
              ))}
              {tiles.second.map((tile, index) => (
                <polygon
                  className="mn-cosine-plane-square-boundary"
                  points={points(tile)}
                  key={`second-boundary-${index}`}
                />
              ))}
            </g>
            <circle className="mn-cosine-anchor" cx={anchor.x} cy={anchor.y} r="0.075" aria-hidden="true" />
            <circle className="mn-cosine-anchor-centre" cx={anchor.x} cy={anchor.y} r="0.024" aria-hidden="true" />
          </g>
        </svg>
        <button
          className="mn-cosine-native-handle"
          type="button"
          style={{ left: `${anchorLeft}%`, top: `${anchorTop}%` }}
          aria-label="Movable square-grid anchor. Use arrow keys to move it and Home to reset it."
          onKeyDown={moveWithKeyboard}
        />
      </div>

      <p className="mn-cosine-note" aria-live="polite">
        {geometry.regime === "acute"
          ? "The softly shaded parallelograms are overlaps: the two square families cover the same area twice."
          : geometry.regime === "obtuse"
            ? "The pale parallelograms are gaps between the two square families."
            : "At a right angle the overlaps or gaps collapse, leaving the Pythagorean tessellation."}
      </p>
    </section>
  );
}

export function LawOfCosinesPreview() {
  const [shape, setShape] = useState<Shape>(DEFAULT_SHAPE);
  const [anchor, setAnchor] = useState<Point>(DEFAULT_ANCHOR);

  return (
    <div className="mn-cosine-preview">
      <div className="mn-cosine-equation" aria-label="c squared equals a squared plus b squared minus two a b cosine C">
        <KaTeXMath tex={String.raw`c^2=a^2+b^2-2ab\cos C`} />
      </div>

      <div className="mn-cosine-first-row">
        <ModuliChamber shape={shape} setShape={setShape} />
        <TriangleDiagram shape={shape} anchor={anchor} />
      </div>

      <PlaneTessellation shape={shape} anchor={anchor} setAnchor={setAnchor} />
    </div>
  );
}
