<script setup>
import { computed } from 'vue'
import GuideGroupCard from '@/components/guide/GuideGroupCard.vue'
import guideData from '@/assets/guide/pll_two_sided_page1.json'

const groupMap = computed(() => {
  const map = new Map()
  guideData.groups.forEach(g => map.set(g.id, g))
  return map
})
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-3">
      <h3>{{ guideData.meta.title }}</h3>
      <small class="text-secondary">v{{ guideData.meta.version }}</small>
    </div>

    <div class="row justify-content-center mb-4">
      <div class="col-12 col-lg-10">
        <ul class="list-unstyled mb-0">
          <li v-for="(note, i) in guideData.notes" :key="i" class="mb-1">
            <small class="text-secondary">{{ note }}</small>
          </li>
        </ul>
      </div>
    </div>

    <div class="guide-grid">
      <template v-for="row in guideData.layout.rows" :key="row.join(',')">
        <GuideGroupCard
          v-for="groupId in row"
          :key="groupId"
          :group="groupMap.get(groupId)"
          :defaultPatternColumns="guideData.layout.defaultPatternColumns"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 1100px) {
  .guide-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .guide-grid {
    grid-template-columns: 1fr;
  }
}
</style>
