"use client";

import {
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Math as Maths } from "./Math";

type RangeUpdate = (value: number) => void;

function rangeSettings(input: HTMLInputElement) {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = input.step && input.step !== "any" ? Number(input.step) : 1;
  const decimalPlaces = input.step.includes(".")
    ? input.step.split(".")[1]?.length ?? 0
    : 0;
  return { min, max, step, decimalPlaces };
}

function normalizedRangeValue(input: HTMLInputElement, rawValue: number) {
  const { min, max, step, decimalPlaces } = rangeSettings(input);
  const stepped = min + Math.round((rawValue - min) / step) * step;
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimalPlaces));
}

function setRangeFromPointer(
  event: ReactPointerEvent<HTMLInputElement>,
  update: RangeUpdate,
) {
  const input = event.currentTarget;
  const bounds = input.getBoundingClientRect();
  if (bounds.width <= 0) return;
  const { min, max } = rangeSettings(input);
  const proportion = Math.min(
    1,
    Math.max(0, (event.clientX - bounds.left) / bounds.width),
  );
  update(normalizedRangeValue(input, min + proportion * (max - min)));
}

function beginRangePointer(
  event: ReactPointerEvent<HTMLInputElement>,
  update: RangeUpdate,
) {
  event.currentTarget.focus();
  event.currentTarget.setPointerCapture(event.pointerId);
  setRangeFromPointer(event, update);
}

function continueRangePointer(
  event: ReactPointerEvent<HTMLInputElement>,
  update: RangeUpdate,
) {
  if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
  setRangeFromPointer(event, update);
}

function endRangePointer(event: ReactPointerEvent<HTMLInputElement>) {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
}

function stepRangeFromKeyboard(
  event: ReactKeyboardEvent<HTMLInputElement>,
  update: RangeUpdate,
) {
  const input = event.currentTarget;
  const { min, max, step } = rangeSettings(input);
  const current = Number(input.value);
  let next: number | undefined;

  if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current - step;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current + step;
  if (event.key === "PageDown") next = current - step * 10;
  if (event.key === "PageUp") next = current + step * 10;
  if (event.key === "Home") next = min;
  if (event.key === "End") next = max;
  if (next === undefined) return;

  event.preventDefault();
  update(normalizedRangeValue(input, next));
}

function sumLogs(n: number) {
  let total = 0;
  for (let value = 2; value <= n; value += 1) total += Math.log(value);
  return total;
}

function lowerBound(k: number) {
  return Math.exp(
    sumLogs(k - 1) +
      (k - 0.5) -
      (k - 0.5) * Math.log(k - 0.5),
  );
}

function upperBound(k: number) {
  return Math.exp(sumLogs(k - 1) + k - (k - 0.5) * Math.log(k));
}

function logIntegral(left: number, right: number) {
  const primitive = (x: number) => x * Math.log(x) - x;
  return primitive(right) - primitive(left);
}

function range(start: number, end: number, steps = 80) {
  return Array.from({ length: steps + 1 }, (_, index) =>
    start + ((end - start) * index) / steps,
  );
}

function format(value: number, digits = 6) {
  return value.toFixed(digits);
}

function plotNumber(value: number) {
  return Number(value.toFixed(3));
}

type PlotScales = {
  x: (value: number) => number;
  y: (value: number) => number;
};

function pathFor(
  values: readonly number[],
  scales: PlotScales,
  fn: (value: number) => number,
) {
  return values
    .map((value, index) =>
      `${index === 0 ? "M" : "L"}${scales.x(value).toFixed(2)},${scales
        .y(fn(value))
        .toFixed(2)}`,
    )
    .join(" ");
}

function pointsFor(
  values: readonly number[],
  scales: PlotScales,
  fn: (value: number) => number,
) {
  return values
    .map((value) => `${scales.x(value).toFixed(2)},${scales.y(fn(value)).toFixed(2)}`)
    .join(" ");
}

type AreaLayers = {
  logarithm: boolean;
  chords: boolean;
  tangents: boolean;
};

function LogCurveLabel({ x, y }: { x: number; y: number }) {
  return (
    <text className="stirling-curve-label" x={x} y={y}>
      <tspan className="stirling-log-operator">log</tspan>
      <tspan className="stirling-log-variable" dx="4">x</tspan>
    </text>
  );
}

