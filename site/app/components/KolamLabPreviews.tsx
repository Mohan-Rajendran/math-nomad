"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Math as KaTeXMath } from "./Math";

type Direction = "E" | "N" | "W" | "S";
type Epsilon = 1 | -1;
type TileSource = { kind: "tray" } | { kind: "board"; index: number };
type Selection = { tile: number; source: TileSource } | null;
type EdgeIssue = {
  first: number;
  firstDirection: Direction;
  second?: number;
  secondDirection?: Direction;
};
type PointerDrag = {
  tile: number;
  source: TileSource;
  pointerId: number;
  startX: number;
  startY: number;
  dragging: boolean;
};
type PuzzlePair = {
  epsilon: Epsilon;
  x: number;
  y: number;
  distance: number;
  path: number[];
};

const EMPTY_BOARD: (number | null)[] = Array(16).fill(null);
const TILE_VALUES = Array.from({ length: 16 }, (_, index) => index);
const VALID_EXAMPLE = [
  1, 9, 11, 3,
  13, 14, 15, 7,
  12, 2, 4, 5,
  0, 8, 10, 6,
];

const DIRECTION_BITS: Record<Direction, number> = { E: 8, N: 4, W: 2, S: 1 };
const PUZZLE_SEEDS: { epsilon: Epsilon; distance: number; partner: number; state: number[] }[] = [
  { epsilon: -1, distance: 10, partner: 1, state: [9, 10, 11, 2, 5, 1, 13, 3, 12, 14, 15, 7, 0, 8, 6, 4] },
  { epsilon: -1, distance: 10, partner: 0, state: [1, 9, 10, 2, 5, 13, 11, 3, 12, 14, 15, 7, 0, 8, 6, 4] },
  { epsilon: -1, distance: 12, partner: 3, state: [9, 10, 3, 1, 13, 11, 14, 7, 12, 15, 2, 5, 0, 4, 8, 6] },
  { epsilon: -1, distance: 12, partner: 2, state: [9, 10, 3, 1, 13, 11, 7, 5, 4, 12, 15, 6, 0, 8, 14, 2] },
  { epsilon: -1, distance: 14, partner: 5, state: [8, 11, 10, 3, 9, 7, 1, 5, 13, 14, 15, 6, 4, 0, 12, 2] },
  { epsilon: -1, distance: 14, partner: 4, state: [8, 10, 3, 1, 9, 11, 7, 5, 13, 14, 15, 6, 4, 0, 12, 2] },
  { epsilon: 1, distance: 10, partner: 7, state: [1, 9, 11, 2, 5, 13, 14, 3, 12, 15, 10, 7, 0, 4, 8, 6] },
  { epsilon: 1, distance: 10, partner: 6, state: [1, 9, 11, 2, 13, 14, 15, 3, 5, 0, 12, 7, 4, 8, 10, 6] },
  { epsilon: 1, distance: 10, partner: 9, state: [9, 10, 11, 2, 5, 1, 13, 3, 12, 15, 14, 7, 0, 4, 8, 6] },
  { epsilon: 1, distance: 10, partner: 8, state: [1, 9, 10, 2, 5, 13, 11, 3, 12, 15, 14, 7, 0, 4, 8, 6] },
  { epsilon: 1, distance: 12, partner: 11, state: [8, 11, 2, 1, 9, 15, 10, 7, 13, 14, 3, 5, 4, 0, 12, 6] },
  { epsilon: 1, distance: 12, partner: 10, state: [8, 11, 10, 2, 9, 15, 3, 1, 13, 14, 7, 5, 4, 0, 12, 6] },
];

const CHALLENGE_PAIRS: PuzzlePair[] = [
  { epsilon: -1, x: 2, y: 3, distance: 12, path: [4, 8, 2, 14, 7, 5, 6, 2, 14, 15, 12, 4] },
  { epsilon: -1, x: 2, y: 4, distance: 31, path: [4, 15, 2, 8, 15, 2, 12, 13, 11, 14, 8, 15, 2, 12, 14, 8, 7, 1, 3, 10, 8, 11, 9, 8, 11, 7, 1, 5, 6, 2, 12] },
  { epsilon: -1, x: 2, y: 5, distance: 29, path: [4, 15, 2, 8, 15, 2, 12, 13, 11, 14, 8, 15, 2, 12, 14, 8, 3, 10, 8, 11, 9, 8, 10, 3, 7, 5, 6, 2, 12] },
  { epsilon: -1, x: 3, y: 4, distance: 29, path: [4, 13, 11, 7, 15, 12, 8, 14, 12, 15, 7, 8, 15, 6, 5, 1, 3, 10, 8, 11, 9, 8, 11, 7, 1, 5, 6, 15, 14] },
  { epsilon: -1, x: 3, y: 5, distance: 23, path: [4, 13, 9, 10, 11, 7, 15, 12, 8, 14, 12, 15, 7, 8, 13, 9, 8, 11, 10, 8, 9, 13, 14] },
  { epsilon: -1, x: 4, y: 5, distance: 14, path: [14, 15, 6, 5, 1, 7, 11, 10, 3, 1, 5, 6, 15, 14] },
  { epsilon: 1, x: 6, y: 8, distance: 14, path: [12, 15, 10, 14, 13, 10, 15, 5, 1, 9, 10, 1, 5, 12] },
  { epsilon: 1, x: 6, y: 9, distance: 18, path: [12, 15, 10, 14, 11, 9, 13, 10, 14, 11, 10, 13, 9, 10, 11, 14, 15, 12] },
  { epsilon: 1, x: 7, y: 8, distance: 24, path: [12, 15, 14, 13, 5, 12, 15, 10, 8, 4, 12, 15, 10, 14, 13, 10, 15, 5, 1, 9, 10, 1, 5, 12] },
  { epsilon: 1, x: 7, y: 9, distance: 26, path: [12, 15, 14, 13, 5, 12, 15, 10, 8, 15, 10, 14, 11, 9, 13, 10, 14, 11, 10, 13, 9, 10, 11, 14, 15, 4] },
  { epsilon: 1, x: 10, y: 11, distance: 12, path: [12, 6, 5, 7, 1, 2, 10, 3, 7, 5, 6, 12] },
];

const DEFAULT_PUZZLE_SEED_INDEX = 6;
const DEFAULT_CHALLENGE_PAIR_INDEX = 7;

function word(tile: number) {
  return tile.toString(2).padStart(4, "0");
}

function hasPort(tile: number, direction: Direction) {
  return (tile & DIRECTION_BITS[direction]) !== 0;
}

function coordinate(index: number) {
  const row = Math.floor(index / 4);
  const column = index % 4;
  return `(${column + 1}, ${4 - row})`;
}

function tileDescription(tile: number) {
  const directions = (["E", "N", "W", "S"] as Direction[]).filter((direction) => hasPort(tile, direction));
  if (directions.length === 0) return "no boundary connections";
  const names: Record<Direction, string> = { E: "east", N: "north", W: "west", S: "south" };
  return `${directions.map((direction) => names[direction]).join(", ")} ${directions.length === 1 ? "connection" : "connections"}`;
}

