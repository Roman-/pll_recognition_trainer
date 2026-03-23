# Two-Sided PLL Recognition Guide Integration

When a user guesses wrong during training, a guide card appears with the matching recognition pattern highlighted, teaching how to identify the case next time.

## Architecture

```
TrainerView.vue (mistake feedback section)
  └── GuideHint.vue
        ├── lookupGuideHint(pllCase) → { groupId, rowIndex } | null
        ├── getGuideGroup(groupId) → group object
        └── GuideGroupCard.vue (with highlightRowIndex prop)
              └── StickerPattern.vue
```

| File | Purpose |
|------|---------|
| `src/scripts/guide_lookup.js` | Pattern matching engine + pre-computed lookup table |
| `src/scripts/cube_sim.js` | 3×3 cube state simulator (54-sticker array) |
| `src/components/GuideHint.vue` | Queries lookup, renders card if match found |
| `src/components/guide/GuideGroupCard.vue` | Renders guide group card with row highlighting |
| `src/assets/guide/pll_two_sided_page1.json` | Guide data: 9 groups, 35 rows |

## Lookup Table

Pre-computed at module load. Maps every `(caseName, rotation)` pair → `{ groupId, rowIndex }`.

**73/73 keys covered, 0 conflicts.**

### Construction (`buildLookupTable`)

For each of the 73 keys from `allPllKeys()`:

1. **Scramble**: `noAuf_algorithm + inversedRotation` applied to a solved cube via `cube_sim.js`
2. **Read stickers**: F face top row `[18,19,20]` + R face top row `[9,10,11]` — the camera-visible faces
3. **Convert to relative colors** by comparing each sticker to the 4 face centers:
   - `g` = matches left face center (F)
   - `o` = matches right face center (R)
   - `b` = matches opposite-of-left center (B)
   - `r` = matches opposite-of-right center (L)
4. **Structural match** against all 35 guide rows (+ their mirrors)
5. **Disambiguate** multiple matches: prefer rows naming the correct case, then higher-precedence groups

### Why only `(caseName, rotation)` matters

The rendering scramble includes `crossColorChange`, `colorShift`, and `dTurn`, but these don't affect the relative pattern:

- **dTurn** only moves D-layer stickers — top row and face centers are unaffected
- **colorShift** (y-rotations) and **crossColorChange** (x/z-rotations) uniformly rotate all stickers and face centers before the PLL algorithm, preserving all relative relationships

### Why only F+R is checked

The camera views the cube from front-right. The `inversedRotation` in the scramble rotates the whole cube so the designated viewing angle lands at F+R. Checking other sticker positions would match patterns from faces the user can't see.

## Structural Matching

Guide patterns describe structural relationships — which positions share colors, which differ — not specific color assignments. A J-perm's "double 2-bar + bookend" looks the same whether the bars are made of `g,g`/`r,r` or `o,o`/`g,g`.

`structuralMatch(computed, guide)` checks if there exists a **consistent injective mapping** from guide colors to computed colors:

```
For each non-wildcard position i:
  If guide[i] already maps to something: check it maps to computed[i]
  Otherwise: assign guide[i] → computed[i], ensuring no other guide color already maps there
```

**Injective** = distinct guide colors must map to distinct computed colors. This prevents `[g,g,x,o,o,g]` from matching `[r,r,x,r,r,r]` (where g and o would both map to r).

Wildcards (`x`) match any computed color without creating mappings.

### Mirror

Each guide row is also checked in reverse: `[a,b,c,d,e,f]` → `[f,e,d,c,b,a]`. This handles patterns where features (2-bars, bookends) appear at the opposite end of the face pair — equivalent to looking at the same two faces from the other corner.

## Disambiguation

When multiple guide rows structurally match:

1. **Name match**: prefer rows whose text mentions the case (e.g., `"= J"` matches Ja/Jb)
2. **Precedence**: 3-bar (0) > lights (1) > 2-bar (2) > bookends (3) — matching the guide's intended check order

## Guide Data

`pll_two_sided_page1.json` — 9 groups in a 3×3 grid:

| | Col 0 | Col 1 | Col 2 |
|---|---|---|---|
| **Row 0** | 3-BAR | DOUBLE LIGHTS | LIGHTS + 2-BAR |
| **Row 1** | LONE LIGHTS | DOUBLE 2-BAR | OUTSIDE 2-BAR |
| **Row 2** | INSIDE 2-BAR | BOOKENDS NO BAR | NO BOOKENDS |

Each group has `rows` with 6-cell sticker patterns and identification text. Pattern tokens: `g` (left face), `o` (right face), `b` (opposite left), `r` (opposite right), `x` (wildcard). The `!` suffix marks outlined stickers (visual only, stripped during matching).

Rows with `annotationRef` share a brace label with sibling rows (e.g., J-perm's two three_bar rows share "2-bar = J").
