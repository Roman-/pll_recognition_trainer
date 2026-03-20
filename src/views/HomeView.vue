<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PllShowcase from '@/components/PllShowcase.vue'

const router = useRouter()

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches)

function onKeydown(e) {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault()
    router.push('/trainer')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
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
  </div>
</template>

<style scoped>
.start-btn {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.start-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 100%
  );
  transition: left 0.5s ease;
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(var(--bs-primary-rgb), 0.5);
}

.start-btn:hover::before {
  left: 100%;
}
</style>
