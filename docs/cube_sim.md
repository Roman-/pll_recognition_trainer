# Cube Simulator (`src/scripts/cube_sim.js`)

Minimal 3×3 Rubik's cube state simulator used by the guide lookup to determine what sticker pattern the user sees.

## State

54-element `Int8Array`. Each element holds a face ID (0–5).

```
Face order: U=0, R=1, F=2, D=3, L=4, B=5
Absolute index = face × 9 + position

Sticker layout per face (viewed from outside):
  0 1 2
  3 4 5    (4 = center)
  6 7 8
```

Solved state: `state[i] = Math.floor(i / 9)`.

## Key Sticker Indices

Camera-visible top-row stickers (used by guide lookup):

| Position | Index | Piece |
|----------|-------|-------|
| F face top-left | 18 | UFL corner F-sticker |
| F face top-mid | 19 | UF edge F-sticker |
| F face top-right | 20 | UFR corner F-sticker |
| R face top-left | 9 | UFR corner R-sticker |
| R face top-mid | 10 | UR edge R-sticker |
| R face top-right | 11 | UBR corner R-sticker |

Face centers: F=22, R=13, B=49, L=40.

Corner adjacencies (verified via U band cycles): F[2]=20 and R[0]=9 share the UFR corner.

## Moves

Each move is an array of 4-cycles. `cycleCW(s, a, b, c, d)` performs: `s[a]←s[d], s[b]←s[a], s[c]←s[b], s[d]←s[c]`.

- **Face moves**: R, U, F, L, B, D — each has 2 face cycles + 3 band cycles
- **Whole-cube rotations**: x, y, z — 9 band cycles + 2 face cycles
- **Prime** (`'`): uses `cycleCCW` (reverse direction)
- **Double** (`2`): applies CW twice

## API

```javascript
createSolvedCube()         // → Int8Array(54)
applyMove(state, token)    // e.g., "R", "U'", "F2"
applyAlgorithm(state, alg) // e.g., "R U R' U' R' F R2 U' R' U' R U R' F'"
```

Algorithm strings are space-separated tokens. Each token is a base letter + optional modifier (`'` or `2`).