function SourceAreaPlot({
  kind,
  n,
  layers,
}: {
  kind: "chord" | "tangent";
  n: number;
  layers: AreaLayers;
}) {
  const width = 350;
  const height = 260;
  const margin = { left: 32, right: 12, top: 20, bottom: 38 };
  const xMin = kind === "chord" ? 2 : 1.5;
  const xMax = n;
  const yMax = Math.log(n) + 0.22;
  const scales: PlotScales = {
    x: (value) =>
      plotNumber(
        margin.left +
          ((value - xMin) / (xMax - xMin)) * (width - margin.left - margin.right),
      ),
    y: (value) =>
      plotNumber(
        height -
          margin.bottom -
          (value / yMax) * (height - margin.top - margin.bottom),
      ),
  };
  const baseline = scales.y(0);
  const curveValues = range(xMin, xMax, 140);
  const cells = Array.from({ length: n - 2 }, (_, index) => index + 2);
  const labelX = xMin + (xMax - xMin) * 0.14;

  return (
    <svg
      className="stirling-composite-plot stirling-source-plot"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        kind === "chord"
          ? `Chord trapezoids and the area under log x from 2 to ${n}`
          : `Tangent cells and the area under log x from three halves to ${n}`
      }
    >
      <line className="stirling-axis" x1={margin.left} x2={width - margin.right} y1={baseline} y2={baseline} />
      {layers.logarithm ? (
        <polygon
          className="stirling-log-area"
          points={`${scales.x(xMin)},${baseline} ${pointsFor(curveValues, scales, Math.log)} ${scales.x(xMax)},${baseline}`}
        />
      ) : null}

      {kind === "chord" && layers.chords
        ? cells.map((m) => (
            <polygon
              className="stirling-composite-cell is-under"
              key={`source-chord-${m}`}
              points={`${scales.x(m)},${baseline} ${scales.x(m)},${scales.y(Math.log(m))} ${scales.x(m + 1)},${scales.y(Math.log(m + 1))} ${scales.x(m + 1)},${baseline}`}
            />
          ))
        : null}

      {kind === "tangent" && layers.tangents ? (
        <>
          {cells.map((m) => {
            const tangent = (value: number) => Math.log(m) + (value - m) / m;
            return (
              <polygon
                className="stirling-composite-cell is-over"
                key={`source-tangent-${m}`}
                points={`${scales.x(m - 0.5)},${baseline} ${scales.x(m - 0.5)},${scales.y(tangent(m - 0.5))} ${scales.x(m + 0.5)},${scales.y(tangent(m + 0.5))} ${scales.x(m + 0.5)},${baseline}`}
              />
            );
          })}
          <polygon
            className="stirling-composite-cell is-final"
            points={`${scales.x(n - 0.5)},${baseline} ${scales.x(n - 0.5)},${scales.y(Math.log(n))} ${scales.x(n)},${scales.y(Math.log(n))} ${scales.x(n)},${baseline}`}
          />
        </>
      ) : null}

      <path className="stirling-log-curve" d={pathFor(curveValues, scales, Math.log)} />
      <LogCurveLabel
        x={scales.x(labelX)}
        y={Math.max(margin.top + 12, scales.y(Math.log(labelX)) - 14)}
      />
      <text className="stirling-axis-label is-start" x={scales.x(xMin)} y={height - 13}>{kind === "chord" ? "2" : "3/2"}</text>
      <text className="stirling-axis-label is-end" x={scales.x(n)} y={height - 13}>{n}</text>
    </svg>
  );
}

