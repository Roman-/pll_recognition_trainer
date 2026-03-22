/**
 * Minimal 3×3 Rubik's cube state simulator.
 *
 * State: 54-element Int8Array, 6 faces × 9 stickers.
 * Face order: U=0, R=1, F=2, D=3, L=4, B=5
 * Sticker indices per face (viewed from outside):
 *   0 1 2
 *   3 4 5
 *   6 7 8
 * Absolute index = face * 9 + position
 */

// ── helpers ──────────────────────────────────────────────────────────

// 4-cycle forward: a→b→c→d→a
function cycleCW(s, a, b, c, d) {
  const t = s[d]; s[d] = s[c]; s[c] = s[b]; s[b] = s[a]; s[a] = t
}

// 4-cycle reverse: d→c→b→a→d
function cycleCCW(s, a, b, c, d) {
  const t = s[a]; s[a] = s[b]; s[b] = s[c]; s[c] = s[d]; s[d] = t
}

function applyCW(state, cycles) {
  for (let i = 0; i < cycles.length; i++) {
    const c = cycles[i]
    cycleCW(state, c[0], c[1], c[2], c[3])
  }
}

function applyCCW(state, cycles) {
  for (let i = 0; i < cycles.length; i++) {
    const c = cycles[i]
    cycleCCW(state, c[0], c[1], c[2], c[3])
  }
}

// ── move definitions (CW cycles) ────────────────────────────────────
// Each move is an array of [a,b,c,d] 4-cycles where a→b→c→d→a for CW.

/* eslint-disable no-multi-spaces */
const MOVES = {
  // ─ face moves ─
  U: [
    [0,2,8,6], [1,5,7,3],                         // face
    [18,36,45,9], [19,37,46,10], [20,38,47,11]    // band
  ],
  R: [
    [9,11,17,15], [10,14,16,12],                   // face
    [20,2,51,29], [23,5,48,32], [26,8,45,35]      // band: F→U→B(rev)→D
  ],
  F: [
    [18,20,26,24], [19,23,25,21],                  // face
    [6,9,29,44], [7,12,28,41], [38,8,15,27]       // band: U→R→D→L
  ],
  D: [
    [27,29,35,33], [28,32,34,30],                  // face
    [24,15,51,42], [25,16,52,43], [44,26,17,53]   // band: F→R→B→L (from below)
  ],
  L: [
    [36,38,44,42], [37,41,43,39],                  // face
    [6,24,33,47], [3,21,30,50], [18,27,53,0]      // band: U→F→D→B(rev)
  ],
  B: [
    [45,47,53,51], [46,50,52,48],                  // face
    [2,36,33,17], [1,39,34,14], [11,0,42,35]      // band: U→L→D→R
  ],

  // ─ whole-cube rotations ─
  // x: R-axis direction (F→U→B→D→F)
  x: [
    [18,0,53,27], [19,1,52,28], [20,2,51,29],     // F→U→B(flip)→D
    [21,3,50,30], [22,4,49,31], [23,5,48,32],
    [24,6,47,33], [25,7,46,34], [26,8,45,35],
    [9,11,17,15], [10,14,16,12],                   // R face CW
    [36,42,44,38], [37,39,43,41]                   // L face CCW
  ],
  // y: U-axis direction (F→R→B→L→F)
  y: [
    [18,36,45,9], [19,37,46,10], [20,38,47,11],    // band (top row)
    [21,39,48,12], [22,40,49,13], [23,41,50,14],  // band (mid row)
    [24,42,51,15], [25,43,52,16], [26,44,53,17],  // band (bot row)
    [0,2,8,6], [1,5,7,3],                         // U face CW
    [27,33,35,29], [28,30,34,32]                   // D face CCW (from below)
  ],
  // z: F-axis direction (U→R→D→L→U, with 90° remap)
  z: [
    [0,11,35,42], [1,14,34,39], [2,17,33,36],     // U→R→D→L (rotated)
    [3,10,32,43], [4,13,31,40], [5,16,30,37],
    [6,9,29,44], [7,12,28,41], [8,15,27,38],
    [18,20,26,24], [19,23,25,21],                  // F face CW
    [45,51,53,47], [46,48,52,50]                   // B face CCW
  ]
}
/* eslint-enable no-multi-spaces */

// ── public API ──────────────────────────────────────────────────────

export function createSolvedCube() {
  const state = new Int8Array(54)
  for (let i = 0; i < 54; i++) state[i] = Math.floor(i / 9)
  return state
}

export function applyMove(state, token) {
  const base = token[0]
  const mod = token.length > 1 ? token[1] : ''
  const cycles = MOVES[base]
  if (!cycles) return
  if (mod === '2') {
    applyCW(state, cycles)
    applyCW(state, cycles)
  } else if (mod === "'") {
    applyCCW(state, cycles)
  } else {
    applyCW(state, cycles)
  }
}

export function applyAlgorithm(state, alg) {
  const tokens = alg.trim().split(/\s+/)
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i]) applyMove(state, tokens[i])
  }
}
