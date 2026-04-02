<script setup>
import { computed } from 'vue'
import StickerPattern from './StickerPattern.vue'
import { formatAccuracy } from '@/scripts/formatters'

defineEmits(['practice'])

const props = defineProps({
  group: { type: Object, required: true },
  defaultPatternColumns: { type: Number, default: 6 },
  highlightRowIndex: { type: Number, default: -1 },
  showPracticeButton: { type: Boolean, default: false },
  mastered: { type: Boolean, default: false },
  bestAccuracy: { type: Number, default: null },
})

const renderSegments = computed(() => {
  const segments = []
  const annotationMap = new Map()
  for (const ann of (props.group.annotations || [])) {
    annotationMap.set(ann.id, ann)
  }

  let i = 0
  const rows = props.group.rows
  while (i < rows.length) {
    const row = rows[i]
    if (row.annotationRef) {
      const ann = annotationMap.get(row.annotationRef)
      const groupedRows = []
      while (i < rows.length && rows[i].annotationRef === row.annotationRef) {
        groupedRows.push({ ...rows[i], originalIndex: i })
        i++
      }
      segments.push({ type: 'annotated', rows: groupedRows, annotation: ann })
    } else {
      segments.push({ type: 'normal', row, originalIndex: i })
      i++
    }
  }
  return segments
})
</script>

<template>
  <article class="card guide-group">
    <div class="card-header guide-group-header">
      <StickerPattern :layers="group.header.layers" :minColumns="defaultPatternColumns" />
      <h6 class="mb-0 fw-bold">{{ group.title }}</h6>
      <span v-if="mastered" class="ms-auto text-success" title="Mastered"><i class="bi-check-circle-fill"/></span>
      <span v-else-if="bestAccuracy !== null" class="ms-auto badge text-bg-secondary small">{{ formatAccuracy(bestAccuracy) }}</span>
    </div>

    <div class="card-body p-2">
      <template v-for="(seg, si) in renderSegments" :key="si">
        <!-- Normal row -->
        <div v-if="seg.type === 'normal'" class="guide-case-row"
             :class="{ 'guide-row-highlight animate__animated animate__headShake': seg.originalIndex === highlightRowIndex }">
          <StickerPattern :layers="seg.row.pattern.layers" :minColumns="defaultPatternColumns" />
          <span class="guide-case-text">{{ seg.row.text }}</span>
        </div>

        <!-- Annotated group with brace -->
        <div v-else class="guide-annotated-group">
          <div class="guide-annotated-patterns">
            <div v-for="(r, ri) in seg.rows" :key="ri"
                 :class="{ 'guide-row-highlight animate__animated animate__headShake': r.originalIndex === highlightRowIndex }">
              <StickerPattern :layers="r.pattern.layers" :minColumns="defaultPatternColumns" />
            </div>
          </div>
          <div class="guide-brace-container">
            <div class="guide-brace"></div>
          </div>
          <span class="guide-case-text"
                :class="{ 'guide-row-highlight-text': seg.rows.some(r => r.originalIndex === highlightRowIndex) }">
            {{ seg.annotation.text }}
          </span>
        </div>
      </template>
      <div v-if="showPracticeButton" class="text-center mt-2 mb-1">
        <button class="btn btn-sm btn-outline-primary" @click.stop="$emit('practice')">
          <i class="bi-lightning-charge-fill me-1"/>Practice
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.guide-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.guide-case-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px;
}

.guide-case-row :deep(svg) {
  flex-shrink: 0;
}

.guide-case-text {
  font-size: 0.85rem;
}

.guide-annotated-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px;
}

.guide-annotated-patterns {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.guide-brace-container {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: 4px 0;
}

.guide-brace {
  width: 8px;
  height: 100%;
  border-right: 2px solid var(--bs-body-color);
  border-top: 2px solid var(--bs-body-color);
  border-bottom: 2px solid var(--bs-body-color);
  border-radius: 0 4px 4px 0;
}

.guide-row-highlight {
  background: var(--bs-warning-bg-subtle, rgba(255, 193, 7, 0.15));
  border-radius: 4px;
}

.guide-row-highlight-text {
  font-weight: bold;
  color: var(--bs-warning-text-emphasis);
}
</style>