export function ChakrabortyAreaExplorer() {
  const [n, setN] = useState(6);
  const [layers, setLayers] = useState<AreaLayers>({
    logarithm: true,
    chords: true,
    tangents: true,
  });
  const chordArea =
    0.5 * Math.log(2) +
    Array.from({ length: Math.max(0, n - 3) }, (_, index) => Math.log(index + 3)).reduce(
      (sum, value) => sum + value,
      0,
    ) +
    0.5 * Math.log(n);
  const chordIntegral = logIntegral(2, n);
  const tangentArea = sumLogs(n - 1) + 0.5 * Math.log(n);
  const tangentIntegral = logIntegral(1.5, n);

  const setLayer = (name: keyof AreaLayers, checked: boolean) => {
    setLayers((current) => ({ ...current, [name]: checked }));
  };
  const setEndpoint = (value: number) => setN(value);

  return (
    <section className="stirling-interactive" aria-labelledby="source-areas-title">
      <div className="stirling-interactive-heading">
        <div>
          <p className="eyebrow">Interactive 1 · Chakraborty&apos;s construction</p>
          <h3 id="source-areas-title">The areas in the proof</h3>
        </div>
        <label className="stirling-control">
          <span>Endpoint <Maths tex="n" /> <strong>{n}</strong></span>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={n}
            onInput={(event) => setEndpoint(Number(event.currentTarget.value))}
            onChange={(event) => setEndpoint(Number(event.currentTarget.value))}
            onPointerDown={(event) => beginRangePointer(event, setEndpoint)}
            onPointerMove={(event) => continueRangePointer(event, setEndpoint)}
            onPointerUp={endRangePointer}
            onPointerCancel={endRangePointer}
            onKeyDown={(event) => stepRangeFromKeyboard(event, setEndpoint)}
          />
        </label>
      </div>

      <fieldset className="stirling-layer-controls">
        <legend>Visible areas</legend>
        <label><input type="checkbox" checked={layers.logarithm} onInput={(event) => setLayer("logarithm", event.currentTarget.checked)} onChange={(event) => setLayer("logarithm", event.currentTarget.checked)} />Area under log x</label>
        <label><input type="checkbox" checked={layers.chords} onInput={(event) => setLayer("chords", event.currentTarget.checked)} onChange={(event) => setLayer("chords", event.currentTarget.checked)} />Chord trapezoids</label>
        <label><input type="checkbox" checked={layers.tangents} onInput={(event) => setLayer("tangents", event.currentTarget.checked)} onChange={(event) => setLayer("tangents", event.currentTarget.checked)} />Tangent cover</label>
      </fieldset>

      <div className="stirling-proof-pair stirling-source-pair">
        <figure>
          <figcaption><strong>Chords below</strong><span>domain [2, n]</span></figcaption>
          <SourceAreaPlot kind="chord" n={n} layers={layers} />
          <p><Maths tex={String.raw`C_n<\int_2^n\log x\,dx`} /></p>
          <small>
            <span>{format(chordArea, 5)} &lt; {format(chordIntegral, 5)}</span>
            <span>gap {format(chordIntegral - chordArea, 5)}</span>
          </small>
        </figure>
        <figure>
          <figcaption><strong>Tangents above</strong><span>domain [3/2, n]</span></figcaption>
          <SourceAreaPlot kind="tangent" n={n} layers={layers} />
          <p><Maths tex={String.raw`\int_{3/2}^n\log x\,dx<T_n`} /></p>
          <small>
            <span>{format(tangentIntegral, 5)} &lt; {format(tangentArea, 5)}</span>
            <span>gap {format(tangentArea - tangentIntegral, 5)}</span>
          </small>
        </figure>
      </div>
      <p className="stirling-interactive-note" aria-live="polite">
        At <Maths tex={String.raw`n=${n}`} />, the chord total undercounts by
        <strong> {format(chordIntegral - chordArea, 5)}</strong>, while the tangent
        cover overcounts by <strong>{format(tangentArea - tangentIntegral, 5)}</strong>.
        The two panels use different starting points, exactly as in the proof.
      </p>
    </section>
  );
}

