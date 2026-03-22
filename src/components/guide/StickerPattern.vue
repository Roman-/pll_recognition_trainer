<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/ThemeStore'

const props = defineProps({
  layers: { type: Array, required: true },
  cellSize: { type: Number, default: 22 },
  gap: { type: Number, default: 0 },
  groupGap: { type: Number, default: 6 },
  groupSize: { type: Number, default: 3 },
  minColumns: { type: Number, default: 6 }
})

const theme = useThemeStore()

const colorMap = computed(() => ({
  g: '#21b15b',
  o: '#e8a11a',
  b: '#2d8fe3',
  r: '#e53935',
  x: theme.isDark ? '#555' : '#d0d0d0'
}))

function parseCell(token) {
  const outlined = token.endsWith('!')
  const colorKey = token.replace('!', '')
  return { colorKey, outlined }
}

const bounds = computed(() => {
  let maxRow = 0
  let maxCol = props.minColumns
  for (const layer of props.layers) {
    maxRow = Math.max(maxRow, layer.row)
    maxCol = Math.max(maxCol, layer.col + layer.cells.length)
  }
  return { rows: maxRow + 1, cols: maxCol }
})

function groupGaps(col) {
  if (props.groupSize <= 0) return 0
  const groups = Math.floor(col / props.groupSize)
  return groups * props.groupGap
}

const svgWidth = computed(() => {
  const cols = bounds.value.cols
  return cols * props.cellSize + (cols - 1) * props.gap + groupGaps(cols - 1)
})
const svgHeight = computed(() => bounds.value.rows * props.cellSize + (bounds.value.rows - 1) * props.gap)

const rects = computed(() => {
  const result = []
  for (const layer of props.layers) {
    for (let i = 0; i < layer.cells.length; i++) {
      const { colorKey, outlined } = parseCell(layer.cells[i])
      const col = layer.col + i
      const sw = outlined ? 2.5 : 1
      const logicalX = col * (props.cellSize + props.gap) + groupGaps(col)
      const logicalY = layer.row * (props.cellSize + props.gap)
      result.push({
        x: logicalX + sw / 2,
        y: logicalY + sw / 2,
        width: props.cellSize - sw,
        height: props.cellSize - sw,
        rx: 1.5,
        fill: colorMap.value[colorKey],
        outlined,
        sw
      })
    }
  }
  return result
})
</script>

<template>
  <svg
    :width="svgWidth"
    :height="svgHeight"
    :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
    style="max-width: 100%; height: auto"
  >
    <rect
      v-for="(r, i) in rects"
      :key="i"
      :x="r.x"
      :y="r.y"
      :width="r.width"
      :height="r.height"
      :rx="r.rx"
      :fill="r.fill"
      :stroke="r.outlined ? 'var(--bs-body-color)' : 'var(--bs-border-color)'"
      :stroke-width="r.sw"
    />
  </svg>
</template>
