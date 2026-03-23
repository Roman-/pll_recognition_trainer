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

// Sticker indices for two-sided recognition (F top row + R top row)
const LEFT = [18, 19, 20]   // F face positions 0,1,2
const RIGHT = [9, 10, 11]   // R face positions 0,1,2

// Face center indices
const F_CENTER = 22
const R_CENTER = 13
const B_CENTER = 49
const L_CENTER = 40

// Group precedence (lower = higher priority)
const GROUP_PRECEDENCE = {
  three_bar: 0, double_lights: 1, lights_plus_2bar: 1, lone_lights: 1,
  double_2bar: 2, outside_2bar: 2, inside_2bar: 2,
  bookends_no_bar: 3, no_bookends: 3
}

const FLIP = { g: 'o', o: 'g', b: 'r', r: 'b' }

function toRelative(sticker, fc, rc, bc, lc, isRight) {
  if (!isRight) {
    if (sticker === fc) return 'g'
    if (sticker === rc) return 'o'
    if (sticker === bc) return 'b'
    if (sticker === lc) return 'r'
  } else {
    if (sticker === rc) return 'o'
    if (sticker === fc) return 'g'
    if (sticker === bc) return 'b'
    if (sticker === lc) return 'r'
  }
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
      guideRows.push({
        groupId: group.id,
        rowIndex: ri,
        cells: row.pattern.layers[0].cells.map(c => c.replace('!', '')),
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

    const fc = state[F_CENTER], rc = state[R_CENTER]
    const bc = state[B_CENTER], lc = state[L_CENTER]

    const pattern = [
      ...LEFT.map(i => toRelative(state[i], fc, rc, bc, lc, false)),
      ...RIGHT.map(i => toRelative(state[i], fc, rc, bc, lc, true))
    ]
    const flipped = flip(pattern)

    const hits = []
    for (const gr of guideRows) {
      if (matches(pattern, gr.cells) || matches(flipped, gr.cells)) {
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
