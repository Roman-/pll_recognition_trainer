# Developer Guide: Rendering `pll_two_sided_page1.json`

This guide explains how to consume and render the JSON file exported from page 1 of **Mark49152’s Two-Sided PLL Recognition Guide**.

It is written for a JavaScript renderer that should recreate the guide as a responsive HTML page.

---

## 1. What this file contains

`pll_two_sided_page1.json` is a normalized description of the first page of the guide.

It includes:

- page metadata (`title`, `version`, source page)
- the bullet notes at the top
- precedence order (`3-bar`, `lights`, `2-bar`, `bookends`)
- a cell token legend
- a 3×3 layout of groups
- all nine pattern groups
- all cases inside each group
- stacked mini-diagrams for headers such as **LIGHTS + 2-BAR** and **DOUBLE 2-BAR**
- shared annotations such as the brace label in **3-BAR**

It does **not** contain image pixels. It is a semantic description that your renderer turns into HTML/SVG/Canvas.

---

## 2. Top-level shape

```js
{
  meta: { ... },
  notes: [ ... ],
  precedence: [ ... ],
  cellLegend: { ... },
  layout: { ... },
  groups: [ ... ]
}
```

### `meta`

```js
{
  source: "pll2side.pdf",
  page: 1,
  title: "Mark49152’s Two-Sided PLL Recognition Guide",
  version: "2014.05.31"
}
```

Use this for the page header.

### `notes`

Array of bullet strings shown under the title.

### `precedence`

Logical precedence order extracted from the PDF:

```js
["3-bar", "lights", "2-bar", "bookends"]
```

This is informational. You can render it directly or ignore it if your layout already shows the notes section.

### `cellLegend`

```js
{
  g: "green",
  o: "orange",
  b: "blue",
  r: "red",
  x: "gray",
  "!": "outlined sticker (thick black border)"
}
```

This tells you how to interpret sticker tokens such as `g!` or `x`.

### `layout`

```js
{
  type: "grid",
  columns: 3,
  rows: [
    ["three_bar", "double_lights", "lights_plus_2bar"],
    ["lone_lights", "double_2bar", "outside_2bar"],
    ["inside_2bar", "bookends_no_bar", "no_bookends"]
  ],
  defaultPatternColumns: 6
}
```

This is the page composition model.

- `columns: 3` means the outer page layout is a 3-column grid.
- `rows` defines the visual order of groups.
- `defaultPatternColumns: 6` means sticker strips are based on a 6-cell-wide local coordinate system.

### `groups`

Each group is one framed box such as **3-BAR** or **DOUBLE LIGHTS**.

---

## 3. Group schema

A group looks like this:

```js
{
  id: "three_bar",
  title: "3-BAR",
  gridRow: 0,
  gridCol: 0,
  header: {
    layers: [ ... ]
  },
  rows: [ ... ],
  annotations: [ ... ]
}
```

### Important fields

- `id`: stable programmatic identifier
- `title`: human-readable title to render
- `gridRow`, `gridCol`: original position in the 3×3 page
- `header.layers`: mini-diagram shown near the title
- `rows`: case rows in the order they appear
- `annotations`: optional extra markup like braces spanning multiple rows

---

## 4. Pattern layers: the core rendering model

Both headers and row patterns use the same structure:

```js
{
  layers: [
    {
      row: 0,
      col: 0,
      cells: ["g!", "x", "g!", "o!", "x", "o!"]
    }
  ]
}
```

Each layer is placed on a local sticker canvas.

### Layer fields

- `row`: zero-based vertical offset inside the local mini-canvas
- `col`: zero-based horizontal offset inside the local mini-canvas
- `cells`: consecutive sticker tokens to place starting at `(row, col)`

### Why `layers` exist

Most patterns are a single strip, but some headers need multiple stacked strips.

Examples:

