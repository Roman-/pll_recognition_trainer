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

// Camera-visible sticker indices: F face top row (left) + R face top row (right).
// The inversedRotation in the scramble ensures the correct faces land at F+R.
const VIEW = {
  left: [18, 19, 20], right: [9, 10, 11],  // F[0,1,2], R[0,1,2]
  fc: 22, rc: 13, bc: 49, lc: 40           // face centers: F, R, B, L
}

// Group precedence (lower = higher priority)
const GROUP_PRECEDENCE = {
  three_bar: 0, double_lights: 1, lights_plus_2bar: 1, lone_lights: 1,
  double_2bar: 2, outside_2bar: 2, inside_2bar: 2,
  bookends_no_bar: 3, no_bookends: 3
}

function toRelative(sticker, fc, rc, bc, lc) {
  if (sticker === fc) return 'g'
  if (sticker === rc) return 'o'
  if (sticker === bc) return 'b'
  if (sticker === lc) return 'r'
  return 'x'
}

// Structural match: check if there's a consistent injective mapping
// from guide colors to computed colors (wildcards match anything).
function structuralMatch(computed, guide) {
  const fwd = {}   // guide_color -> computed_color
  const rev = {}   // computed_color -> guide_color (injective check)
  for (let i = 0; i < 6; i++) {
    if (guide[i] === 'x') continue
    const gc = guide[i], cc = computed[i]
    if (gc in fwd) {
      if (fwd[gc] !== cc) return false
    } else {
      if (cc in rev) return false
      fwd[gc] = cc
      rev[cc] = gc
    }
  }
  return true
}

// Mirror: spatial reversal (looking from the other end of the same two faces)
function mirror(cells) {
  return [cells[5], cells[4], cells[3], cells[2], cells[1], cells[0]]
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
      guideRows.push({
        groupId: group.id,
        rowIndex: ri,
        cells,
        mirrorCells: mirror(cells),
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

    const fc = state[VIEW.fc], rc = state[VIEW.rc]
    const bc = state[VIEW.bc], lc = state[VIEW.lc]

    const pattern = [
      ...VIEW.left.map(i => toRelative(state[i], fc, rc, bc, lc)),
      ...VIEW.right.map(i => toRelative(state[i], fc, rc, bc, lc))
    ]

    const hits = []
    for (const gr of guideRows) {
      if (structuralMatch(pattern, gr.cells) || structuralMatch(pattern, gr.mirrorCells)) {
        hits.push(gr)
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