function CompositeAreaPlot({
  kind,
  k,
  n,
}: {
  kind: "chord" | "tangent";
  k: number;
  n: number;
}) {
  const width = 350;
  const height = 255;
  const margin = { left: 30, right: 12, top: 20, bottom: 36 };
  const xMin = kind === "chord" ? k : k - 0.5;
  const xMax = n;
  const yMin = 0;
  const yMax = Math.log(n) + 0.22;
  const scales: PlotScales = {
    x: (value) =>
      plotNumber(
        margin.left +
          ((value - xMin) / Math.max(1, xMax - xMin)) *
            (width - margin.left - margin.right),
      ),
    y: (value) =>
      plotNumber(
        height -
          margin.bottom -
          ((value - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom),
      ),
  };
  const curveValues = range(xMin, xMax, 120);
  const baseline = scales.y(0);
  const labelX = xMin + (xMax - xMin) * 0.14;

  return (
    <svg
      className="stirling-composite-plot"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        kind === "chord"
          ? `Trapezoids below log x from ${k} to ${n}`
          : `Tangent cells above log x from ${k - 0.5} to ${n}`
      }
    >
      <line className="stirling-axis" x1={margin.left} x2={width - margin.right} y1={baseline} y2={baseline} />
      {kind === "chord"
        ? Array.from({ length: n - k }, (_, index) => k + index).map((m) => (
            <polygon
              className="stirling-composite-cell is-under"
              key={`chord-${m}`}
              points={`${scales.x(m)},${baseline} ${scales.x(m)},${scales.y(
                Math.log(m),
              )} ${scales.x(m + 1)},${scales.y(Math.log(m + 1))} ${scales.x(
                m + 1,
              )},${baseline}`}
            />
          ))
        : (
            <>
              {Array.from({ length: n - k }, (_, index) => k + index).map((m) => {
                const tangent = (x: number) => Math.log(m) + (x - m) / m;
                return (
                  <polygon
                    className="stirling-composite-cell is-over"
                    key={`tangent-${m}`}
                    points={`${scales.x(m - 0.5)},${baseline} ${scales.x(
                      m - 0.5,
                    )},${scales.y(tangent(m - 0.5))} ${scales.x(m + 0.5)},${scales.y(
                      tangent(m + 0.5),
                    )} ${scales.x(m + 0.5)},${baseline}`}
                  />
                );
              })}
              <polygon
                className="stirling-composite-cell is-final"
                points={`${scales.x(n - 0.5)},${baseline} ${scales.x(n - 0.5)},${scales.y(
                  Math.log(n),
                )} ${scales.x(n)},${scales.y(Math.log(n))} ${scales.x(n)},${baseline}`}
              />
            </>
          )}
      <path className="stirling-log-curve" d={pathFor(curveValues, scales, Math.log)} />
      <text className="stirling-axis-label is-start" x={scales.x(xMin)} y={height - 13}>
        {kind === "chord" ? k : `${k}−½`}
      </text>
      <text className="stirling-axis-label is-end" x={scales.x(n)} y={height - 13}>
        {n}
      </text>
      <LogCurveLabel
        x={scales.x(labelX)}
        y={Math.max(margin.top + 12, scales.y(Math.log(labelX)) - 14)}
      />
    </svg>
  );
}

export function AreaProofAssembler() {
  const [k, setK] = useState(3);
  const [n, setN] = useState(8);
  const integralUnder = logIntegral(k, n);
  const trapezoids =
    0.5 * Math.log(k) +
    Array.from({ length: Math.max(0, n - k - 1) }, (_, index) =>
      Math.log(k + 1 + index),
    ).reduce((sum, value) => sum + value, 0) +
    0.5 * Math.log(n);
  const integralOver = logIntegral(k - 0.5, n);
  const tangentRoof =
    Array.from({ length: n - k }, (_, index) => Math.log(k + index)).reduce(
      (sum, value) => sum + value,
      0,
    ) + 0.5 * Math.log(n);
  const setStart = (nextK: number) => {
    setK(nextK);
    if (n <= nextK) setN(nextK + 1);
  };
  const setEnd = (value: number) => setN(value);

  return (
    <section className="stirling-interactive" aria-labelledby="area-proof-title">
      <div className="stirling-interactive-heading">
        <div>
          <p className="eyebrow">Interactive 2 · assemble the proof</p>
          <h3 id="area-proof-title">Move the starting line</h3>
        </div>
        <div className="stirling-control-pair">
          <label className="stirling-control">
            <span>
              Start <Maths tex="k" /> <strong>{k}</strong>
            </span>
            <input
              type="range"
              min="2"
              max="7"
              step="1"
              value={k}
              onInput={(event) => setStart(Number(event.currentTarget.value))}
              onChange={(event) => setStart(Number(event.currentTarget.value))}
              onPointerDown={(event) => beginRangePointer(event, setStart)}
              onPointerMove={(event) => continueRangePointer(event, setStart)}
              onPointerUp={endRangePointer}
              onPointerCancel={endRangePointer}
              onKeyDown={(event) => stepRangeFromKeyboard(event, setStart)}
            />
          </label>
          <label className="stirling-control">
            <span>
              End <Maths tex="n" /> <strong>{n}</strong>
            </span>
            <input
              type="range"
              min={k + 1}
              max="12"
              step="1"
              value={n}
              onInput={(event) => setEnd(Number(event.currentTarget.value))}
              onChange={(event) => setEnd(Number(event.currentTarget.value))}
              onPointerDown={(event) => beginRangePointer(event, setEnd)}
              onPointerMove={(event) => continueRangePointer(event, setEnd)}
              onPointerUp={endRangePointer}
              onPointerCancel={endRangePointer}
              onKeyDown={(event) => stepRangeFromKeyboard(event, setEnd)}
            />
          </label>
        </div>
      </div>

      <div className="stirling-proof-pair">
        <figure>
          <figcaption>
            <strong>Chords below</strong>
            <span>an under-area makes the upper bound</span>
          </figcaption>
          <CompositeAreaPlot kind="chord" k={k} n={n} />
          <p aria-live="polite">
            Gap <strong>{format(integralUnder - trapezoids, 5)}</strong>
          </p>
        </figure>
        <figure>
          <figcaption>
            <strong>Tangents above</strong>
            <span>an over-area makes the lower bound</span>
          </figcaption>
          <CompositeAreaPlot kind="tangent" k={k} n={n} />
          <p aria-live="polite">
            Gap <strong>{format(tangentRoof - integralOver, 5)}</strong>
          </p>
        </figure>
      </div>

      <div className="stirling-telescope" aria-live="polite">
        <p>
          <span>Chord construction</span>
          <Maths tex={String.raw`R_{${n}}<R_{${k}}=${format(upperBound(k))}`} />
        </p>
        <p>
          <span>Tangent construction</span>
          <Maths tex={String.raw`${format(lowerBound(k))}=L_{${k}}<R_{${n}}`} />
        </p>
      </div>
      <p className="stirling-interactive-note">
        Only the starting line moves. The factors before <Maths tex="k" /> remain
        exact; the same local comparison is applied to the tail.
      </p>
    </section>
  );
}