- **LIGHTS + 2-BAR**: the right 3-sticker segment is duplicated below
- **DOUBLE 2-BAR**: the right 3-sticker segment is duplicated below

That is why these are represented as multiple layers in the same local coordinate system.

### Example: stacked header

```js
header: {
  layers: [
    { row: 0, col: 0, cells: ["g!", "x", "g!"] },
    { row: 0, col: 3, cells: ["o!", "o!", "x"] },
    { row: 1, col: 3, cells: ["x", "b!", "b!"] }
  ]
}
```

Render this as one small canvas with 2 local rows.

---

## 5. Sticker token format

A cell token is usually one of:

- `g`
- `o`
- `b`
- `r`
- `x`
- or the same with `!`, for example `g!`

### Meaning

- base letter = color key
- `!` suffix = thick black outline

### Recommended parser

```js
function parseCell(token) {
  const outlined = token.includes('!');
  const colorKey = token.replace('!', '');
  return { colorKey, outlined };
}
```

### Suggested default color map

```js
const COLOR_MAP = {
  g: '#21b15b',
  o: '#e8a11a',
  b: '#2d8fe3',
  r: '#e53935',
  x: '#bdbdbd'
};
```

The exact shades do not have to match the PDF perfectly as long as the semantic meaning is preserved.

---

## 6. Case rows

Each case row looks like this:

```js
{
  pattern: {
    layers: [
      { row: 0, col: 0, cells: ["g", "g", "g", "o!", "x", "o!"] }
    ]
  },
  text: "headlights = U"
}
```

Render each case row as:

- left: mini pattern preview
- right: case label text

### Special case: shared annotation rows

Some rows intentionally have no direct text:

```js
{
  text: null,
  annotationRef: "three_bar_j"
}
```

This means the row’s label is supplied by a shared annotation object instead of per-row text.

---

## 7. Annotations

Annotations are optional and currently used for multi-row labels.

Example:

```js
annotations: [
  {
    id: "three_bar_j",
    type: "braceLabel",
    fromRow: 1,
    toRow: 2,
    text: "2-bar = J"
  }
]
```

### How to render `braceLabel`

Interpretation:

- start at case row index `fromRow`
- end at case row index `toRow`
- draw a right-side vertical brace spanning those rows
- place `text` next to the brace

A simple HTML implementation can use:

- an absolutely positioned vertical bracket-like line
- or a thin border with short top/bottom ticks
- or SVG for cleaner control

The exact visual treatment can differ from the PDF as long as the relationship is clear.

---

## 8. Recommended rendering architecture

A good structure is:

1. render page header from `meta`
2. render `notes` as bullet list
3. build a lookup `Map(group.id -> group)`
4. iterate `layout.rows`
5. for each group id, render the corresponding group card
6. inside each group:
   - render header preview from `group.header.layers`
   - render title
   - render case rows from `group.rows`
   - overlay annotations from `group.annotations`

---

## 9. DOM structure suggestion

```html
<div class="pll-guide">
  <header class="pll-page-header">
    <div>
      <h1>Mark49152’s Two-Sided PLL Recognition Guide</h1>
      <ul class="pll-notes">...</ul>
    </div>
    <div class="pll-version">V 2014.05.31</div>
  </header>

  <section class="pll-grid">
    <article class="pll-group">
      <div class="pll-group-title-row">
        <div class="sticker-canvas"></div>
        <h2>3-BAR</h2>
      </div>

      <div class="pll-case-list">
        <div class="pll-case-row">
          <div class="sticker-canvas"></div>
          <div class="pll-case-text">headlights = U</div>
        </div>
      </div>
    </article>
  </section>
</div>
```

---

## 10. Layout and sizing strategy

There are two levels of layout.

### A. Outer page layout

Use CSS Grid for the 3×3 group arrangement.

```css
.pll-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(320px, 1fr));
  gap: 24px;
}
```

For responsive collapse:

```css
@media (max-width: 1100px) {
  .pll-grid { grid-template-columns: repeat(2, minmax(280px, 1fr)); }
}

@media (max-width: 760px) {
  .pll-grid { grid-template-columns: 1fr; }
}
```

### B. Inner sticker canvas layout

For headers and row previews, use a local coordinate system based on:

- `cellSize`
- `gap`
- layer `row`
- layer `col`

Formula:

```js
left = (colIndex) * (cellSize + gap)
top  = (rowIndex) * (cellSize + gap)
```

Canvas size should be computed from the max occupied local row/column.

---

## 11. Minimal rendering algorithm

```js
function renderLayers(layers, {
  cellSize = 22,
  gap = 4,
  minColumns = 6,
  colorMap = COLOR_MAP
} = {}) {
  const dims = getLayerBounds(layers, minColumns);

  const root = document.createElement('div');
  root.className = 'sticker-canvas';
  root.style.position = 'relative';
  root.style.width = `${dims.cols * cellSize + (dims.cols - 1) * gap}px`;
  root.style.height = `${dims.rows * cellSize + (dims.rows - 1) * gap}px`;

  layers.forEach((layer, z) => {
    layer.cells.forEach((token, i) => {
      const { colorKey, outlined } = parseCell(token);
      const cell = document.createElement('div');
      cell.className = 'sticker';
      cell.style.position = 'absolute';
      cell.style.left = `${(layer.col + i) * (cellSize + gap)}px`;
      cell.style.top = `${layer.row * (cellSize + gap)}px`;
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      cell.style.background = colorMap[colorKey];
      cell.style.border = outlined ? '3px solid #111' : '1px solid rgba(0,0,0,.15)';
      cell.style.borderRadius = '2px';
      cell.style.boxSizing = 'border-box';
      cell.style.zIndex = String(z + 1);
      root.appendChild(cell);
    });
  });

  return root;
}

function getLayerBounds(layers, minColumns = 6) {
  let maxRow = 0;
  let maxColExclusive = minColumns;

  for (const layer of layers) {
    maxRow = Math.max(maxRow, layer.row);
    maxColExclusive = Math.max(maxColExclusive, layer.col + layer.cells.length);
  }

  return {
    rows: maxRow + 1,
    cols: maxColExclusive
  };
}
```

---

## 12. Rendering a whole group

```js
function renderGroup(group, spec) {
  const card = document.createElement('article');
  card.className = 'pll-group';

  const titleRow = document.createElement('div');
  titleRow.className = 'pll-group-title-row';
  titleRow.appendChild(renderLayers(group.header.layers, {
    minColumns: spec.layout.defaultPatternColumns
  }));

  const title = document.createElement('h2');
  title.textContent = group.title;
  titleRow.appendChild(title);
  card.appendChild(titleRow);

  const list = document.createElement('div');
  list.className = 'pll-case-list';
  card.appendChild(list);

  group.rows.forEach((row, rowIndex) => {
    const item = document.createElement('div');
    item.className = 'pll-case-row';
    item.dataset.rowIndex = String(rowIndex);

    item.appendChild(renderLayers(row.pattern.layers, {
      minColumns: spec.layout.defaultPatternColumns
    }));

    const text = document.createElement('div');
    text.className = 'pll-case-text';
    if (row.text) text.textContent = row.text;
    item.appendChild(text);

    if (row.annotationRef) {
      item.dataset.annotationRef = row.annotationRef;
    }

    list.appendChild(item);
  });

  // Render annotations after rows exist in the DOM.
  renderAnnotations(card, group);

  return card;
}
```

---

## 13. Annotation rendering strategy

For `braceLabel`:

1. find the start row element
2. find the end row element
3. measure their positions inside the group
4. place an absolutely positioned brace overlay next to the row text area

Pseudo-code:

```js
function renderAnnotations(card, group) {
  if (!group.annotations?.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'pll-annotation-overlay';
  card.appendChild(overlay);

  requestAnimationFrame(() => {
    const list = card.querySelector('.pll-case-list');

    group.annotations.forEach(annotation => {
      if (annotation.type !== 'braceLabel') return;

      const start = list.querySelector(`[data-row-index="${annotation.fromRow}"]`);
      const end = list.querySelector(`[data-row-index="${annotation.toRow}"]`);
      if (!start || !end) return;

      const top = start.offsetTop;
      const bottom = end.offsetTop + end.offsetHeight;

      const brace = document.createElement('div');
      brace.className = 'pll-brace-label';
      brace.style.position = 'absolute';
      brace.style.top = `${top}px`;
      brace.style.height = `${bottom - top}px`;
      brace.innerHTML = `
        <div class="pll-brace-line"></div>
        <div class="pll-brace-text">${annotation.text}</div>
      `;

      overlay.appendChild(brace);
    });
  });
}
```

If you want high fidelity, SVG is the cleanest way to draw the brace shape.

---

## 14. Recommended CSS ideas

```css
.pll-group {
  position: relative;
  border: 3px solid #2f5f99;
  padding: 14px 16px 16px;
  background: #fff;
}

.pll-group-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.pll-case-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pll-case-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 12px;
  min-height: 28px;
}

.pll-case-text {
  font-size: 15px;
  line-height: 1.2;
}

.pll-annotation-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
```

---

## 15. Recommended invariants to validate

Before rendering, validate these assumptions:

### Layout integrity

- every `layout.rows` entry matches a real `group.id`
- group ids are unique
- `gridRow` and `gridCol` agree with actual layout placement

### Layer integrity

- each `cells` entry is a valid token
- `row >= 0`
- `col >= 0`
- `cells.length > 0`

### Annotation integrity

- every `annotationRef` points to an annotation inside the same group
- `fromRow` and `toRow` are valid row indexes
- `fromRow <= toRow`

---

## 16. Practical edge cases in this file

### 1. `text` can be `null`
This happens when a shared annotation supplies the visible label.

### 2. Headers can be multi-row
Do not assume header preview height is always 1 sticker row.

### 3. Pattern width should default to 6 cells
Even when a layer only defines 3 cells, the local coordinate system is still conceptually 6 columns wide.

### 4. Preserve source wording
Some labels contain abbreviations or source typos, for example `4 color = Ga/c`. Preserve them exactly unless you intentionally normalize text in a separate pipeline.

---

## 17. Suggested public API for your renderer

A clean API would be:

```js
renderPllGuide(spec, mountNode, options)
```

Where `options` may include:

```js
{
  cellSize: 22,
  cellGap: 4,
  colorMap: { ... },
  responsive: true,
  classNamePrefix: 'pll',
  renderMode: 'html' // or 'svg'
}
```

---

## 18. Example bootstrap code

```js
import { renderPllGuide } from './pllRenderer.js';

const mount = document.getElementById('app');
const spec = await fetch('./pll_two_sided_page1.json').then(r => r.json());

renderPllGuide(spec, mount, {
  cellSize: 24,
  cellGap: 4
});
```

---

## 19. If you want pixel-perfect fidelity

For a close match to the PDF:

- use SVG for braces and borders
- use a condensed sans-serif font
- keep group titles uppercase and bold
- keep group borders blue
- keep generous white space around each group
- align preview strips to the left and labels to the right
- keep the title/version row on a single line when there is enough width

For a productized web component, semantic correctness and responsiveness matter more than pixel-perfect mimicry.

---

## 20. Recommended next step

If your renderer already accepts this JSON shape, the next useful improvement is to split rendering into three pure components:

- `renderStickerCanvas(layers)`
- `renderGroup(group, spec)`
- `renderAnnotations(groupCard, group)`

That keeps the logic for stacked headers, ordinary pattern rows, and brace labels isolated and easy to test.
