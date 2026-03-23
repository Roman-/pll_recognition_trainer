/**
 * Guide Pattern Matching & Lookup
 *
 * Pre-computes a lookup table mapping every (caseName, rotation) to the
 * matching guide group + row from Mark49152's Two-Sided PLL Recognition Guide.
 *
 * The two-sided pattern depends only on (caseName, rotation) — not dTurn,
 * colorShift, or crossColor — so the table has ~73 entries.
 */

import { createSolvedCube, applyAlgorithm } from '@/scripts/cube_sim'
import { inverseScramble } from '@/scripts/helpers'
import { allPllKeys } from '@/scripts/pll_cases'
import pllMap from '@/assets/algs/pll.json'
import guideData from '@/assets/guide/pll_two_sided_page1.json'

// 4 two-sided viewing angles around the top layer.
// Each view: left/right = sticker indices (top row, L-to-R from viewer),
// fc/rc = left/right face center, bc/lc = opposite-of-left/opposite-of-right center.
// Corner adjacencies: left[2] and right[0] are on the same corner piece.
const VIEWS = [
  { left: [18,19,20], right: [9,10,11],  fc: 22, rc: 13, bc: 49, lc: 40 }, // F+R
  { left: [9,10,11],  right: [45,46,47], fc: 13, rc: 49, bc: 40, lc: 22 }, // R+B
  { left: [45,46,47], right: [36,37,38], fc: 49, rc: 40, bc: 22, lc: 13 }, // B+L
  { left: [36,37,38], right: [18,19,20], fc: 40, rc: 22, bc: 13, lc: 49 }, // L+F
]

// Group precedence (lower = higher priority)
const GROUP_PRECEDENCE = {
  three_bar: 0, double_lights: 1, lights_plus_2bar: 1, lone_lights: 1,
  double_2bar: 2, outside_2bar: 2, inside_2bar: 2,
  bookends_no_bar: 3, no_bookends: 3
}

const FLIP = { g: 'o', o: 'g', b: 'r', r: 'b', x: 'x' }

function toRelative(sticker, fc, rc, bc, lc) {
  if (sticker === fc) return 'g'
  if (sticker === rc) return 'o'
  if (sticker === bc) return 'b'
  if (sticker === lc) return 'r'
  return 'x'
}

function matches(computed, guide) {
  for (let i = 0; i < 6; i++) {
    if (guide[i] !== 'x' && computed[i] !== guide[i]) return false
  }
  return true
}

function flip(p) {
  return [FLIP[p[3]], FLIP[p[4]], FLIP[p[5]], FLIP[p[0]], FLIP[p[1]], FLIP[p[2]]]
}

// Mirror: spatial reversal (looking from the other end of the same two faces)
function mirror(cells) {
  return [cells[5], cells[4], cells[3], cells[2], cells[1], cells[0]]
}

// Color-swap: g↔o, b↔r (left/right face roles are interchangeable)
function colorswap(cells) {
  return cells.map(c => FLIP[c])
}

function textMatchesCase(text, caseName) {
  if (!text) return false
  const m = text.match(/=\s*(.+)$/)
  if (!m) return false
  const label = m[1].trim()
  if (label.includes('/')) {
    const prefix = label[0]
    const suffixes = label.slice(1).split('/')
    return caseName[0] === prefix && suffixes.includes(caseName.slice(1))
  }
  return caseName.startsWith(label)
}

function effectiveText(row, group) {
  if (row.text) return row.text
  if (row.annotationRef && group.annotations) {
    const ann = group.annotations.find(a => a.id === row.annotationRef)
    if (ann) return ann.text
  }
  return null
}

function buildLookupTable() {
  const table = {}

  const guideRows = []
  for (const group of guideData.groups) {
    for (let ri = 0; ri < group.rows.length; ri++) {
      const row = group.rows[ri]
      const cells = row.pattern.layers[0].cells.map(c => c.replace('!', ''))
      const m = mirror(cells)
      guideRows.push({
        groupId: group.id,
        rowIndex: ri,
        variants: [cells, m, colorswap(cells), colorswap(m)],
        text: effectiveText(row, group),
        precedence: GROUP_PRECEDENCE[group.id]
      })
    }
  }

  for (const key of allPllKeys()) {
    const sep = key.indexOf('/')
    const name = key.slice(0, sep)
    const rotation = key.slice(sep + 1)

    const alg = pllMap[name]['noAuf']
    const inv = rotation ? inverseScramble(rotation) : ''
    const scramble = inv ? `${alg} ${inv}` : alg

    const state = createSolvedCube()
    applyAlgorithm(state, scramble)

    // Only check F+R angle — the camera-visible faces.
    // The inversedRotation already rotates the cube so the correct faces are at F+R.
    const view = VIEWS[0]
    const fc = state[view.fc], rc = state[view.rc]
    const bc = state[view.bc], lc = state[view.lc]

    const pattern = [
      ...view.left.map(i => toRelative(state[i], fc, rc, bc, lc)),
      ...view.right.map(i => toRelative(state[i], fc, rc, bc, lc))
    ]
    const flipped = flip(pattern)

    const hits = []
    for (const gr of guideRows) {
      for (const v of gr.variants) {
        if (matches(pattern, v) || matches(flipped, v)) {
          hits.push(gr)
          break
        }
      }
    }

    if (hits.length === 0) continue

    let best
    if (hits.length === 1) {
      best = hits[0]
    } else {
      const nameHits = hits.filter(h => textMatchesCase(h.text, name))
      const pool = nameHits.length > 0 ? nameHits : hits
      best = pool.reduce((a, b) => a.precedence <= b.precedence ? a : b)
    }

    table[key] = { groupId: best.groupId, rowIndex: best.rowIndex }
  }

  return table
}

const lookupTable = buildLookupTable()
const groupsById = Object.fromEntries(guideData.groups.map(g => [g.id, g]))

export function lookupGuideHint(pllCase) {
  if (!pllCase) return null
  const key = `${pllCase.name}/${pllCase.rotation}`
  return lookupTable[key] || null
}

export function getGuideGroup(groupId) {
  return groupsById[groupId] || null
}