const lanczosCoefficients = [
  676.5203681218851,
  -1259.1392167224028,
  771.3234287776531,
  -176.6150291621406,
  12.507343278686905,
  -0.13857109526572012,
  0.000009984369578019572,
  0.00000015056327351493116,
] as const;

function logGamma(value: number) {
  const z = value - 1;
  let series = 0.9999999999998099;
  lanczosCoefficients.forEach((coefficient, index) => {
    series += coefficient / (z + index + 1);
  });
  const t = z + 7.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) -
    t +
    Math.log(series)
  );
}

function continuousR(value: number) {
  return Math.exp(
    logGamma(value + 1) +
      value -
      value * Math.log(value) -
      0.5 * Math.log(value),
  );
}

function continuousLower(value: number) {
  return Math.exp(
    logGamma(value) +
      (value - 0.5) * (1 - Math.log(value - 0.5)),
  );
}

export function GammaExtensionPlot() {
  const [probe, setProbe] = useState(6);
  const width = 720;
  const height = 310;
  const margin = { left: 62, right: 24, top: 24, bottom: 48 };
  const xMin = 2;
  const xMax = 30;
  const yMin = 2.42;
  const yMax = 2.63;
  const scales: PlotScales = {
    x: (value) =>
      plotNumber(
        margin.left +
          ((value - xMin) / (xMax - xMin)) * (width - margin.left - margin.right),
      ),
    y: (value) =>
      plotNumber(
        height -
          margin.bottom -
          ((value - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom),
      ),
  };
  const samples = range(xMin, xMax, 280);
  const rValue = continuousR(probe);
  const lowerValue = continuousLower(probe);
  const limit = Math.sqrt(2 * Math.PI);
  const gapPolygon = `${pointsFor(samples, scales, continuousR)} ${pointsFor(
    [...samples].reverse(),
    scales,
    continuousLower,
  )}`;
  const setProbeFromInput = (value: number) => setProbe(value);

  return (
    <section className="stirling-interactive" aria-labelledby="gamma-extension-title">
      <div className="stirling-interactive-heading">
        <div>
          <p className="eyebrow">Interactive 3 · the continuous picture</p>
          <h3 id="gamma-extension-title">Between the integers</h3>
        </div>
        <label className="stirling-control stirling-gamma-control">
          <span>Probe <Maths tex="x" /> <strong>{probe.toFixed(2)}</strong></span>
          <input
            type="range"
            min="2.01"
            max="30"
            step="0.01"
            value={probe}
            aria-valuetext={`x equals ${probe.toFixed(2)}`}
            onInput={(event) => setProbeFromInput(Number(event.currentTarget.value))}
            onChange={(event) => setProbeFromInput(Number(event.currentTarget.value))}
            onPointerDown={(event) => beginRangePointer(event, setProbeFromInput)}
            onPointerMove={(event) => continueRangePointer(event, setProbeFromInput)}
            onPointerUp={endRangePointer}
            onPointerCancel={endRangePointer}
            onKeyDown={(event) => stepRangeFromKeyboard(event, setProbeFromInput)}
          />
        </label>
      </div>

      <div className="stirling-gamma-legend" aria-label="Plot legend">
        <span className="is-r"><i aria-hidden="true" />R(x)</span>
        <span className="is-l"><i aria-hidden="true" />L(x)</span>
        <span className="is-limit"><i aria-hidden="true" />√2π</span>
      </div>

      <svg
        className="stirling-gamma-plot"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby="gamma-plot-title gamma-plot-description"
      >
        <title id="gamma-plot-title">{`R of x and its lower companion L of x at x equals ${probe.toFixed(2)}`}</title>
        <desc id="gamma-plot-description">
          R decreases and L increases towards square root of two pi. A vertical
          probe marks the selected real value of x.
        </desc>
        {[2.44, 2.5, 2.56, 2.62].map((tick) => (
          <g key={tick}>
            <line className="stirling-gamma-guide" x1={margin.left} x2={width - margin.right} y1={scales.y(tick)} y2={scales.y(tick)} />
            <text className="stirling-axis-label is-y" x={margin.left - 10} y={scales.y(tick) + 4}>{tick.toFixed(2)}</text>
          </g>
        ))}
        {[2, 5, 10, 20, 30].map((tick) => (
          <g key={tick}>
            <line className="stirling-gamma-tick" x1={scales.x(tick)} x2={scales.x(tick)} y1={height - margin.bottom} y2={height - margin.bottom + 5} />
            <text className="stirling-axis-label" x={scales.x(tick)} y={height - 18}>{tick}</text>
          </g>
        ))}
        <line className="stirling-axis" x1={margin.left} x2={width - margin.right} y1={height - margin.bottom} y2={height - margin.bottom} />
        <line className="stirling-gamma-limit" x1={margin.left} x2={width - margin.right} y1={scales.y(limit)} y2={scales.y(limit)} />
        <polygon className="stirling-gamma-gap" points={gapPolygon} />
        <path className="stirling-gamma-r" d={pathFor(samples, scales, continuousR)} />
        <path className="stirling-gamma-l" d={pathFor(samples, scales, continuousLower)} />
        <line className="stirling-gamma-probe" x1={scales.x(probe)} x2={scales.x(probe)} y1={margin.top} y2={height - margin.bottom} />
        <circle className="stirling-gamma-r-point" cx={scales.x(probe)} cy={scales.y(rValue)} r="5" />
        <circle className="stirling-gamma-l-point" cx={scales.x(probe)} cy={scales.y(lowerValue)} r="5" />
        <text className="stirling-axis-title" x={(margin.left + width - margin.right) / 2} y={height - 3}>real input x</text>
        <text className="stirling-axis-title is-y" x="15" y={(margin.top + height - margin.bottom) / 2} transform={`rotate(-90 15 ${(margin.top + height - margin.bottom) / 2})`}>normalized value</text>
      </svg>

      <div className="stirling-bound-values" aria-live="polite">
        <p><span>Lower <Maths tex="L(x)" /></span><strong>{format(lowerValue, 9)}</strong></p>
        <p><span>Upper <Maths tex="R(x)" /></span><strong>{format(rValue, 9)}</strong></p>
        <p><span>Gap</span><strong>{format(rValue - lowerValue, 9)}</strong></p>
      </div>
      <p className="stirling-interactive-note">
        At <Maths tex={String.raw`x=${probe.toFixed(2)}`} />, the ratio{" "}
        <Maths tex={String.raw`R(x)/L(x)`} /> is
        <strong> {format(rValue / lowerValue, 7)}</strong>. The shaded interval
        narrows towards <Maths tex={String.raw`\sqrt{2\pi}`} />.
      </p>
    </section>
  );
}
