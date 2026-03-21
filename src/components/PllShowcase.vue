<script setup>
import { ref, reactive } from 'vue'
import PllPic from '@/components/PllPic.vue'
import CaseVariationsModal from '@/components/CaseVariationsModal.vue'
import pllMap from '@/assets/algs/pll.json'
import { keysToCases } from '@/scripts/pll_cases'
import { shuffle, aufByDturn } from '@/scripts/helpers'
import { DefaultAllowedCrossColors } from '@/scripts/colors'

const pllNames = Object.keys(pllMap)

const generateRow = () => {
  const keys = shuffle([...pllNames]).map(name => `${name}/`)
  return keysToCases(keys, DefaultAllowedCrossColors)
}

const rows = ref([generateRow(), generateRow(), generateRow()])
const paused = ref(false)
const selectedCase = ref(null)
const hoveredCards = reactive(new Set())

const aufLabel = (pllCase) => {
  const auf = aufByDturn(pllCase.dTurn)
  return auf || 'noAuf'
}
</script>

<template>
  <div
    class="showcase-wrapper"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      class="showcase-row"
      :class="[
        rowIndex === 1 ? 'scroll-right' : 'scroll-left',
        { paused }
      ]"
      :style="{ animationDuration: [60, 50, 55][rowIndex] + 's' }"
    >
      <div
        v-for="(pllCase, i) in [...row, ...row]"
        :key="i"
        class="showcase-card"
        @click="selectedCase = pllCase"
        @mouseenter="hoveredCards.add(`${rowIndex}-${i}`)"
        @mouseleave="hoveredCards.delete(`${rowIndex}-${i}`)"
      >
        <div class="card-header-row">
          <span class="case-name">{{ pllCase.name }}</span>
          <span class="auf-badge">{{ aufLabel(pllCase) }}</span>
        </div>
        <div class="card-pics">
          <PllPic
            :pllCase="pllCase"
            viewType="cube"
            hoverViewType="cube-pll"
            :size="80"
            :clickable="false"
            :hovered="hoveredCards.has(`${rowIndex}-${i}`)"
          />
          <PllPic
            :pllCase="pllCase"
            viewType="cube-top"
            :size="60"
            :clickable="false"
          />
        </div>
      </div>
    </div>
    <Teleport to="body">
      <CaseVariationsModal
        v-if="selectedCase"
        :pllCase="selectedCase"
        :closeCallback="() => selectedCase = null"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.showcase-wrapper {
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.showcase-row {
  display: flex;
  gap: 0.75rem;
  width: max-content;
  will-change: transform;
}

.showcase-row.scroll-left {
  animation: scrollLeft linear infinite;
}

.showcase-row.scroll-right {
  animation: scrollRight linear infinite;
}

.showcase-row.paused {
  animation-play-state: paused;
}

@keyframes scrollLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scrollRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.showcase-card {
  cursor: pointer;
  flex-shrink: 0;
  width: 150px;
  padding: 0.65rem;
  border-radius: 0.5rem;
  background: var(--bs-card-bg, var(--bs-body-bg));
  color: var(--bs-body-color);
  border: 1px solid var(--bs-border-color, rgba(0,0,0,0.13));
  transition: transform 0.2s, box-shadow 0.2s;
}

.showcase-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.case-name {
  font-weight: 700;
  font-size: 1rem;
}

.auf-badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  background: var(--bs-secondary-bg, rgba(0,0,0,0.08));
  color: var(--bs-secondary-color, var(--bs-body-color));
  font-family: monospace;
}

.card-pics {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

@media (max-width: 576px) {
  .showcase-card {
    width: 110px;
    padding: 0.4rem;
  }

  .case-name {
    font-size: 0.85rem;
  }
}
</style>