function kolamPath(tile: number) {
  const [east, north, west, south] = word(tile).split("").map(Number);
  const radius = 25 * Math.SQRT2;
  const section = (active: number, anchorX: number, anchorY: number, endX: number, endY: number) =>
    active
      ? `L ${anchorX} ${anchorY} L ${endX} ${endY}`
      : `A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  return [
    "M 75 25",
    section(east, 100, 50, 75, 75),
    section(south, 50, 100, 25, 75),
    section(west, 0, 50, 25, 25),
    section(north, 50, 0, 75, 25),
    "Z",
  ].join(" ");
}

function KolamArt({ tile }: { tile: number }) {
  return (
    <svg className="mnl-tile-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <rect width="100" height="100" fill="var(--clay)" />
      <path
        d={kolamPath(tile)}
        fill="none"
        stroke="var(--mnl-curve)"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="6" fill="var(--mnl-curve)" />
    </svg>
  );
}

function analyseBoard(board: (number | null)[]) {
  const placed = board.filter((tile) => tile !== null).length;
  const boundaryIssues: EdgeIssue[] = [];
  const matchingIssues: EdgeIssue[] = [];
  let checkedAdjacencies = 0;

  board.forEach((tile, index) => {
    if (tile === null) return;
    const row = Math.floor(index / 4);
    const column = index % 4;
    if (row === 0 && hasPort(tile, "N")) boundaryIssues.push({ first: index, firstDirection: "N" });
    if (row === 3 && hasPort(tile, "S")) boundaryIssues.push({ first: index, firstDirection: "S" });
    if (column === 0 && hasPort(tile, "W")) boundaryIssues.push({ first: index, firstDirection: "W" });
    if (column === 3 && hasPort(tile, "E")) boundaryIssues.push({ first: index, firstDirection: "E" });
  });

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const index = row * 4 + column;
      if (column < 3 && board[index] !== null && board[index + 1] !== null) {
        checkedAdjacencies += 1;
        if (hasPort(board[index]!, "E") !== hasPort(board[index + 1]!, "W")) {
          matchingIssues.push({ first: index, firstDirection: "E", second: index + 1, secondDirection: "W" });
        }
      }
      if (row < 3 && board[index] !== null && board[index + 4] !== null) {
        checkedAdjacencies += 1;
        if (hasPort(board[index]!, "S") !== hasPort(board[index + 4]!, "N")) {
          matchingIssues.push({ first: index, firstDirection: "S", second: index + 4, secondDirection: "N" });
        }
      }
    }
  }

  const nonzeroPositions = board
    .map((tile, index) => (tile !== null && tile !== 0 ? index : -1))
    .filter((index) => index >= 0);
  const unseen = new Set(nonzeroPositions);
  let components = 0;
  while (unseen.size > 0) {
    components += 1;
    const start = unseen.values().next().value as number;
    unseen.delete(start);
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const row = Math.floor(current / 4);
      const column = current % 4;
      const neighbours: [number, Direction, Direction][] = [];
      if (column < 3) neighbours.push([current + 1, "E", "W"]);
      if (column > 0) neighbours.push([current - 1, "W", "E"]);
      if (row < 3) neighbours.push([current + 4, "S", "N"]);
      if (row > 0) neighbours.push([current - 4, "N", "S"]);
      for (const [next, outward, inward] of neighbours) {
        const nextTile = board[next];
        if (
          nextTile !== null &&
          nextTile !== 0 &&
          unseen.has(next) &&
          hasPort(board[current]!, outward) &&
          hasPort(nextTile, inward)
        ) {
          unseen.delete(next);
          queue.push(next);
        }
      }
    }
  }
  const complete = placed === 16;
  const correct = complete && boundaryIssues.length === 0 && matchingIssues.length === 0 && components === 1;
  return { placed, complete, boundaryIssues, matchingIssues, checkedAdjacencies, components, correct };
}

function issueMap(board: (number | null)[]) {
  const analysis = analyseBoard(board);
  const map = Array.from({ length: 16 }, () => new Set<Direction>());
  [...analysis.boundaryIssues, ...analysis.matchingIssues].forEach((issue) => {
    map[issue.first].add(issue.firstDirection);
    if (issue.second !== undefined && issue.secondDirection) map[issue.second].add(issue.secondDirection);
  });
  return map;
}

function epsilonDetails(board: number[]) {
  let inversions = 0;
  for (let first = 0; first < board.length; first += 1) {
    for (let second = first + 1; second < board.length; second += 1) {
      if (board[first] > board[second]) inversions += 1;
    }
  }
  const blankIndex = board.indexOf(0);
  const a0 = (blankIndex % 4) + 1;
  const b0 = 4 - Math.floor(blankIndex / 4);
  const exponent = inversions + a0 + b0;
  const epsilon: Epsilon = exponent % 2 === 0 ? 1 : -1;
  return { inversions, a0, b0, exponent, epsilon };
}

function sameState(first: number[], second: number[]) {
  return first.every((tile, index) => tile === second[index]);
}

function neighbouringIndices(index: number) {
  const row = Math.floor(index / 4);
  const column = index % 4;
  const neighbours: number[] = [];
  if (row > 0) neighbours.push(index - 4);
  if (row < 3) neighbours.push(index + 4);
  if (column > 0) neighbours.push(index - 1);
  if (column < 3) neighbours.push(index + 1);
  return neighbours;
}

function pickPuzzleSeedIndex(epsilon: Epsilon, avoidIndex?: number) {
  const candidates = PUZZLE_SEEDS
    .map((seed, index) => ({ seed, index }))
    .filter(({ seed, index }) => seed.epsilon === epsilon && index !== avoidIndex);
  return candidates[Math.floor(Math.random() * candidates.length)].index;
}

function pickChallengePairIndex(epsilon: Epsilon, avoidIndex?: number) {
  const candidates = CHALLENGE_PAIRS
    .map((pair, index) => ({ pair, index }))
    .filter(({ pair, index }) => pair.epsilon === epsilon && index !== avoidIndex);
  return candidates[Math.floor(Math.random() * candidates.length)].index;
}

function puzzleStateKey(state: number[]) {
  return state.map((tile) => tile.toString(16)).join("");
}

function manhattanDistance(state: number[], targetPositions: number[]) {
  let distance = 0;
  state.forEach((tile, index) => {
    if (tile === 0) return;
    const target = targetPositions[tile];
    distance += Math.abs(Math.floor(index / 4) - Math.floor(target / 4)) + Math.abs((index % 4) - (target % 4));
  });
  return distance;
}

function canReachWithin(start: number[], target: number[], maximumDistance: number) {
  if (maximumDistance < 0) return false;
  if (sameState(start, target)) return true;
  const targetPositions = Array(16).fill(0);
  target.forEach((tile, index) => { targetPositions[tile] = index; });
  const initialHeuristic = manhattanDistance(start, targetPositions);
  if (initialHeuristic > maximumDistance) return false;

  type SearchNode = { state: number[]; key: string; blank: number; steps: number; heuristic: number };
  const heap: SearchNode[] = [];
  const score = (node: SearchNode) => node.steps + node.heuristic;
  const push = (node: SearchNode) => {
    heap.push(node);
    let index = heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (score(heap[parent]) <= score(heap[index])) break;
      [heap[parent], heap[index]] = [heap[index], heap[parent]];
      index = parent;
    }
  };
  const pop = () => {
    const root = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < heap.length && score(heap[left]) < score(heap[smallest])) smallest = left;
        if (right < heap.length && score(heap[right]) < score(heap[smallest])) smallest = right;
        if (smallest === index) break;
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        index = smallest;
      }
    }
    return root;
  };

  const startKey = puzzleStateKey(start);
  const targetKey = puzzleStateKey(target);
  const bestSteps = new Map<string, number>([[startKey, 0]]);
  push({ state: [...start], key: startKey, blank: start.indexOf(0), steps: 0, heuristic: initialHeuristic });
  while (heap.length > 0) {
    const current = pop();
    if (current.key === targetKey) return true;
    if (current.steps >= maximumDistance) continue;
    for (const neighbour of neighbouringIndices(current.blank)) {
      const movedTile = current.state[neighbour];
      const next = [...current.state];
      next[current.blank] = movedTile;
      next[neighbour] = 0;
      const nextSteps = current.steps + 1;
      const oldDistance = Math.abs(Math.floor(neighbour / 4) - Math.floor(targetPositions[movedTile] / 4)) + Math.abs((neighbour % 4) - (targetPositions[movedTile] % 4));
      const newDistance = Math.abs(Math.floor(current.blank / 4) - Math.floor(targetPositions[movedTile] / 4)) + Math.abs((current.blank % 4) - (targetPositions[movedTile] % 4));
      const nextHeuristic = current.heuristic - oldDistance + newDistance;
      if (nextSteps + nextHeuristic > maximumDistance) continue;
      const key = puzzleStateKey(next);
      if ((bestSteps.get(key) ?? Infinity) <= nextSteps) continue;
      bestSteps.set(key, nextSteps);
      push({ state: next, key, blank: neighbour, steps: nextSteps, heuristic: nextHeuristic });
    }
  }
  return false;
}

function distanceAfterSlide(next: number[], target: number[], currentDistance: number) {
  if (sameState(next, target)) return 0;
  if (currentDistance === 0) return 1;
  return canReachWithin(next, target, currentDistance - 1) ? currentDistance - 1 : currentDistance + 1;
}

function findPuzzlePath(start: number[], target: number[], maximumDistance: number) {
  if (sameState(start, target)) return [];
  const targetPositions = Array(16).fill(0);
  target.forEach((tile, index) => { targetPositions[tile] = index; });
  const initialHeuristic = manhattanDistance(start, targetPositions);
  if (initialHeuristic > maximumDistance) return null;

  type PathNode = { state: number[]; key: string; blank: number; steps: number; heuristic: number };
  const heap: PathNode[] = [];
  const score = (node: PathNode) => node.steps + node.heuristic;
  const push = (node: PathNode) => {
    heap.push(node);
    let index = heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (score(heap[parent]) <= score(heap[index])) break;
      [heap[parent], heap[index]] = [heap[index], heap[parent]];
      index = parent;
    }
  };
  const pop = () => {
    const root = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < heap.length && score(heap[left]) < score(heap[smallest])) smallest = left;
        if (right < heap.length && score(heap[right]) < score(heap[smallest])) smallest = right;
        if (smallest === index) break;
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        index = smallest;
      }
    }
    return root;
  };

  const startKey = puzzleStateKey(start);
  const targetKey = puzzleStateKey(target);
  const bestSteps = new Map<string, number>([[startKey, 0]]);
  const parent = new Map<string, { previous: string; tile: number }>();
  push({ state: [...start], key: startKey, blank: start.indexOf(0), steps: 0, heuristic: initialHeuristic });
  while (heap.length > 0) {
    const current = pop();
    if (current.key === targetKey) {
      const path: number[] = [];
      let key = targetKey;
      while (key !== startKey) {
        const step = parent.get(key)!;
        path.push(step.tile);
        key = step.previous;
      }
      return path.reverse();
    }
    if (current.steps >= maximumDistance) continue;
    for (const neighbour of neighbouringIndices(current.blank)) {
      const movedTile = current.state[neighbour];
      const next = [...current.state];
      next[current.blank] = movedTile;
      next[neighbour] = 0;
      const nextSteps = current.steps + 1;
      const oldDistance = Math.abs(Math.floor(neighbour / 4) - Math.floor(targetPositions[movedTile] / 4)) + Math.abs((neighbour % 4) - (targetPositions[movedTile] % 4));
      const newDistance = Math.abs(Math.floor(current.blank / 4) - Math.floor(targetPositions[movedTile] / 4)) + Math.abs((current.blank % 4) - (targetPositions[movedTile] % 4));
      const nextHeuristic = current.heuristic - oldDistance + newDistance;
      if (nextSteps + nextHeuristic > maximumDistance) continue;
      const key = puzzleStateKey(next);
      if ((bestSteps.get(key) ?? Infinity) <= nextSteps) continue;
      bestSteps.set(key, nextSteps);
      parent.set(key, { previous: current.key, tile: movedTile });
      push({ state: next, key, blank: neighbour, steps: nextSteps, heuristic: nextHeuristic });
    }
  }
  return null;
}

function validatePublishedPuzzleData() {
  const allowedBlankPositions = new Set([9, 12, 13]);

  PUZZLE_SEEDS.forEach((seed, index) => {
    const inventory = [...seed.state].sort((first, second) => first - second);
    const partner = PUZZLE_SEEDS[seed.partner];
    const validInventory =
      seed.state.length === 16 &&
      inventory.every((tile, tileIndex) => tile === tileIndex);

    if (
      !validInventory ||
      !allowedBlankPositions.has(seed.state.indexOf(0)) ||
      !analyseBoard(seed.state).correct ||
      epsilonDetails(seed.state).epsilon !== seed.epsilon ||
      !partner ||
      partner.partner !== index ||
      partner.epsilon !== seed.epsilon ||
      sameState(seed.state, partner.state)
    ) {
      throw new Error(`Invalid published puzzle seed at index ${index}.`);
    }
  });

  CHALLENGE_PAIRS.forEach((pair, pairIndex) => {
    const start = PUZZLE_SEEDS[pair.x];
    const target = PUZZLE_SEEDS[pair.y];
    if (
      !start ||
      !target ||
      start.epsilon !== pair.epsilon ||
      target.epsilon !== pair.epsilon ||
      pair.path.length !== pair.distance
    ) {
      throw new Error(`Invalid published challenge pair at index ${pairIndex}.`);
    }

    const replay = [...start.state];
    pair.path.forEach((tile) => {
      const blank = replay.indexOf(0);
      const tileIndex = replay.indexOf(tile);
      if (!neighbouringIndices(blank).includes(tileIndex)) {
        throw new Error(`Illegal published challenge path at index ${pairIndex}.`);
      }
      replay[blank] = tile;
      replay[tileIndex] = 0;
    });

    if (!sameState(replay, target.state)) {
      throw new Error(`Published challenge path misses its target at index ${pairIndex}.`);
    }
  });
}

validatePublishedPuzzleData();

const KOLAM_LAB_STYLES = `
  .mnl-preview { --mnl-curve: var(--surface); color: var(--body); font-family: var(--sans); }
  .site-shell[data-theme="dark"] .mnl-preview { --mnl-curve: var(--ink); }
  .mnl-preview * { box-sizing: border-box; }
  .mnl-preview button, .mnl-preview input, .mnl-preview select { font: inherit; }
  .mnl-preview button:focus-visible, .mnl-preview input:focus-visible, .mnl-preview select:focus-visible,
  .mnl-stage-button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
  .mnl-sr-only { clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px; }
  .mnl-intro { border-bottom: 1px solid var(--rule); margin-bottom: 24px; padding-bottom: 18px; }
  .mnl-kicker { color: var(--clay); font-size: .68rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .mnl-intro h2 { font-size: clamp(1.75rem, 4vw, 3rem); margin: 6px 0 10px; }
  .mnl-intro p { color: var(--muted); font-size: .88rem; line-height: 1.6; margin: 0; max-width: 76ch; }
  .mnl-two-column, .mnl-compare { display: grid; gap: 24px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mnl-panel { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); min-width: 0; padding: 18px; box-shadow: var(--shadow); }
  .mnl-panel-head { align-items: center; display: flex; gap: 12px; justify-content: space-between; margin-bottom: 14px; }
  .mnl-panel-head h3 { font-size: 1.15rem; }
  .mnl-count { color: var(--clay); font-family: var(--serif); font-size: 1.7rem; line-height: 1; }
  .mnl-count small { color: var(--muted); font-family: var(--sans); font-size: .62rem; margin-left: 5px; text-transform: uppercase; }
  .mnl-grid { background: var(--surface-muted); border: 3px solid var(--ink); display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); overflow: hidden; width: 100%; }
  .mnl-cell, .mnl-tray-cell { aspect-ratio: 1; background: var(--surface); border: 0; border-bottom: 1px solid var(--rule); border-right: 1px solid var(--rule); min-width: 0; padding: 0; position: relative; }
  .mnl-cell:nth-child(4n), .mnl-tray-cell:nth-child(4n) { border-right: 0; }
  .mnl-cell:nth-child(n+13), .mnl-tray-cell:nth-child(n+13) { border-bottom: 0; }
  .mnl-cell[aria-pressed="true"], .mnl-tray-tile[aria-pressed="true"], .mnl-cell.mnl-movable { box-shadow: inset 0 0 0 4px var(--accent); z-index: 2; }
  .mnl-cell:disabled { cursor: default; opacity: 1; }
  .mnl-cell.mnl-recent { box-shadow: inset 0 0 0 5px var(--clay); }
  .mnl-empty { background: color-mix(in srgb, var(--surface-muted) 74%, var(--surface)); color: var(--muted); }
  .mnl-empty-mark { font-size: .68rem; inset: 50% auto auto 50%; position: absolute; transform: translate(-50%, -50%); }
  .mnl-tile-art { display: block; height: 100%; pointer-events: none; width: 100%; }
  .mnl-label { background: var(--ink); border-radius: 2px; color: var(--canvas); font-size: clamp(.47rem, .9vw, .66rem); left: 4px; line-height: 1; padding: 4px; position: absolute; top: 4px; z-index: 4; }
  .mnl-tray-cell { overflow: hidden; }
  .mnl-tray-tile { background: transparent; border: 0; height: 100%; padding: 0; width: 100%; }
  .mnl-used { align-items: center; color: var(--muted); display: flex; font-size: .58rem; height: 100%; justify-content: center; text-transform: uppercase; }
  .mnl-edge { background: var(--ink); pointer-events: none; position: absolute; z-index: 5; }
  .mnl-edge-n, .mnl-edge-s { height: 4px; left: 8%; right: 8%; }
  .mnl-edge-e, .mnl-edge-w { bottom: 8%; top: 8%; width: 4px; }
  .mnl-edge-n { top: 0; } .mnl-edge-s { bottom: 0; } .mnl-edge-e { right: 0; } .mnl-edge-w { left: 0; }
  .mnl-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 16px; }
  .mnl-button, .mnl-toggle button, .mnl-select { background: var(--chip-bg); border: 1px solid var(--rule-dark); border-radius: var(--radius); color: var(--chip-text); min-height: 42px; padding: 9px 13px; }
  .mnl-button:hover:not(:disabled), .mnl-toggle button:hover:not(:disabled), .mnl-select:hover { border-color: var(--accent); color: var(--accent-hover); }
  .mnl-button:disabled, .mnl-toggle button:disabled { cursor: not-allowed; opacity: .48; }
  .mnl-button-primary, .mnl-toggle button[aria-pressed="true"] { background: var(--chip-selected-bg); color: var(--chip-selected-text); }
  .mnl-checkbox { align-items: center; color: var(--muted); display: flex; font-size: .72rem; gap: 7px; }
  .mnl-checkbox input { accent-color: var(--accent); }
  .mnl-validation { background: var(--surface-muted); display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); margin-top: 14px; padding: 12px; }
  .mnl-validation span { color: var(--muted); font-size: .66rem; text-align: center; }
  .mnl-validation strong { color: var(--ink); display: block; font-size: 1rem; }
  .mnl-success { background: var(--accent); color: var(--canvas); font-size: .72rem; font-weight: 700; padding: 8px 12px; text-align: center; }
  .mnl-status { color: var(--muted); font-size: .74rem; line-height: 1.5; margin: 13px 0 0; min-height: 1.2em; }
  .mnl-ghost { height: 82px; opacity: .88; pointer-events: none; position: fixed; transform: translate(-50%, -50%); width: 82px; z-index: 200; }
  .mnl-stats { display: flex; gap: 15px; }
  .mnl-stat { color: var(--muted); font-size: .62rem; text-align: right; text-transform: uppercase; }
  .mnl-stat strong { color: var(--clay); display: block; font-family: var(--serif); font-size: 1.55rem; }
  .mnl-orbit { background: var(--surface-muted); margin: 20px auto 0; max-width: 680px; padding: 16px; }
  .mnl-orbit-head { align-items: center; display: flex; gap: 16px; justify-content: space-between; }
  .mnl-orbit h3 { font-size: 1.15rem; }
  .mnl-toggle { background: var(--surface); border-radius: var(--radius); display: flex; padding: 3px; }
  .mnl-toggle button { border: 0; min-width: 48px; }
  .mnl-epsilon { align-items: center; background: var(--ink); color: var(--canvas); display: grid; grid-template-columns: 1fr auto; margin-top: 12px; padding: 12px 14px; }
  .mnl-epsilon strong { font-family: var(--serif); font-size: 2.2rem; grid-area: 1 / 2 / span 2; }
  .mnl-epsilon small { color: color-mix(in srgb, var(--canvas) 70%, transparent); }
  .mnl-details { border-top: 1px solid var(--rule); font-size: .72rem; margin-top: 12px; padding-top: 10px; }
  .mnl-details summary { color: var(--accent-hover); font-weight: 700; }
  .mnl-details dl { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
  .mnl-details dl div { background: var(--surface); padding: 8px; }
  .mnl-details dt { color: var(--muted); font-size: .6rem; text-transform: uppercase; }
  .mnl-details dd { color: var(--ink); margin: 2px 0 0; }
  .mnl-letter { align-items: center; background: var(--ink); border-radius: 50%; color: var(--canvas); display: inline-flex; font-family: var(--serif); height: 32px; justify-content: center; width: 32px; }
  .mnl-compare-title { align-items: center; display: flex; gap: 9px; }
  .mnl-target .mnl-grid { border-color: var(--clay); }
  .mnl-target .mnl-letter { background: var(--clay); }
  .mnl-slide-panel { margin-inline: auto; max-width: 700px; }
  .mnl-octa-layout { display: grid; gap: 20px; grid-template-columns: 250px minmax(0, 1fr); }
  .mnl-reps { display: grid; gap: 10px; }
  .mnl-rep { align-items: center; background: var(--surface); border: 1px solid var(--rule); color: var(--body); display: grid; gap: 9px; grid-template-columns: 90px 1fr; min-height: 94px; padding: 8px; text-align: left; }
  .mnl-rep[aria-pressed="true"] { border-color: var(--accent); box-shadow: inset 3px 0 0 var(--accent); }
  .mnl-rep strong, .mnl-rep small { display: block; }
  .mnl-rep small { color: var(--muted); margin-top: 3px; }
  .mnl-mini { display: block; width: 90px; }
  .mnl-mini-face { fill: var(--clay-soft); stroke: var(--rule-dark); stroke-width: .8; }
  .mnl-mini-curve { fill: none; stroke: var(--mnl-curve); stroke-linecap: round; stroke-linejoin: round; stroke-width: 4; }
  .mnl-mini-dot { fill: var(--mnl-curve); }
  .mnl-viewer-head { align-items: center; display: flex; gap: 16px; justify-content: space-between; margin-bottom: 10px; }
  .mnl-viewer-head small { color: var(--muted); display: block; font-size: .62rem; letter-spacing: .08em; text-transform: uppercase; }
  .mnl-arm-badge { background: var(--surface-muted); color: var(--ink); font-family: var(--serif); padding: 7px 10px; }
  .mnl-stage-button { background: transparent; border: 0; display: block; padding: 0; text-align: initial; width: 100%; }
  .mnl-stage { background: var(--surface-muted); border: 1px solid var(--rule); display: block; touch-action: none; width: 100%; }
  .mnl-stage:hover { cursor: grab; }
  .mnl-stage.is-dragging { cursor: grabbing; }
  .mnl-stage-wrap { position: relative; }
  .mnl-stage-hint { background: var(--surface); bottom: 9px; color: var(--muted); font-size: .65rem; left: 9px; padding: 5px 7px; pointer-events: none; position: absolute; }
  .mnl-fold { align-items: center; display: grid; gap: 9px; grid-template-columns: auto 1fr 52px; margin-top: 12px; }
  .mnl-fold input { accent-color: var(--accent); width: 100%; }
  .mnl-fold output { color: var(--ink); text-align: right; }
  .mnl-tool-row { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 10px; }
  .mnl-divider { align-self: stretch; border-left: 1px solid var(--rule); margin: 3px 2px; }
  .mnl-octa-face { fill: var(--clay); stroke: var(--rule-dark); stroke-width: 1.2; }
  .mnl-octa-curve { fill: none; stroke: var(--mnl-curve); stroke-linecap: round; stroke-linejoin: round; stroke-width: 8; }
  .mnl-octa-dot { fill: var(--mnl-curve); stroke: var(--clay); stroke-width: 1; }
  .mnl-graph-edge { stroke: var(--ink); stroke-width: 4; }
  .mnl-graph-node { fill: var(--accent); stroke: var(--surface); stroke-width: 2; }
  .mnl-octa-label { fill: var(--ink); font: 700 16px var(--sans); paint-order: stroke; stroke: var(--mnl-curve); stroke-width: 4px; }
  @media (max-width: 900px) { .mnl-octa-layout { grid-template-columns: 1fr; } .mnl-reps { grid-template-columns: repeat(3, 1fr); } .mnl-rep { grid-template-columns: 1fr; text-align: center; } .mnl-mini { margin: auto; } }
  @media (max-width: 560px) {
    .mnl-panel { padding: 12px; }
    .mnl-panel-head { align-items: flex-start; }
    .mnl-two-column, .mnl-compare { gap: 5px; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
    .mnl-two-column > .mnl-panel, .mnl-compare > .mnl-panel { border-radius: 4px; padding: 5px; }
    .mnl-two-column .mnl-panel-head, .mnl-compare .mnl-panel-head { gap: 4px; margin-bottom: 6px; min-width: 0; }
    .mnl-two-column .mnl-panel-head > *, .mnl-compare .mnl-panel-head > * { min-width: 0; }
    .mnl-two-column .mnl-panel-head h3, .mnl-compare .mnl-panel-head h3 { font-size: .72rem; line-height: 1.08; overflow-wrap: anywhere; }
    .mnl-two-column .mnl-kicker, .mnl-compare .mnl-kicker { font-size: 11px; letter-spacing: .04em; }
    .mnl-two-column .mnl-count { flex: 0 0 auto; font-size: 1.05rem; text-align: right; }
    .mnl-two-column .mnl-count small { display: block; font-size: 11px; line-height: 1.1; margin: 1px 0 0; }
    .mnl-two-column .mnl-checkbox { flex: 0 1 66px; font-size: 11px; gap: 3px; line-height: 1.1; }
    .mnl-two-column .mnl-checkbox input { flex: 0 0 auto; height: 13px; margin: 0; width: 13px; }
    .mnl-two-column .mnl-grid, .mnl-compare .mnl-grid { border-width: 2px; }
    .mnl-two-column .mnl-cell[aria-pressed="true"], .mnl-two-column .mnl-tray-tile[aria-pressed="true"],
    .mnl-compare .mnl-cell.mnl-movable { box-shadow: inset 0 0 0 2px var(--accent); }
    .mnl-compare .mnl-cell.mnl-recent { box-shadow: inset 0 0 0 3px var(--clay); }
    .mnl-two-column .mnl-label { font-size: 11px; left: 1px; padding: 2px; top: 1px; }
    .mnl-two-column .mnl-empty-mark { font-size: 11px; }
    .mnl-two-column .mnl-used { font-size: 11px; line-height: 1; text-align: center; }
    .mnl-two-column .mnl-validation { gap: 2px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 6px; padding: 4px 2px; }
    .mnl-two-column .mnl-validation span { font-size: 11px; line-height: 1.15; overflow-wrap: anywhere; }
    .mnl-two-column .mnl-validation strong { font-size: .75rem; }
    .mnl-two-column .mnl-actions { gap: 3px; margin-top: 6px; }
    .mnl-two-column .mnl-button { font-size: 11px; min-height: 28px; padding: 4px 6px; }
    .mnl-two-column .mnl-success, .mnl-compare .mnl-success { font-size: 11px; padding: 5px 3px; }
    .mnl-compare .mnl-panel-head { display: grid; grid-template-columns: minmax(0, 1fr); }
    .mnl-compare .mnl-compare-title { gap: 4px; }
    .mnl-compare .mnl-letter { flex: 0 0 auto; font-size: .72rem; height: 21px; width: 21px; }
    .mnl-compare .mnl-stats { gap: 8px; justify-content: flex-start; }
    .mnl-compare .mnl-stat { font-size: 11px; text-align: left; }
    .mnl-compare .mnl-stat strong { font-size: .9rem; }
    .mnl-compare + .mnl-actions { gap: 4px; margin-top: 9px; }
    .mnl-compare + .mnl-actions .mnl-button { font-size: 11px; min-height: 34px; padding: 5px 8px; }
    .mnl-reps { grid-template-columns: 1fr; }
    .mnl-rep { grid-template-columns: 80px 1fr; text-align: left; }
    .mnl-slide-panel .mnl-validation,
    .mnl-details dl { grid-template-columns: 1fr; }
    .mnl-fold { grid-template-columns: 1fr 48px; }
    .mnl-fold .mnl-button { grid-column: 1 / -1; }
  }
  @media (prefers-reduced-motion: reduce) { .mnl-preview *, .mnl-preview *::before, .mnl-preview *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
`;

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return <div className="mnl-preview"><style>{KOLAM_LAB_STYLES}</style>{children}</div>;
}

function Intro({ sandbox, title, children }: { sandbox: string; title: string; children: React.ReactNode }) {
  return (
    <header className="mnl-intro">
      <span className="mnl-kicker">{sandbox}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </header>
  );
}

function EdgeAlerts({ edges }: { edges: Set<Direction> }) {
  return (["N", "E", "S", "W"] as Direction[]).map((direction) =>
    edges.has(direction) ? <span className={`mnl-edge mnl-edge-${direction.toLowerCase()}`} key={direction} aria-hidden="true" /> : null,
  );
}

export function SquareKolamChallengePreview() {
  const [board, setBoard] = useState<(number | null)[]>(EMPTY_BOARD);
  const [past, setPast] = useState<(number | null)[][]>([]);
  const [future, setFuture] = useState<(number | null)[][]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [targetCell, setTargetCell] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [announcement, setAnnouncement] = useState("The board is empty. Choose a tile to begin.");
  const pointerDrag = useRef<PointerDrag | null>(null);
  const suppressClick = useRef(false);
  const [dragGhost, setDragGhost] = useState<{ tile: number; x: number; y: number } | null>(null);

  const analysis = useMemo(() => analyseBoard(board), [board]);
  const available = useMemo(() => new Set(TILE_VALUES.filter((tile) => !board.includes(tile))), [board]);
  const issues = useMemo(() => issueMap(board), [board]);

  useEffect(() => {
    const cancel = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelection(null);
        setTargetCell(null);
      }
    };
    window.addEventListener("keydown", cancel);
    return () => window.removeEventListener("keydown", cancel);
  }, []);

  function commit(next: (number | null)[], message: string) {
    if (next.every((tile, index) => tile === board[index])) return;
    setPast((history) => [...history, board]);
    setFuture([]);
    setBoard(next);
    setSelection(null);
    setTargetCell(null);
    setAnnouncement(message);
  }

  function place(tile: number, source: TileSource, destination: number) {
    const next = [...board];
    const displaced = next[destination];
    if (source.kind === "board") {
      if (source.index === destination) {
        setSelection(null);
        return;
      }
      next[source.index] = displaced;
    }
    next[destination] = tile;
    commit(next, `Tile ${word(tile)} placed at ${coordinate(destination)}${displaced !== null ? "; tiles swapped" : ""}.`);
  }

  function returnTile(source: TileSource, tile: number) {
    if (source.kind !== "board") return;
    const next = [...board];
    if (next[source.index] !== tile) return;
    next[source.index] = null;
    commit(next, `Tile ${word(tile)} returned to the tray.`);
  }

  function chooseTrayTile(tile: number) {
    if (!available.has(tile)) return;
    if (targetCell !== null) {
      place(tile, { kind: "tray" }, targetCell);
      return;
    }
    if (selection?.tile === tile && selection.source.kind === "tray") {
      setSelection(null);
      setAnnouncement(`Tile ${word(tile)} deselected.`);
    } else {
      setSelection({ tile, source: { kind: "tray" } });
      setAnnouncement(`Tile ${word(tile)} selected. Choose a board cell.`);
    }
  }

  function chooseCell(index: number) {
    if (selection) {
      place(selection.tile, selection.source, index);
      return;
    }
    const tile = board[index];
    if (tile !== null) {
      setSelection({ tile, source: { kind: "board", index } });
      setTargetCell(null);
      setAnnouncement(`Tile ${word(tile)} selected at ${coordinate(index)}. Choose another cell or return it to the tray.`);
    } else {
      const nextTarget = targetCell === index ? null : index;
      setTargetCell(nextTarget);
      setAnnouncement(nextTarget === null ? `Cell ${coordinate(index)} deselected.` : `Cell ${coordinate(index)} selected. Choose a tile from the tray.`);
    }
  }

  function beginPointerDrag(event: ReactPointerEvent<HTMLElement>, tile: number, source: TileSource) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    pointerDrag.current = { tile, source, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePointerDrag(event: ReactPointerEvent<HTMLElement>) {
    const active = pointerDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);
    if (!active.dragging && distance < 8) return;
    event.preventDefault();
    active.dragging = true;
    suppressClick.current = true;
    setDragGhost({ tile: active.tile, x: event.clientX, y: event.clientY });
  }

  function endPointerDrag(event: ReactPointerEvent<HTMLElement>) {
    const active = pointerDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    pointerDrag.current = null;
    setDragGhost(null);
    if (!active.dragging) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const cell = target?.closest<HTMLElement>("[data-mnl-drop-cell]");
    const tray = target?.closest<HTMLElement>("[data-mnl-drop-tray]");
    if (cell) place(active.tile, active.source, Number(cell.dataset.mnlDropCell));
    else if (tray && active.source.kind === "board") returnTile(active.source, active.tile);
    else setAnnouncement(`Tile ${word(active.tile)} was not moved.`);
    window.setTimeout(() => { suppressClick.current = false; }, 0);
  }

  function cancelPointerDrag() {
    pointerDrag.current = null;
    setDragGhost(null);
    window.setTimeout(() => { suppressClick.current = false; }, 0);
  }

  function guardedClick(event: ReactMouseEvent, action: () => void) {
    if (suppressClick.current) event.preventDefault();
    else action();
  }

  function undo() {
    const previous = past[past.length - 1];
    if (!previous) return;
    setFuture((states) => [board, ...states]);
    setPast((states) => states.slice(0, -1));
    setBoard(previous);
    setSelection(null);
    setTargetCell(null);
    setAnnouncement("Last move undone.");
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setPast((states) => [...states, board]);
    setFuture((states) => states.slice(1));
    setBoard(next);
    setSelection(null);
    setTargetCell(null);
    setAnnouncement("Move restored.");
  }

  function keyboardCell(event: ReactKeyboardEvent, index: number) {
    const row = Math.floor(index / 4);
    const column = index % 4;
    const destination =
      event.key === "ArrowUp" && row > 0 ? index - 4 :
      event.key === "ArrowDown" && row < 3 ? index + 4 :
      event.key === "ArrowLeft" && column > 0 ? index - 1 :
      event.key === "ArrowRight" && column < 3 ? index + 1 : null;
    if (destination !== null) {
      event.preventDefault();
      document.getElementById(`mnl-board-cell-${destination}`)?.focus();
    }
    if ((event.key === "Delete" || event.key === "Backspace") && board[index] !== null) {
      event.preventDefault();
      returnTile({ kind: "board", index }, board[index]!);
    }
  }

  return (
    <PreviewFrame>
      <Intro sandbox="Sandbox 01" title="Square Kolam Tile Challenge">
        Build a square kolam by placing each of the sixteen tiles exactly once. <strong>How to play:</strong> drag a tile from the tile grid to the construction board. You can also select a tile, then select a cell. Drag a board tile back to the tile grid to return it.
      </Intro>
      <section className="mnl-two-column" aria-label="Kolam tile builder">
        <div className="mnl-panel">
          <div className="mnl-panel-head"><div><span className="mnl-kicker">01</span><h3>Construction board</h3></div><span className="mnl-count">{analysis.placed}<small>/16 placed</small></span></div>
          <div className="mnl-grid" role="group" aria-label="Four by four construction grid">
            {board.map((tile, index) => {
              const selected = selection?.source.kind === "board" && selection.source.index === index;
              return (
                <button
                  id={`mnl-board-cell-${index}`}
                  className={`mnl-cell ${tile === null ? "mnl-empty" : ""}`}
                  key={index}
                  type="button"
                  aria-label={tile === null ? `Empty cell ${coordinate(index)}` : `Cell ${coordinate(index)}, tile ${word(tile)}`}
                  aria-pressed={selected || targetCell === index}
                  data-mnl-drop-cell={index}
                  onClick={(event) => guardedClick(event, () => chooseCell(index))}
                  onKeyDown={(event) => keyboardCell(event, index)}
                  onPointerDown={(event) => tile !== null && beginPointerDrag(event, tile, { kind: "board", index })}
                  onPointerMove={movePointerDrag}
                  onPointerUp={endPointerDrag}
                  onPointerCancel={cancelPointerDrag}
                >
                  {tile === null ? <span className="mnl-empty-mark" aria-hidden="true">{index + 1}</span> : <><KolamArt tile={tile} />{showLabels ? <span className="mnl-label">{word(tile)}</span> : null}</>}
                  <EdgeAlerts edges={issues[index]} />
                </button>
              );
            })}
          </div>
          {analysis.correct ? <div className="mnl-success" role="status">Correct configuration</div> : null}
          <div className="mnl-validation" aria-label="Validation summary">
            <span><strong>{analysis.boundaryIssues.length}</strong>boundary issues</span>
            <span><strong>{analysis.matchingIssues.length}</strong>matching issues</span>
            <span><strong>{analysis.components}</strong>nonzero components</span>
          </div>
          <div className="mnl-actions" aria-label="Board controls">
            <button className="mnl-button" type="button" onClick={undo} disabled={past.length === 0}>↶ Undo</button>
            <button className="mnl-button" type="button" onClick={redo} disabled={future.length === 0}>↷ Redo</button>
            <button className="mnl-button" type="button" onClick={() => selection && returnTile(selection.source, selection.tile)} disabled={selection?.source.kind !== "board"}>Return tile</button>
            <button className="mnl-button" type="button" onClick={() => commit([...EMPTY_BOARD], "Board cleared.")} disabled={analysis.placed === 0}>Clear</button>
            <button className="mnl-button mnl-button-primary" type="button" onClick={() => commit([...VALID_EXAMPLE], "A valid example has been loaded.")}>Load example</button>
          </div>
        </div>

        <section className="mnl-panel" aria-labelledby="mnl-tray-heading" data-mnl-drop-tray>
          <div className="mnl-panel-head">
            <div><span className="mnl-kicker">02</span><h3 id="mnl-tray-heading">Kolam tiles</h3></div>
            <label className="mnl-checkbox"><input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} /><span>Show labels on board</span></label>
          </div>
          <div className="mnl-grid" role="list" aria-label="Sixteen kolam tiles in increasing binary order">
            {TILE_VALUES.map((tile) => {
              const inTray = available.has(tile);
              const selected = selection?.tile === tile && selection.source.kind === "tray";
              return (
                <div className="mnl-tray-cell" role="listitem" key={tile}>
                  {inTray ? (
                    <button
                      type="button"
                      className="mnl-tray-tile"
                      aria-label={`Tile ${word(tile)}: ${tileDescription(tile)}`}
                      aria-pressed={selected}
                      onClick={(event) => guardedClick(event, () => chooseTrayTile(tile))}
                      onPointerDown={(event) => beginPointerDrag(event, tile, { kind: "tray" })}
                      onPointerMove={movePointerDrag}
                      onPointerUp={endPointerDrag}
                      onPointerCancel={cancelPointerDrag}
                    ><KolamArt tile={tile} /></button>
                  ) : <div className="mnl-used" aria-label={`Tile ${word(tile)} is on the board`}>On board</div>}
                  <span className="mnl-label">{word(tile)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </section>
      <p className="mnl-status" aria-live="polite">{announcement}</p>
      {dragGhost ? <div className="mnl-ghost" style={{ left: dragGhost.x, top: dragGhost.y }} aria-hidden="true"><KolamArt tile={dragGhost.tile} /><span className="mnl-label">{word(dragGhost.tile)}</span></div> : null}
    </PreviewFrame>
  );
}

function PuzzleBoard({
  board,
  movable = new Set<number>(),
  onMove,
  disabled = false,
  label,
  fixed = false,
  recent = null,
  issues,
  cellContext,
}: {
  board: number[];
  movable?: Set<number>;
  onMove?: (index: number) => void;
  disabled?: boolean;
  label: string;
  fixed?: boolean;
  recent?: number | null;
  issues?: Set<Direction>[];
  cellContext?: string;
}) {
  return (
    <div className="mnl-grid" role="group" aria-label={label}>
      {board.map((tile, index) => {
        const blank = tile === 0;
        const canMove = !fixed && !disabled && movable.has(index);
        const content = <>{!blank ? <KolamArt tile={tile} /> : null}{issues ? <EdgeAlerts edges={issues[index]} /> : null}</>;
        if (fixed) {
          return (
            <div
              className={`mnl-cell ${blank ? "mnl-empty" : ""}`}
              key={`fixed-${index}`}
              role="img"
              aria-label={blank ? `Open space in target cell ${index + 1}` : `Target tile ${word(tile)} in cell ${index + 1}`}
            >
              {content}
            </div>
          );
        }
        return (
          <button
            className={`mnl-cell ${blank ? "mnl-empty" : ""} ${canMove ? "mnl-movable" : ""} ${recent === index ? "mnl-recent" : ""}`}
            key={`${tile}-${index}`}
            type="button"
            aria-label={
              blank
                ? `Open space${cellContext ? ` in ${cellContext}` : ""}`
                : cellContext
                  ? `Tile ${word(tile)} in ${cellContext}${canMove ? ", available to move" : ""}`
                  : `Tile ${word(tile)} at ${coordinate(index)}${canMove ? ", available to move" : ""}`
            }
            disabled={!canMove}
            onClick={() => onMove?.(index)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

function EpsilonToggle({ value, onChange, disabled = false, label = "Choose epsilon value" }: {
  value: Epsilon;
  onChange: (value: Epsilon) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="mnl-toggle" role="group" aria-label={label}>
      {([1, -1] as Epsilon[]).map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          disabled={disabled}
        >
          {option > 0 ? "+1" : "−1"}
        </button>
      ))}
    </div>
  );
}

export function SlideKolamPreview() {
  const [selectedEpsilon, setSelectedEpsilon] = useState<Epsilon>(1);
  const [seedIndex, setSeedIndex] = useState(DEFAULT_PUZZLE_SEED_INDEX);
  const [startState, setStartState] = useState<number[]>([...PUZZLE_SEEDS[DEFAULT_PUZZLE_SEED_INDEX].state]);
  const [puzzle, setPuzzle] = useState<number[]>([...PUZZLE_SEEDS[DEFAULT_PUZZLE_SEED_INDEX].state]);
  const [moves, setMoves] = useState(0);
  const [stepsAway, setStepsAway] = useState(PUZZLE_SEEDS[DEFAULT_PUZZLE_SEED_INDEX].distance);
  const [announcement, setAnnouncement] = useState("A correct configuration is ready. Move a tile beside the empty cell.");

  const analysis = useMemo(() => analyseBoard(puzzle), [puzzle]);
  const epsilon = useMemo(() => epsilonDetails(puzzle), [puzzle]);
  const blankIndex = puzzle.indexOf(0);
  const movable = useMemo(() => new Set(neighbouringIndices(blankIndex)), [blankIndex]);
  const targetState = PUZZLE_SEEDS[PUZZLE_SEEDS[seedIndex].partner].state;
  const solved = moves > 0 && analysis.correct && !sameState(puzzle, startState);
  const issues = useMemo(() => issueMap(puzzle), [puzzle]);

  function loadFreshState(nextEpsilon: Epsilon) {
    const nextSeedIndex = pickPuzzleSeedIndex(nextEpsilon, seedIndex);
    const nextSeed = PUZZLE_SEEDS[nextSeedIndex];
    const next = [...nextSeed.state];
    setSelectedEpsilon(nextEpsilon);
    setSeedIndex(nextSeedIndex);
    setStartState(next);
    setPuzzle([...next]);
    setMoves(0);
    setStepsAway(nextSeed.distance);
    setAnnouncement(`A new correct configuration with epsilon ${nextEpsilon > 0 ? "plus one" : "minus one"} is ready.`);
  }

  function moveTile(index: number) {
    if (!movable.has(index) || solved) return;
    const next = [...puzzle];
    const tile = next[index];
    next[blankIndex] = tile;
    next[index] = 0;
    const nextAnalysis = analyseBoard(next);
    const nextSolved = nextAnalysis.correct && !sameState(next, startState);
    setPuzzle(next);
    setMoves((count) => count + 1);
    setStepsAway(nextSolved ? 0 : distanceAfterSlide(next, targetState, stepsAway));
    setAnnouncement(nextSolved ? "Success: you reached a different correct configuration." : `Tile ${word(tile)} moved into the empty cell.`);
  }

  function resetPuzzle() {
    setPuzzle([...startState]);
    setMoves(0);
    setStepsAway(PUZZLE_SEEDS[seedIndex].distance);
    setAnnouncement("The puzzle has been reset to its most recent correct starting configuration.");
  }

  return (
    <PreviewFrame>
      <Intro sandbox="Sandbox 02" title="Slide to a new kolam">
        <strong>How to play:</strong> select any highlighted tile beside the open space. The tile moves into that space. Reach a different correct configuration while watching the exact distance indicator.
      </Intro>
      <section className="mnl-panel mnl-slide-panel" aria-label="Kolam fifteen puzzle">
        <div className="mnl-panel-head">
          <h3>15-puzzle board</h3>
          <div className="mnl-stats">
            <span className="mnl-stat"><strong>{moves}</strong>{moves === 1 ? "move" : "moves"}</span>
            <span className="mnl-stat"><strong>{stepsAway}</strong>{stepsAway === 1 ? "step to next configuration" : "steps to next configuration"}</span>
          </div>
        </div>
        <PuzzleBoard board={puzzle} movable={movable} onMove={moveTile} disabled={solved} label="Four by four sliding puzzle" issues={issues} />
        {solved ? <div className="mnl-success" role="status">New correct configuration</div> : null}
        <div className="mnl-actions" aria-label="Puzzle controls">
          <button className="mnl-button mnl-button-primary" type="button" onClick={() => loadFreshState(selectedEpsilon)}>Scramble</button>
          <button className="mnl-button" type="button" onClick={resetPuzzle} disabled={moves === 0}>Reset</button>
        </div>
      </section>
      <section className="mnl-orbit" aria-labelledby="mnl-slide-epsilon-heading">
        <div className="mnl-orbit-head">
          <div><span className="mnl-kicker">Choose an orbit</span><h3 id="mnl-slide-epsilon-heading"><KaTeXMath tex={String.raw`\varepsilon`} /> value</h3></div>
          <EpsilonToggle value={selectedEpsilon} onChange={loadFreshState} />
        </div>
        <div className="mnl-epsilon" aria-live="polite"><span><KaTeXMath tex={String.raw`\varepsilon(X)`} /></span><strong>{epsilon.epsilon > 0 ? "+1" : "−1"}</strong><small>Invariant under every legal slide</small></div>
        <details className="mnl-details">
          <summary>How this value is computed</summary>
          <p>
            Read the sixteen entries row by row, counting the empty cell as <code>0000</code>. If {" "}
            <KaTeXMath tex="N" /> is the inversion count and the empty cell is at {" "}
            <KaTeXMath tex="(a_0,b_0)" />, then <KaTeXMath tex={String.raw`\varepsilon(X)=(-1)^{N+a_0+b_0}`} />.
          </p>
          <dl>
            <div><dt>N</dt><dd>{epsilon.inversions}</dd></div>
            <div><dt><KaTeXMath tex="(a_0,b_0)" /></dt><dd>({epsilon.a0},{epsilon.b0})</dd></div>
            <div><dt>Exponent</dt><dd>{epsilon.exponent} · {epsilon.exponent % 2 === 0 ? "even" : "odd"}</dd></div>
          </dl>
        </details>
      </section>
      <p className="mnl-status mnl-sr-only" aria-live="polite">{announcement}</p>
    </PreviewFrame>
  );
}

export function MoveKolamPreview() {
  const [selectedEpsilon, setSelectedEpsilon] = useState<Epsilon>(1);
  const [pairIndex, setPairIndex] = useState(DEFAULT_CHALLENGE_PAIR_INDEX);
  const [isReversed, setIsReversed] = useState(false);
  const defaultPair = CHALLENGE_PAIRS[DEFAULT_CHALLENGE_PAIR_INDEX];
  const [puzzle, setPuzzle] = useState<number[]>([...PUZZLE_SEEDS[defaultPair.x].state]);
  const [moves, setMoves] = useState(0);
  const [stepsAway, setStepsAway] = useState(defaultPair.distance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("Configuration X is ready. Match it to configuration Y.");
  const animationToken = useRef(0);
  const highlightTimer = useRef<number | null>(null);
  const initialPairChosen = useRef(false);

  const selectedPair = CHALLENGE_PAIRS[pairIndex];
  const startState = PUZZLE_SEEDS[isReversed ? selectedPair.y : selectedPair.x].state;
  const targetState = PUZZLE_SEEDS[isReversed ? selectedPair.x : selectedPair.y].state;
  const blankIndex = puzzle.indexOf(0);
  const movable = useMemo(() => new Set(neighbouringIndices(blankIndex)), [blankIndex]);
  const solved = sameState(puzzle, targetState);

  useEffect(() => {
    if (initialPairChosen.current) return;
    initialPairChosen.current = true;
    const randomPairIndex = pickChallengePairIndex(1);
    const randomPair = CHALLENGE_PAIRS[randomPairIndex];
    const reverse = Math.random() < 0.5;
    setPairIndex(randomPairIndex);
    setIsReversed(reverse);
    setPuzzle([...PUZZLE_SEEDS[reverse ? randomPair.y : randomPair.x].state]);
    setStepsAway(randomPair.distance);
    setAnnouncement("A random pair with epsilon plus one is ready.");
  }, []);

  useEffect(() => () => {
    animationToken.current += 1;
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
  }, []);

  function flashMovedTile(index: number) {
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    setHighlightedIndex(index);
    highlightTimer.current = window.setTimeout(() => setHighlightedIndex(null), 720);
  }

  function loadPair(nextEpsilon: Epsilon) {
    animationToken.current += 1;
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    const nextPairIndex = pickChallengePairIndex(nextEpsilon, pairIndex);
    const nextPair = CHALLENGE_PAIRS[nextPairIndex];
    const reverse = Math.random() < 0.5;
    const nextStart = PUZZLE_SEEDS[reverse ? nextPair.y : nextPair.x].state;
    setSelectedEpsilon(nextEpsilon);
    setPairIndex(nextPairIndex);
    setIsReversed(reverse);
    setPuzzle([...nextStart]);
    setMoves(0);
    setStepsAway(nextPair.distance);
    setIsAnimating(false);
    setHighlightedIndex(null);
    setAnnouncement(`A new pair with epsilon ${nextEpsilon > 0 ? "plus one" : "minus one"} is ready.`);
  }

  function moveChallengeTile(index: number) {
    if (isAnimating || solved || !movable.has(index)) return;
    const next = [...puzzle];
    const tile = next[index];
    next[blankIndex] = tile;
    next[index] = 0;
    const nextDistance = distanceAfterSlide(next, targetState, stepsAway);
    setPuzzle(next);
    flashMovedTile(blankIndex);
    setMoves((count) => count + 1);
    setStepsAway(nextDistance);
    setAnnouncement(nextDistance === 0 ? "Configuration X now matches Y." : `${nextDistance} ${nextDistance === 1 ? "step remains" : "steps remain"}.`);
  }

  function resetChallenge() {
    animationToken.current += 1;
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    setPuzzle([...startState]);
    setMoves(0);
    setStepsAway(selectedPair.distance);
    setIsAnimating(false);
    setHighlightedIndex(null);
    setAnnouncement("Configuration X has been reset.");
  }

  async function showSolution() {
    if (isAnimating || solved) return;
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    const path = sameState(puzzle, startState)
      ? (isReversed ? [...selectedPair.path].reverse() : [...selectedPair.path])
      : findPuzzlePath(puzzle, targetState, stepsAway);
    if (!path) {
      setAnnouncement("A solution could not be prepared from this position.");
      return;
    }

    const token = animationToken.current + 1;
    animationToken.current = token;
    setIsAnimating(true);
    setAnnouncement(`Animating a shortest solution of ${path.length} ${path.length === 1 ? "step" : "steps"}.`);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 120 : 460;
    const animated = [...puzzle];
    let animatedMoves = moves;
    await new Promise((resolve) => window.setTimeout(resolve, Math.min(delay, 220)));
    for (let index = 0; index < path.length; index += 1) {
      if (animationToken.current !== token) return;
      const tileIndex = animated.indexOf(path[index]);
      const openIndex = animated.indexOf(0);
      animated[openIndex] = path[index];
      animated[tileIndex] = 0;
      animatedMoves += 1;
      setPuzzle([...animated]);
      setHighlightedIndex(openIndex);
      setMoves(animatedMoves);
      setStepsAway(path.length - index - 1);
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }
    if (animationToken.current === token) {
      setIsAnimating(false);
      highlightTimer.current = window.setTimeout(() => setHighlightedIndex(null), 320);
      setAnnouncement("Solution complete. Configuration X matches Y.");
    }
  }

  return (
    <PreviewFrame>
      <Intro sandbox="Sandbox 03" title="Move X to Y">
        <strong>How to play:</strong> slide highlighted tiles on X until it matches the fixed configuration Y. Choose an <KaTeXMath tex={String.raw`\varepsilon`} /> class, try the challenge yourself, or animate a shortest solution from your current position.
      </Intro>
      <section aria-label="Match two Kolam fifteen-puzzle configurations">
        <div className="mnl-compare">
          <section className="mnl-panel" aria-labelledby="mnl-x-heading">
            <div className="mnl-panel-head">
              <div className="mnl-compare-title"><span className="mnl-letter">X</span><h3 id="mnl-x-heading">Movable configuration</h3></div>
              <div className="mnl-stats">
                <span className="mnl-stat"><strong>{moves}</strong>{moves === 1 ? "move" : "moves"}</span>
                <span className="mnl-stat"><strong>{stepsAway}</strong>{stepsAway === 1 ? "step left" : "steps left"}</span>
              </div>
            </div>
            <PuzzleBoard board={puzzle} movable={movable} onMove={moveChallengeTile} disabled={isAnimating || solved} label="Movable configuration X" recent={highlightedIndex} cellContext="configuration X" />
            {solved ? <div className="mnl-success" role="status">X matches Y</div> : null}
          </section>

          <section className="mnl-panel mnl-target" aria-labelledby="mnl-y-heading">
            <div className="mnl-panel-head"><div className="mnl-compare-title"><span className="mnl-letter">Y</span><h3 id="mnl-y-heading">Fixed target</h3></div><span className="mnl-kicker">Reference</span></div>
            <PuzzleBoard board={targetState} fixed label="Fixed target configuration Y" />
          </section>
        </div>

        <div className="mnl-actions" aria-label="Challenge controls">
          <button className="mnl-button" type="button" onClick={() => loadPair(selectedEpsilon)} disabled={isAnimating}>New pair</button>
          <button className="mnl-button" type="button" onClick={resetChallenge} disabled={isAnimating || sameState(puzzle, startState)}>Reset X</button>
          <button className="mnl-button mnl-button-primary" type="button" onClick={showSolution} disabled={isAnimating || solved}>{isAnimating ? "Showing solution…" : "Show solution"}</button>
        </div>

        <section className="mnl-orbit" aria-labelledby="mnl-shared-epsilon-heading">
          <div className="mnl-orbit-head">
            <div><span className="mnl-kicker">Choose an orbit</span><h3 id="mnl-shared-epsilon-heading">Shared <KaTeXMath tex={String.raw`\varepsilon`} /> value</h3></div>
            <EpsilonToggle value={selectedEpsilon} onChange={loadPair} disabled={isAnimating} label="Choose epsilon value for X and Y" />
          </div>
          <div className="mnl-epsilon" aria-live="polite"><span><KaTeXMath tex={String.raw`\varepsilon(X)=\varepsilon(Y)`} /></span><strong>{selectedEpsilon > 0 ? "+1" : "−1"}</strong><small>Therefore X and Y lie in the same 15-puzzle orbit.</small></div>
        </section>
        <p className="mnl-status mnl-sr-only" aria-live="polite">{announcement}</p>
      </section>
    </PreviewFrame>
  );
}

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Matrix4 = number[];
type OctaRep = {
  id: string;
  roman: string;
  title: string;
  arms: string;
  net: { root: string; order: string[]; parent: Record<string, string | null> };
  tiles: Record<string, number>;
};
type OctaGeometry = {
  faces: Record<string, Record<number, Vec2>>;
  hinges: Record<string, { parent: string; start: number; end: number; sign: number }>;
};

const SQRT3 = Math.sqrt(3);
const FOLD_ANGLE = Math.acos(1 / 3);
const FACE_IDS = ["000", "001", "010", "011", "100", "101", "110", "111"];
const LOCAL_TRIANGLE: Record<number, Vec2> = { 0: [0, SQRT3 / 2], 1: [-0.5, 0], 2: [0.5, 0] };
const OCTAHEDRON_REPS: OctaRep[] = [
  {
    id: "balanced",
    roman: "I",
    title: "Three equal arms",
    arms: "(2, 2, 2)",
    net: {
      root: "111",
      order: ["111", "101", "001", "000", "100", "010", "110", "011"],
      parent: { "111": null, "101": "111", "001": "101", "000": "001", "100": "000", "010": "000", "110": "100", "011": "010" },
    },
    tiles: { "000": 7, "001": 5, "010": 3, "011": 1, "100": 6, "101": 4, "110": 2, "111": 0 },
  },
  {
    id: "unequal",
    roman: "II",
    title: "Three unequal arms",
    arms: "(3, 2, 1)",
    net: {
      root: "011",
      order: ["011", "010", "000", "001", "100", "101", "110", "111"],
      parent: { "011": null, "010": "011", "000": "010", "001": "000", "100": "000", "101": "001", "110": "100", "111": "110" },
    },
    tiles: { "000": 7, "001": 5, "010": 2, "011": 0, "100": 6, "101": 4, "110": 3, "111": 1 },
  },
  {
    id: "long",
    roman: "III",
    title: "One long arm",
    arms: "(4, 1, 1)",
    net: {
      root: "101",
      order: ["101", "001", "000", "100", "010", "110", "111", "011"],
      parent: { "101": null, "001": "101", "000": "001", "100": "000", "010": "000", "110": "100", "111": "110", "011": "111" },
    },
    tiles: { "000": 7, "001": 1, "010": 2, "011": 4, "100": 6, "101": 0, "110": 3, "111": 5 },
  },
];

const geometryCache = new WeakMap<OctaRep, OctaGeometry>();
const add2 = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
const subtract2 = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
const scale2 = (a: Vec2, amount: number): Vec2 => [a[0] * amount, a[1] * amount];
const mix2 = (a: Vec2, b: Vec2, amount: number): Vec2 => [a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount];
const dot2 = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
const midpoint2 = (a: Vec2, b: Vec2) => mix2(a, b, 0.5);
const centroid2 = (points: Vec2[]): Vec2 => scale2(points.reduce<Vec2>((sum, point) => add2(sum, point), [0, 0]), 1 / points.length);
const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const subtract3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale3 = (a: Vec3, amount: number): Vec3 => [a[0] * amount, a[1] * amount, a[2] * amount];
const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalise3 = (a: Vec3): Vec3 => {
  const length = Math.sqrt(dot3(a, a));
  return length < 1e-12 ? [0, 0, 0] : scale3(a, 1 / length);
};
const centroid3 = (points: Vec3[]): Vec3 => scale3(points.reduce<Vec3>((sum, point) => add3(sum, point), [0, 0, 0]), 1 / points.length);
const clampNumber = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const faceBits = (face: string) => [Number(face[0]), Number(face[1]), Number(face[2])];
const changedAxis = (first: string, second: string) => {
  const a = faceBits(first);
  const b = faceBits(second);
  return [0, 1, 2].find((axis) => a[axis] !== b[axis]);
};
const tileBit = (tile: number, axis: number) => (tile >> (2 - axis)) & 1;
const triangularWord = (tile: number) => tile.toString(2).padStart(3, "0");

function reflect2(point: Vec2, first: Vec2, second: Vec2): Vec2 {
  const direction = subtract2(second, first);
  const amount = dot2(subtract2(point, first), direction) / dot2(direction, direction);
  const foot = add2(first, scale2(direction, amount));
  return subtract2(scale2(foot, 2), point);
}

const identity4 = (): Matrix4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function multiply4(first: Matrix4, second: Matrix4): Matrix4 {
  const result = Array(16).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      for (let inner = 0; inner < 4; inner += 1) result[row * 4 + column] += first[row * 4 + inner] * second[inner * 4 + column];
    }
  }
  return result;
}

function transform3(matrix: Matrix4, point: Vec3): Vec3 {
  return [
    matrix[0] * point[0] + matrix[1] * point[1] + matrix[2] * point[2] + matrix[3],
    matrix[4] * point[0] + matrix[5] * point[1] + matrix[6] * point[2] + matrix[7],
    matrix[8] * point[0] + matrix[9] * point[1] + matrix[10] * point[2] + matrix[11],
  ];
}

function rotationAroundLine(first: Vec3, second: Vec3, angle: number): Matrix4 {
  const [x, y, z] = normalise3(subtract3(second, first));
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const tangent = 1 - cosine;
  const rotation = [
    cosine + x * x * tangent, x * y * tangent - z * sine, x * z * tangent + y * sine,
    y * x * tangent + z * sine, cosine + y * y * tangent, y * z * tangent - x * sine,
    z * x * tangent - y * sine, z * y * tangent + x * sine, cosine + z * z * tangent,
  ];
  const rotatedFirst: Vec3 = [
    rotation[0] * first[0] + rotation[1] * first[1] + rotation[2] * first[2],
    rotation[3] * first[0] + rotation[4] * first[1] + rotation[5] * first[2],
    rotation[6] * first[0] + rotation[7] * first[1] + rotation[8] * first[2],
  ];
  const translation = subtract3(first, rotatedFirst);
  return [
    rotation[0], rotation[1], rotation[2], translation[0],
    rotation[3], rotation[4], rotation[5], translation[1],
    rotation[6], rotation[7], rotation[8], translation[2],
    0, 0, 0, 1,
  ];
}

const rotationX = (angle: number): Matrix4 => {
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  return [1, 0, 0, 0, 0, cosine, -sine, 0, 0, sine, cosine, 0, 0, 0, 0, 1];
};
const rotationY = (angle: number): Matrix4 => {
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  return [cosine, 0, sine, 0, 0, 1, 0, 0, -sine, 0, cosine, 0, 0, 0, 0, 1];
};
const rotationZ = (angle: number): Matrix4 => {
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  return [cosine, -sine, 0, 0, sine, cosine, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

function octaGeometry(rep: OctaRep): OctaGeometry {
  const cached = geometryCache.get(rep);
  if (cached) return cached;
  const faces: Record<string, Record<number, Vec2>> = {
    [rep.net.root]: { 0: [...LOCAL_TRIANGLE[0]], 1: [...LOCAL_TRIANGLE[1]], 2: [...LOCAL_TRIANGLE[2]] },
  };
  const hinges: OctaGeometry["hinges"] = {};
  for (const face of rep.net.order.slice(1)) {
    const parent = rep.net.parent[face];
    if (!parent) throw new Error(`${rep.id}: missing net parent`);
    const axis = changedAxis(parent, face);
    if (axis === undefined) throw new Error(`${rep.id}: invalid net edge`);
    const shared = [0, 1, 2].filter((index) => index !== axis);
    const first = faces[parent][shared[0]];
    const second = faces[parent][shared[1]];
    faces[face] = {
      [shared[0]]: first,
      [shared[1]]: second,
      [axis]: reflect2(faces[parent][axis], first, second),
    };
    const childCentre = centroid2([faces[face][0], faces[face][1], faces[face][2]]);
    const derivative = cross3(normalise3([second[0] - first[0], second[1] - first[1], 0]), [childCentre[0] - first[0], childCentre[1] - first[1], 0]);
    hinges[face] = { parent, start: shared[0], end: shared[1], sign: derivative[2] >= 0 ? 1 : -1 };
  }
  const geometry = { faces, hinges };
  geometryCache.set(rep, geometry);
  return geometry;
}

function octaTransforms(rep: OctaRep, fold: number) {
  const { faces, hinges } = octaGeometry(rep);
  const transforms: Record<string, Matrix4> = { [rep.net.root]: identity4() };
  for (const face of rep.net.order.slice(1)) {
    const hinge = hinges[face];
    const parentTransform = transforms[hinge.parent];
    const first2 = faces[hinge.parent][hinge.start];
    const second2 = faces[hinge.parent][hinge.end];
    const first = transform3(parentTransform, [first2[0], first2[1], 0]);
    const second = transform3(parentTransform, [second2[0], second2[1], 0]);
    transforms[face] = multiply4(rotationAroundLine(first, second, hinge.sign * FOLD_ANGLE * fold), parentTransform);
  }
  return transforms;
}

const faceVertices = (rep: OctaRep, face: string): Vec2[] => {
  const geometry = octaGeometry(rep).faces[face];
  return [geometry[0], geometry[1], geometry[2]];
};

function sideMidpoint(rep: OctaRep, face: string, axis: number) {
  const others = [0, 1, 2].filter((index) => index !== axis);
  const geometry = octaGeometry(rep).faces[face];
  return midpoint2(geometry[others[0]], geometry[others[1]]);
}

function cubicPoint(first: Vec2, second: Vec2, third: Vec2, fourth: Vec2, amount: number): Vec2 {
  const inverse = 1 - amount;
  const inverseSquared = inverse * inverse;
  const amountSquared = amount * amount;
  return [
    inverse * inverseSquared * first[0] + 3 * inverseSquared * amount * second[0] + 3 * inverse * amountSquared * third[0] + amountSquared * amount * fourth[0],
    inverse * inverseSquared * first[1] + 3 * inverseSquared * amount * second[1] + 3 * inverse * amountSquared * third[1] + amountSquared * amount * fourth[1],
  ];
}

function curveSubpaths(rep: OctaRep, face: string, tile: number): Vec2[][] {
  const vertices = faceVertices(rep, face);
  const centre = centroid2(vertices);
  const edge = Math.hypot(vertices[1][0] - vertices[0][0], vertices[1][1] - vertices[0][1]);
  const radius = edge * 0.19;
  const shoulder = edge * 0.13;
  const portHandle = edge * 0.068;
  const sides = [0, 1, 2].map((axis) => {
    const midpoint = sideMidpoint(rep, face, axis);
    const angle = (Math.atan2(midpoint[1] - centre[1], midpoint[0] - centre[0]) + Math.PI * 2) % (Math.PI * 2);
    return { axis, midpoint, angle };
  }).sort((first, second) => first.angle - second.angle);
  const circlePoint = (angle: number, distance = radius): Vec2 => [centre[0] + distance * Math.cos(angle), centre[1] + distance * Math.sin(angle)];
  const tangent = (angle: number): Vec2 => [-Math.sin(angle), Math.cos(angle)];
  const shift = (point: Vec2, vector: Vec2, amount: number): Vec2 => [point[0] + vector[0] * amount, point[1] + vector[1] * amount];
  const unit = (vector: Vec2): Vec2 => {
    const length = Math.hypot(vector[0], vector[1]);
    return [vector[0] / length, vector[1] / length];
  };
  const paths: Vec2[][] = [[]];
  let current = paths[0];
  sides.forEach((side, index) => {
    const startAngle = side.angle - Math.PI / 3;
    const endAngle = side.angle + Math.PI / 3;
    const start = circlePoint(startAngle);
    const end = circlePoint(endAngle);
    const startTangent = tangent(startAngle);
    const endTangent = tangent(endAngle);
    if (index === 0) current.push(start);
    if (tileBit(tile, side.axis)) {
      const normal: Vec2 = [Math.cos(side.angle), Math.sin(side.angle)];
      const sideTangent = tangent(side.angle);
      const incoming = unit([normal[0] + sideTangent[0], normal[1] + sideTangent[1]]);
      const outgoing = unit([-normal[0] + sideTangent[0], -normal[1] + sideTangent[1]]);
      const control1 = shift(start, startTangent, shoulder);
      const control2 = shift(side.midpoint, incoming, -portHandle);
      for (let sample = 1; sample <= 10; sample += 1) current.push(cubicPoint(start, control1, control2, side.midpoint, sample / 10));
      current = [];
      paths.push(current);
      current.push(side.midpoint);
      const control3 = shift(side.midpoint, outgoing, portHandle);
      const control4 = shift(end, endTangent, -shoulder);
      for (let sample = 1; sample <= 10; sample += 1) current.push(cubicPoint(side.midpoint, control3, control4, end, sample / 10));
    } else {
      const handle = (4 / 3) * Math.tan(Math.PI / 6) * radius;
      const control1 = shift(start, startTangent, handle);
      const control2 = shift(end, endTangent, -handle);
      for (let sample = 1; sample <= 14; sample += 1) current.push(cubicPoint(start, control1, control2, end, sample / 14));
    }
  });
  return paths.filter((path) => path.length > 1);
}

const pathData = (points: ReadonlyArray<readonly [number, number, ...number[]]>, close = false) => {
  if (points.length === 0) return "";
  return `M ${points.map((point, index) => `${index ? "L " : ""}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(" ")}${close ? " Z" : ""}`;
};

function validateOctahedronReps() {
  OCTAHEDRON_REPS.forEach((rep) => {
    const inventory = Object.values(rep.tiles).sort((first, second) => first - second);
    if (inventory.some((value, index) => value !== index)) throw new Error(`${rep.id}: inventory error`);
    let active = 0;
    for (const face of FACE_IDS) {
      const bits = faceBits(face);
      for (let axis = 0; axis < 3; axis += 1) {
        if (bits[axis] !== 0) continue;
        const neighbourBits = [...bits];
        neighbourBits[axis] = 1;
        const neighbour = neighbourBits.join("");
        if (tileBit(rep.tiles[face], axis) !== tileBit(rep.tiles[neighbour], axis)) throw new Error(`${rep.id}: edge mismatch`);
        if (tileBit(rep.tiles[face], axis)) active += 1;
      }
    }
    if (active !== 6) throw new Error(`${rep.id}: expected six active edges`);
  });
}

type MiniFace = { face: string; triangle: string; curves: string[]; centre: Vec2 };
function buildMiniScene(rep: OctaRep): MiniFace[] {
  const all = FACE_IDS.flatMap((face) => faceVertices(rep, face).map((point): Vec2 => [point[1], -point[0]]));
  const xs = all.map((point) => point[0]);
  const ys = all.map((point) => point[1]);
  const minimumX = Math.min(...xs), maximumX = Math.max(...xs), minimumY = Math.min(...ys), maximumY = Math.max(...ys);
  const scale = Math.min(172 / (maximumX - minimumX), 98 / (maximumY - minimumY));
  const offsetX = 95 - ((minimumX + maximumX) * scale) / 2;
  const offsetY = 58 - ((minimumY + maximumY) * scale) / 2;
  const map = (point: Vec2): Vec2 => [offsetX + point[1] * scale, offsetY - point[0] * scale];
  return FACE_IDS.map((face) => ({
    face,
    triangle: pathData(faceVertices(rep, face).map(map), true),
    curves: curveSubpaths(rep, face, rep.tiles[face]).map((path) => pathData(path.map(map))),
    centre: map(centroid2(faceVertices(rep, face))),
  }));
}

type OctaSceneFace = {
  face: string;
  triangle: string;
  curves: string[];
  graphEdges: string[];
  centre: [number, number, number];
  opacity: number;
  tile: number;
};

function buildOctaScene(rep: OctaRep, fold: number, yaw: number, pitch: number, zoom: number): OctaSceneFace[] {
  const transforms = octaTransforms(rep, fold);
  const world = (face: string, point: Vec2): Vec3 => transform3(transforms[face], [point[0], point[1], 0]);
  const faceCentres = FACE_IDS.map((face) => world(face, centroid2(faceVertices(rep, face))));
  const centre = centroid3(faceCentres);
  const baseRotation = rotationZ(-Math.PI / 2);
  const rotation = fold < 0.001 ? baseRotation : multiply4(rotationY(yaw * fold), multiply4(rotationX(pitch * fold), baseRotation));
  const records = FACE_IDS.map((face) => {
    const vertices = faceVertices(rep, face).map((point) => transform3(rotation, subtract3(world(face, point), centre)));
    const normal = cross3(subtract3(vertices[1], vertices[0]), subtract3(vertices[2], vertices[0]));
    return { face, vertices, normal, depth: centroid3(vertices)[2] };
  }).sort((first, second) => first.depth - second.depth);

  const all3 = records.flatMap((record) => record.vertices);
  const raw = all3.map((point): [number, number, number] => {
    const perspective = 1 / (1 - point[2] * 0.16);
    return [point[0] * perspective, -point[1] * perspective, perspective];
  });
  const xs = raw.map((point) => point[0]);
  const ys = raw.map((point) => point[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const scale = Math.min(790 / Math.max(width, 0.1), 520 / Math.max(height, 0.1)) * zoom;
  const centreX = 450 - ((Math.min(...xs) + Math.max(...xs)) * scale) / 2;
  const centreY = 305 - ((Math.min(...ys) + Math.max(...ys)) * scale) / 2;
  const project = (point: Vec3): [number, number, number] => {
    const perspective = 1 / (1 - point[2] * 0.16);
    return [centreX + point[0] * perspective * scale, centreY - point[1] * perspective * scale, perspective];
  };
  const light = normalise3([-0.35, -0.45, 1]);

  return records.map((record) => {
    const tile = rep.tiles[record.face];
    const triangle = pathData(record.vertices.map((point) => project(point)), true);
    const curves = curveSubpaths(rep, record.face, tile).map((path) => pathData(path.map((point) => project(transform3(rotation, subtract3(world(record.face, point), centre))))));
    const faceCentre = centroid2(faceVertices(rep, record.face));
    const projectedCentre = project(transform3(rotation, subtract3(world(record.face, faceCentre), centre)));
    const graphEdges: string[] = [];
    for (let axis = 0; axis < 3; axis += 1) {
      if (!tileBit(tile, axis)) continue;
      const midpoint = sideMidpoint(rep, record.face, axis);
      const projectedMidpoint = project(transform3(rotation, subtract3(world(record.face, midpoint), centre)));
      graphEdges.push(`M ${projectedCentre[0]} ${projectedCentre[1]} L ${projectedMidpoint[0]} ${projectedMidpoint[1]}`);
    }
    const illumination = Math.max(0, dot3(normalise3(record.normal), light));
    return {
      face: record.face,
      triangle,
      curves,
      graphEdges,
      centre: projectedCentre,
      opacity: fold < 0.02 ? 0.8 : 0.68 + illumination * 0.2,
      tile,
    };
  });
}

validateOctahedronReps();

export function OctahedronKolamPreview() {
  const foldId = useId();
  const titleId = useId();
  const [repIndex, setRepIndex] = useState(0);
  const [fold, setFold] = useState(0);
  const [yaw, setYaw] = useState(0.72);
  const [pitch, setPitch] = useState(-0.48);
  const [zoom, setZoom] = useState(1);
  const [labels, setLabels] = useState(false);
  const [graph, setGraph] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("Three equal arms selected. The net is unfolded.");
  const animationFrame = useRef<number | null>(null);
  const stageRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);

  const rep = OCTAHEDRON_REPS[repIndex];
  const miniScenes = useMemo(() => OCTAHEDRON_REPS.map((candidate) => buildMiniScene(candidate)), []);
  const scene = useMemo(() => buildOctaScene(rep, fold, yaw, pitch, zoom), [rep, fold, yaw, pitch, zoom]);
  const percent = Math.round(fold * 100);

  useEffect(() => () => {
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((value) => clampNumber(value * (event.deltaY > 0 ? 0.92 : 1.08), 0.65, 1.7));
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, []);

  function cancelAnimation() {
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }

  function animateFold(target: 0 | 1) {
    cancelAnimation();
    const start = fold;
    let beginning: number | null = null;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 650;
    const step = (now: number) => {
      if (beginning === null) beginning = now;
      const amount = clampNumber((now - beginning) / duration, 0, 1);
      const eased = amount < 0.5
        ? 4 * amount * amount * amount
        : 1 - Math.pow(-2 * amount + 2, 3) / 2;
      setFold(start + (target - start) * eased);
      if (amount < 1) {
        animationFrame.current = window.requestAnimationFrame(step);
      } else {
        animationFrame.current = null;
        setAnnouncement(target
          ? "The net is folded into an octahedron."
          : "The octahedron is unfolded into a net.");
      }
    };
    animationFrame.current = window.requestAnimationFrame(step);
  }

  function selectRepresentative(index: number) {
    cancelAnimation();
    setRepIndex(index);
    setFold(0);
    setYaw(0.72);
    setPitch(-0.48);
    setZoom(1);
    setAnnouncement(`Selected ${OCTAHEDRON_REPS[index].title}.`);
  }

  function startDragging(event: ReactPointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
    setIsDragging(true);
  }

  function continueDragging(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drag.current || event.pointerId !== drag.current.pointerId) return;
    const deltaX = event.clientX - drag.current.lastX;
    const deltaY = event.clientY - drag.current.lastY;
    drag.current.lastX = event.clientX;
    drag.current.lastY = event.clientY;
    setYaw((value) => value + deltaX * 0.009);
    setPitch((value) => clampNumber(value + deltaY * 0.009, -1.45, 1.45));
  }

  function stopDragging(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drag.current || event.pointerId !== drag.current.pointerId) return;
    drag.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function useStageKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft") setYaw((value) => value - 0.14);
    else if (event.key === "ArrowRight") setYaw((value) => value + 0.14);
    else if (event.key === "ArrowUp") setPitch((value) => value - 0.12);
    else if (event.key === "ArrowDown") setPitch((value) => value + 0.12);
    else if (event.key === "+" || event.key === "=") setZoom((value) => clampNumber(value + 0.1, 0.65, 1.7));
    else if (event.key === "-") setZoom((value) => clampNumber(value - 0.1, 0.65, 1.7));
    else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      animateFold(fold > 0.5 ? 0 : 1);
      return;
    } else return;
    event.preventDefault();
  }

  return (
    <PreviewFrame>
      <section aria-labelledby={titleId}>
        <Intro sandbox="Sandbox 04" title="Kolams on an Octahedron">
          Compare the three graph-theoretic representatives on connected octahedron nets, fold each net, and explore the completed solid.
        </Intro>

        <div className="mnl-octa-layout">
          <section className="mnl-reps" aria-label="Choose one of the three kolams">
            <p className="mnl-kicker">Three representatives</p>
            {OCTAHEDRON_REPS.map((candidate, index) => (
              <button
                className="mnl-rep"
                type="button"
                key={candidate.id}
                aria-pressed={repIndex === index}
                onClick={() => selectRepresentative(index)}
              >
                <svg className="mnl-mini" viewBox="0 0 190 116" aria-hidden="true" focusable="false">
                  {miniScenes[index].map((face) => (
                    <g key={face.face}>
                      <path className="mnl-mini-face" d={face.triangle} />
                      {face.curves.map((curve, curveIndex) => (
                        <path className="mnl-mini-curve" d={curve} key={`${face.face}-${curveIndex}`} />
                      ))}
                      <circle className="mnl-mini-dot" cx={face.centre[0]} cy={face.centre[1]} r="1.7" />
                    </g>
                  ))}
                </svg>
                <span>
                  <strong>{candidate.roman}. {candidate.title}</strong>
                  <small>{candidate.arms}</small>
                </span>
              </button>
            ))}
          </section>

          <section className="mnl-panel" aria-labelledby={titleId}>
            <div className="mnl-viewer-head">
              <div><small>Selected representative</small><h3 id={titleId}>{rep.title}</h3></div>
              <span className="mnl-arm-badge">{rep.arms}</span>
            </div>

            <div className="mnl-stage-wrap">
              <button
                className="mnl-stage-button"
                type="button"
                aria-label={`${rep.title}, arm lengths ${rep.arms}, ${percent} percent folded.`}
                onKeyDown={useStageKeyboard}
              >
                <svg
                  ref={stageRef}
                  className={`mnl-stage${isDragging ? " is-dragging" : ""}`}
                  viewBox="0 0 900 610"
                  aria-hidden="true"
                  focusable="false"
                  onPointerDown={startDragging}
                  onPointerMove={continueDragging}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onLostPointerCapture={() => { drag.current = null; setIsDragging(false); }}
                >
                  {scene.map((face) => (
                    <g key={face.face} data-face={face.face}>
                      <path className="mnl-octa-face" d={face.triangle} style={{ opacity: face.opacity }} />
                      {graph ? (
                        <g aria-hidden="true">
                          {face.graphEdges.map((edge, edgeIndex) => (
                            <path className="mnl-graph-edge" d={edge} key={`${face.face}-edge-${edgeIndex}`} />
                          ))}
                          <circle className="mnl-graph-node" cx={face.centre[0]} cy={face.centre[1]} r={face.tile === 0 ? 5 : 3.8} />
                        </g>
                      ) : null}
                      {face.curves.map((curve, curveIndex) => (
                        <path className="mnl-octa-curve" d={curve} key={`${face.face}-curve-${curveIndex}`} />
                      ))}
                      <circle
                        className="mnl-octa-dot"
                        cx={face.centre[0]}
                        cy={face.centre[1]}
                        r={4.2 * clampNumber(face.centre[2], 0.82, 1.18)}
                      />
                      {labels ? (
                        <text className="mnl-octa-label" x={face.centre[0]} y={face.centre[1] - 12} textAnchor="middle">
                          {triangularWord(face.tile)}
                        </text>
                      ) : null}
                    </g>
                  ))}
                </svg>
              </button>
              <span className="mnl-stage-hint">Drag to rotate · Scroll to zoom</span>
            </div>

            <div className="mnl-fold">
              <button className="mnl-button mnl-button-primary" type="button" onClick={() => animateFold(fold > 0.5 ? 0 : 1)}>
                {fold > 0.5 ? "Unfold the net" : "Fold the net"}
              </button>
              <label className="mnl-sr-only" htmlFor={foldId}>Fold amount</label>
              <input
                id={foldId}
                type="range"
                min="0"
                max="100"
                value={percent}
                aria-label="Fold amount"
                onChange={(event) => { cancelAnimation(); setFold(Number(event.target.value) / 100); }}
              />
              <output htmlFor={foldId}>{percent}%</output>
            </div>

            <div className="mnl-tool-row" aria-label="View controls">
              <button className="mnl-button" type="button" aria-label="Rotate left" onClick={() => setYaw((value) => value - 0.24)}>↶ Rotate</button>
              <button className="mnl-button" type="button" aria-label="Rotate right" onClick={() => setYaw((value) => value + 0.24)}>Rotate ↷</button>
              <button className="mnl-button" type="button" aria-label="Zoom out" onClick={() => setZoom((value) => clampNumber(value - 0.12, 0.65, 1.7))}>−</button>
              <button className="mnl-button" type="button" aria-label="Zoom in" onClick={() => setZoom((value) => clampNumber(value + 0.12, 0.65, 1.7))}>+</button>
              <span className="mnl-divider" aria-hidden="true" />
              <button className="mnl-button" type="button" aria-pressed={labels} onClick={() => setLabels((value) => !value)}>Tile labels</button>
              <button className="mnl-button" type="button" aria-pressed={graph} onClick={() => setGraph((value) => !value)}>Active graph</button>
              <button className="mnl-button" type="button" onClick={() => { setYaw(0.72); setPitch(-0.48); setZoom(1); }}>Reset view</button>
            </div>
            <p className="mnl-status">The flat net shows the connected nonzero kolam; the 000 tile is attached along an inactive edge.</p>
          </section>
        </div>
        <p className="mnl-status mnl-sr-only" aria-live="polite">{announcement}</p>
      </section>
    </PreviewFrame>
  );
}
