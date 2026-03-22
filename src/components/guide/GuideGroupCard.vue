<script setup>
import { computed } from 'vue'
import StickerPattern from './StickerPattern.vue'

const props = defineProps({
  group: { type: Object, required: true },
  defaultPatternColumns: { type: Number, default: 6 }
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
        groupedRows.push(rows[i])
        i++
      }
      segments.push({ type: 'annotated', rows: groupedRows, annotation: ann })
    } else {
      segments.push({ type: 'normal', row })
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
      <h6 class="mb-0 fw-bold text-uppercase">{{ group.title }}</h6>
    </div>

    <div class="card-body p-2">
      <template v-for="(seg, si) in renderSegments" :key="si">
        <!-- Normal row -->
        <div v-if="seg.type === 'normal'" class="guide-case-row">
          <StickerPattern :layers="seg.row.pattern.layers" :minColumns="defaultPatternColumns" />
          <span class="guide-case-text">{{ seg.row.text }}</span>
        </div>

        <!-- Annotated group with brace -->
        <div v-else class="guide-annotated-group">
          <div class="guide-annotated-patterns">
            <div v-for="(r, ri) in seg.rows" :key="ri">
              <StickerPattern :layers="r.pattern.layers" :minColumns="defaultPatternColumns" />
            </div>
          </div>
          <div class="guide-brace-container">
            <div class="guide-brace"></div>
          </div>
          <span class="guide-case-text">{{ seg.annotation.text }}</span>
        </div>
      </template>
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
  padding: 4px 0;
}

.guide-case-text {
  font-size: 0.85rem;
  white-space: nowrap;
}

.guide-annotated-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.guide-annotated-patterns {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
</style>
