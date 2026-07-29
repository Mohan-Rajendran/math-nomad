"use client";

import { useMemo, useState } from "react";
import { Download, Link2, RefreshCw, Sparkles } from "lucide-react";

export function KolamInteractive() {
  const [size, setSize] = useState("5 × 5");
  const [symmetry, setSymmetry] = useState("Quarter-turn");
  const [style, setStyle] = useState("Rounded");
  const [seed, setSeed] = useState(37);
  const [dots, setDots] = useState(true);
  const [axes, setAxes] = useState(true);
  const loopCount = symmetry === "None" ? 3 : seed % 2 === 0 ? 2 : 1;
  const cells = size.startsWith("3") ? 9 : size.startsWith("7") ? 49 : 25;
  const points = useMemo(() => Array.from({ length: cells }, (_, index) => index), [cells]);

  function generate() {
    setSeed((current) => (current * 7 + 11) % 97);
  }

  return (
    <div className="interactive-workbench">
      <aside className="control-panel" aria-label="Kolam controls">
        <div className="control-heading">
          <span>Experiment controls</span>
          <span className="version-pill">v1.2</span>
        </div>
        <label>
          <span>Lattice</span>
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            <option>3 × 3</option><option>5 × 5</option><option>7 × 7</option>
          </select>
        </label>
        <label>
          <span>Rule style</span>
          <select value={style} onChange={(event) => setStyle(event.target.value)}>
            <option>Rounded</option><option>Angular</option>
          </select>
        </label>
        <label>
          <span>Symmetry</span>
          <select value={symmetry} onChange={(event) => setSymmetry(event.target.value)}>
            <option>None</option><option>Vertical reflection</option><option>Quarter-turn</option>
          </select>
        </label>
        <label>
          <span>Numeric seed</span>
          <input type="number" min="1" max="99" value={seed} onChange={(event) => setSeed(Number(event.target.value))} />
        </label>
        <label className="check-row">
          <input type="checkbox" checked={dots} onChange={(event) => setDots(event.target.checked)} />
          <span>Show dots</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={axes} onChange={(event) => setAxes(event.target.checked)} />
          <span>Show symmetry axes</span>
        </label>
        <div className="control-actions">
          <button className="button button-primary" type="button" onClick={generate}><Sparkles size={16} /> Generate</button>
          <button className="icon-button" type="button" onClick={() => setSeed(37)} aria-label="Reset pattern"><RefreshCw size={17} /></button>
        </div>
      </aside>

      <section className="canvas-panel">
        <div className={`kolam-canvas ${style === "Angular" ? "kolam-angular" : ""} ${axes ? "show-axes" : ""}`} aria-label={`Generated ${size} kolam pattern with ${symmetry.toLowerCase()} symmetry`}>
          <div className="kolam-loop kolam-loop-one" />
          <div className="kolam-loop kolam-loop-two" />
          <div className="kolam-loop kolam-loop-three" />
          <div className={`dot-grid dots-${size.charAt(0)} ${dots ? "" : "dots-hidden"}`} aria-hidden="true">
            {points.map((point) => <span key={point} />)}
          </div>
        </div>
        <div className="canvas-status" aria-live="polite">
          <p><strong>{loopCount} {loopCount === 1 ? "continuous loop" : "loops"}</strong> · {cells * 2 - 2} segments · {symmetry.toLowerCase()} symmetry</p>
          <div>
            <button type="button"><Link2 size={15} /> Copy share link</button>
            <button type="button"><Download size={15} /> Export SVG</button>
          </div>
        </div>
      </section>
    </div>
  );
}
