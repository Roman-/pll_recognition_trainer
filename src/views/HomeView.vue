<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PllShowcase from '@/components/PllShowcase.vue'
import GuideGroupCard from '@/components/guide/GuideGroupCard.vue'
import guideData from '@/assets/guide/pll_two_sided_page1.json'
import { isMobile } from '@/scripts/device'
import { useKeydown } from '@/composables/useKeydown'

const router = useRouter()

const groupMap = computed(() => {
  const map = new Map()
  guideData.groups.forEach(g => map.set(g.id, g))
  return map
})

useKeydown((e) => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault()
    router.push('/trainer')
  }
})
</script>

<template>
  <div class="container-fluid px-0">
    <!-- Hero Section -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 text-center">
          <h1 class="display-4 fw-bold mb-3 animate__animated animate__fadeInDown">PLL Recognition Trainer</h1>
          <p class="lead text-secondary mb-4 animate__animated animate__fadeIn animate__delay-1s">
            Practice recognizing all 21 PLL cases from any angle and color.
            The trainer adapts to your weaknesses — cases you struggle with
            come back more often until you nail them.
          </p>
          <div class="animate__animated animate__fadeInUp animate__delay-1s">
            <router-link to="/trainer" class="btn btn-primary btn-lg px-4 py-2 start-btn">
              <i class="bi-lightning-charge-fill me-1"/>Start Training
            </router-link>
            <div v-if="!isMobile" class="text-secondary small mt-2 opacity-50">Press Space to start</div>
          </div>
        </div>
      </div>
    </div>

    <!-- PLL Showcase -->
    <PllShowcase />

    <!-- Video Section -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <h5 class="text-secondary text-center mb-3">What is PLL Recognition?</h5>
          <div class="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/lIjel-amSeg"
              title="PLL Recognition Explained"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <!-- Two-Sided PLL Recognition Guide -->
    <div class="container py-4">
      <div class="text-center mb-3">
        <h3>Two-Sided PLL Recognition Guide</h3>
        <small class="text-secondary">
          Guide by Mark Rivers
          | <a href="https://www.speedsolving.com/threads/two-sided-pll-recognition-guide.41108" target="_blank" rel="noopener">speedsolving post</a>
          | <a href="https://cubing.pt/wp-content/uploads/2017/03/pll2side-20140531.pdf" target="_blank" rel="noopener">Download original PDF</a>
        </small>
      </div>

      <div class="row justify-content-center mb-4">
        <div class="col-12 col-lg-10">
          <p class="text-secondary small mb-0">
            Scan the two visible faces for features in this order:
            <strong>3-bar → lights → 2-bar → bookends</strong>.
            Match the first pattern you find, then identify the case within that group.
            Each case appears in four color combos and may be mirrored.
            Color labels (opp/adj) are relative to the nearest pattern color.
          </p>
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
