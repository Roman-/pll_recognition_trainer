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
    <section class="hero-section">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6 text-center">
            <h1 class="display-4 fw-bold mb-3 animate__animated animate__fadeInDown">PLL Recognition Trainer</h1>
            <p class="lead text-secondary mb-4 animate__animated animate__fadeIn animate__delay-1s">
              <strong class="text-primary">73 distinct patterns</strong> hide inside 21 PLL cases —
              each one can show up in any color combo and from any angle.
              Train your eye to recognize them all. The trainer adapts to your weaknesses,
              drilling the patterns you miss until they click.
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
    </section>

    <!-- PLL Showcase -->
    <PllShowcase />

    <!-- CTA -->
    <div class="text-center py-4">
      <router-link to="/trainer" class="btn btn-primary btn-lg px-4 py-2 start-btn">
        <i class="bi-lightning-charge-fill me-1"/>Start Training
      </router-link>
    </div>

    <div class="section-divider"></div>

    <!-- Video Section -->
    <section class="video-section">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <h5 class="text-secondary text-center mb-3">Quick overview</h5>
            <div class="video-wrapper">
              <div class="video-placeholder">
                <i class="bi-play-circle"></i>
              </div>
              <div class="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/lIjel-amSeg"
                  title="PLL Recognition Explained"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <div class="text-center py-4">
      <router-link to="/trainer" class="btn btn-primary btn-lg px-4 py-2 start-btn">
        <i class="bi-lightning-charge-fill me-1"/>Start Training
      </router-link>
    </div>

    <div class="section-divider"></div>

    <!-- Two-Sided PLL Recognition Guide -->
    <section class="guide-section">
      <div class="container py-4">
        <div class="text-center mb-3">
          <h3>Two-Sided PLL Recognition Guide</h3>
        </div>

        <div class="row justify-content-center mb-4">
          <div class="col-12 col-lg-10">
            <p class="text-secondary small mb-0">
              Scan the two visible faces for features in this order:
              <strong>3-bar &rarr; lights &rarr; 2-bar &rarr; bookends</strong>.
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

        <div class="text-center mt-4">
          <small class="text-secondary">
            Guide by Mark Rivers
            | <a href="https://www.speedsolving.com/threads/two-sided-pll-recognition-guide.41108" target="_blank" rel="noopener">speedsolving post</a>
            | <a href="https://cubing.pt/wp-content/uploads/2017/03/pll2side-20140531.pdf" target="_blank" rel="noopener">Download original PDF</a>
          </small>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="home-footer text-center py-4 mt-5">
      <div class="container">
        <small class="text-secondary">
          <a href="https://bestsiteever.net" target="_blank" rel="noopener" class="footer-link">best site ever</a>
          <span class="mx-2">&middot;</span>
          by <a href="https://roman.bz" target="_blank" rel="noopener" class="footer-link">Roman Strakhov</a>
        </small>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Hero gradient background */
.hero-section {
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(var(--bs-primary-rgb), 0.08) 0%,
    transparent 70%
  );
}

/* Section dividers */
.section-divider {
  height: 1px;
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(
    to right,
    transparent,
    rgba(var(--bs-primary-rgb), 0.3),
    transparent
  );
}

/* Video section */
.video-section {
  background: linear-gradient(
    180deg,
    rgba(var(--bs-secondary-rgb), 0.03) 0%,
    transparent 100%
  );
}

.video-wrapper {
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
}

.video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(var(--bs-primary-rgb), 0.12) 0%,
    rgba(var(--bs-secondary-rgb), 0.08) 50%,
    rgba(var(--bs-primary-rgb), 0.04) 100%
  );
  color: var(--bs-body-color);
  z-index: 0;
}

.video-placeholder i {
  font-size: 3.5rem;
  opacity: 0.25;
}

.video-wrapper .ratio {
  position: relative;
  z-index: 1;
}

/* Guide section */
.guide-section {
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(var(--bs-primary-rgb), 0.05) 0%,
    transparent 60%
  );
}

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

/* Footer */
.home-footer {
  border-top: 1px solid rgba(var(--bs-secondary-rgb), 0.15);
}

.footer-link {
  color: var(--bs-body-color);
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.footer-link:hover {
  opacity: 1;
  color: rgb(var(--bs-primary-rgb));
}
</style>
