/** Numerical helpers for the nested-root companion; no DOM dependencies. */
export const ALPHA = 0.3601300017321704;
export const L_ALPHA = ALPHA * ALPHA / (1 - ALPHA);
export const g = (t, x) => Math.pow(x + t, 1 / x);
export const h = (L, x) => Math.pow(L, x) - L;
export const Lstar = x => Math.pow(x, 1 / (1 - x));
export const Mpeak = x => Math.pow(x, x / (1 - x)) * (1 - x);
export const converges = x => x > 0 && (x <= ALPHA || x > 1);

function bisect(f, a, b) {
  let fa = f(a);
  if (fa === 0) return a;
  if (f(b) === 0) return b;
  for (let i = 0; i < 120; i++) {
    const m = a + (b - a) / 2;
    if (m === a || m === b) return m;
    const fm = f(m);
    if (fm === 0) return m;
    if ((fa < 0) === (fm < 0)) { a = m; fa = fm; }
    else b = m;
  }
  return a + (b - a) / 2;
}

export function restPoints(x) {
  if (!(x > 0) || !Number.isFinite(x) || (x > ALPHA && x <= 1)) return [];
  if (x === ALPHA) return [L_ALPHA];
  if (x > 1) {
    // In logarithmic coordinates the equation is
    // u + log(expm1((x - 1)u)) = log(x). Grow a genuine bracket.
    const f = u => {
      const z = (x - 1) * u;
      return u + (z > 50 ? z : Math.log(Math.expm1(z))) - Math.log(x);
    };
    let upper = Math.min(1, Math.log1p(x) / (x - 1));
    while (f(upper) < 0) upper *= 2;
    return [Math.exp(bisect(f, 0, upper))];
  }
  // The smaller root can be far below a fixed positive lower bracket.
  // Its logarithm lies between log(a_1) and log(L_*).
  const first = Math.log(x) / x;
  const peak = Math.log(x) / (1 - x);
  const f = u => x * (u - first) - Math.log1p(Math.exp(u) / x);
  const lower = Math.exp(bisect(f, first, peak));
  const upper = bisect(L => h(L, x) - x, Math.exp(peak), 1);
  return [lower, upper];
}

export function orbit(x, n, cap = 1e7) {
  const values = [Math.pow(x, 1 / x)];
  for (let i = 1; i < n; i++) {
    const t = g(values[values.length - 1], x);
    if (!Number.isFinite(t)) return { values, stopped: "overflow" };
    values.push(t);
    if (t > cap) return { values, stopped: "display-limit" };
  }
  return { values, stopped: null };
}

// n is the first index with |a_(n+1) - a_n| < 10^(-dec).
// This is a step-change test, not an error bound on the limit.
export function settleSteps(x, dec, cap = 60000) {
  let t = Math.pow(x, 1 / x);
  if (!converges(x)) return { status: "diverges", steps: 0, value: t };
  const tolerance = Math.pow(10, -dec);
  for (let n = 1; n <= cap; n++) {
    const nt = g(t, x);
    if (!Number.isFinite(nt)) return { status: "overflow", steps: n - 1, value: t };
    const change = Math.abs(nt - t);
    if (change < tolerance) return { status: "reached", steps: n, value: nt, change };
    t = nt;
  }
  return { status: "budget", steps: cap, value: t };
}

export function fmt(value, decimals = 4) {
  if (!Number.isFinite(value)) return "beyond numerical range";
  if (value !== 0 && (Math.abs(value) < Math.pow(10, -decimals) || Math.abs(value) >= 1e6)) {
    return value.toExponential(Math.min(decimals, 6)).replace("e+", "e");
  }
  return value.toFixed(decimals);
}

export function startBehavior(x, start, roots = restPoints(x)) {
  if (!roots.length) return "diverges";
  const same = root => Math.abs(start - root) <= 4 * Number.EPSILON * Math.max(Math.abs(root), Math.abs(start));
  if (roots.some(same)) return "fixed";
  if (x > 1) return start < roots[0] ? "increases" : "decreases";
  if (start > roots[roots.length - 1]) return "diverges";
  return start < roots[0] ? "increases" : "decreases";
}
