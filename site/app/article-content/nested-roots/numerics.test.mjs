import assert from "node:assert/strict";
import test from "node:test";
import { ALPHA, L_ALPHA, converges, fmt, g, orbit, restPoints, settleSteps, startBehavior } from "./numerics.mjs";

test("the convergence domain includes alpha, excludes 1 and the intervening gap", () => {
  for (const x of [0.02, ALPHA, 1.001, 2, 3]) assert.equal(converges(x), true);
  for (const x of [0, 0.361, 0.5, 1]) {
    assert.equal(converges(x), false);
    if (x > 0) for (const dec of [2, 4, 6, 9]) assert.equal(settleSteps(x, dec).status, "diverges");
  }
  assert.deepEqual(orbit(1, 5).values, [1, 2, 3, 4, 5]);
});

test("tiny lower fixed points are resolved in logarithmic coordinates", () => {
  for (const x of [0.02, 0.05, 0.075]) {
    const [lower, upper] = restPoints(x);
    const first = Math.pow(x, 1 / x);
    assert.ok(lower > 0 && Math.abs(lower / first - 1) < 1e-10);
    assert.ok(Math.abs(g(lower, x) / lower - 1) < 1e-10);
    assert.ok(Math.abs(Math.pow(upper, x) - upper - x) < 1e-13);
  }
});

test("the double root and the absent fixed point at x=1 are distinct", () => {
  assert.deepEqual(restPoints(ALPHA), [L_ALPHA]);
  assert.deepEqual(restPoints(1), []);
  assert.equal(restPoints(ALPHA - 1e-8).length, 2);
  assert.deepEqual(restPoints(ALPHA + 1e-8), []);
});

test("the x>1 bracket grows beyond a million when necessary", () => {
  const x = 1.000000001;
  const [root] = restPoints(x);
  assert.ok(root > 1e6);
  assert.ok(Math.abs(root * Math.expm1((x - 1) * Math.log(root)) - x) < 1e-10);
  assert.ok(Math.abs(restPoints(2)[0] - 2) < 1e-14);
});

test("the change test is absolute and reports the first qualifying index", () => {
  const x = 1.001, dec = 9, result = settleSteps(x, dec);
  assert.equal(result.status, "reached");
  const values = orbit(x, result.steps + 1, Infinity).values;
  assert.ok(Math.abs(values[result.steps] - values[result.steps - 1]) < 1e-9);
  assert.ok(Math.abs(values[result.steps - 1] - values[result.steps - 2]) >= 1e-9);
  assert.equal(result.value, values[result.steps]);
});

test("an iteration budget is not reported as divergence", () => {
  const result = settleSteps(ALPHA, 9, 2);
  assert.equal(result.status, "budget");
  assert.equal(converges(ALPHA), true);
});

test("small successive changes at alpha are not nine-place limit accuracy", () => {
  const result = settleSteps(ALPHA, 9);
  assert.equal(result.status, "reached");
  assert.ok(result.change < 1e-9);
  assert.ok(L_ALPHA - result.value > 1e-5);
});

test("starts between the two fixed points decrease; equality stays fixed", () => {
  const roots = restPoints(0.33);
  assert.equal(startBehavior(0.33, 0.3), "decreases");
  assert.equal(startBehavior(0.33, 0.05), "increases");
  assert.equal(startBehavior(0.33, 0.7), "diverges");
  for (const root of roots) assert.equal(startBehavior(0.33, root), "fixed");
});

test("truncated orbits retain computed values rather than fake sentinels", () => {
  const result = orbit(0.5, 40, 10);
  assert.equal(result.stopped, "display-limit");
  for (let i = 1; i < result.values.length; i++) {
    assert.equal(result.values[i], g(result.values[i - 1], 0.5));
  }
  assert.ok(result.values.at(-1) > 10);
  const overflowing = orbit(0.5, 100, Infinity);
  assert.equal(overflowing.stopped, "overflow");
  assert.ok(overflowing.values.every(Number.isFinite));
});

test("tiny nonzero and very large values use scientific notation", () => {
  assert.match(fmt(restPoints(0.05)[0]), /e-27$/);
  assert.match(fmt(1e20), /e20$/);
  assert.equal(fmt(0), "0.0000");
});
