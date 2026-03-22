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
  three_bar: 0,
  double_lights: 1,
  lights_plus_2bar: 1,
  lone_lights: 1,
  double_2bar: 2,
  outside_2bar: 2,
  inside_2bar: 2,
  bookends_no_bar: 3,
  no_bookends: 3
}

const FLIP = { g: 'o', o: 'g', b: 'r', r: 'b' }

/**
 * Convert absolute sticker face ID to relative guide color.
 * On the left (F) side:  g=F, o=R, b=B(opp-F), r=L(opp-R)
 * On the right (R) side: o=R, g=F, b=L(opp-R), r=B(opp-F)
 */
function toRelative(sticker, fc, rc, bc, lc, isRight) {
  if (!isRight) {
    if (sticker === fc) return 'g'
    if (sticker === rc) return 'o'
    if (sticker === bc) return 'b'
    if (sticker === lc) return 'r'
  } else {
    if (sticker === rc) return 'o'
    if (sticker === fc) return 'g'
    if (sticker === lc) return 'b'
    if (sticker === bc) return 'r'
  }
  return 'x'
}

/** Check if computed 6-cell pattern matches a guide row's cells (x = wildcard). */
function matches(computed, guide) {
  for (let i = 0; i < 6; i++) {
    if (guide[i] !== 'x' && computed[i] !== guide[i]) return false
  }
  return true
}

/** Flip pattern: swap left/right sides and swap color meanings. */
function flip(p) {
  return [FLIP[p[3]], FLIP[p[4]], FLIP[p[5]], FLIP[p[0]], FLIP[p[1]], FLIP[p[2]]]
}

/** Check if a guide row's label text refers to a given case name. */
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

/** Get effective text for a row (own text or annotation text). */
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

  // Pre-extract all guide rows with metadata
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

    // Build minimal scramble (no dTurn/colorShift/crossColor)
    const alg = pllMap[name]['noAuf']
    const inv = rotation ? inverseScramble(rotation) : ''
    const scramble = inv ? `${alg} ${inv}` : alg

    const state = createSolvedCube()
    applyAlgorithm(state, scramble)

    // Read centers and visible stickers
    const fc = state[F_CENTER], rc = state[R_CENTER]
    const bc = state[B_CENTER], lc = state[L_CENTER]

    const pattern = [
      ...LEFT.map(i => toRelative(state[i], fc, rc, bc, lc, false)),
      ...RIGHT.map(i => toRelative(state[i], fc, rc, bc, lc, true))
    ]
    const flipped = flip(pattern)

    // Find all matching guide rows
    const hits = []
    for (const gr of guideRows) {
      if (matches(pattern, gr.cells) || matches(flipped, gr.cells)) {
        hits.push(gr)
      }
    }

    if (hits.length === 0) {
      console.warn(`[guide_lookup] No guide match for ${key}, pattern: ${pattern.join(',')}`)
      continue
    }

    // Disambiguate: prefer name-matching text, then higher precedence
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

// Pre-compute at module load
const lookupTable = buildLookupTable()

const groupsById = Object.fromEntries(guideData.groups.map(g => [g.id, g]))

/** Look up the guide hint for a pllCase → { groupId, rowIndex } | null */
export function lookupGuideHint(pllCase) {
  if (!pllCase) return null
  const key = `${pllCase.name}/${pllCase.rotation}`
  return lookupTable[key] || null
}

/** Get a guide group object by its ID. */
export function getGuideGroup(groupId) {
  return groupsById[groupId] || null
}
