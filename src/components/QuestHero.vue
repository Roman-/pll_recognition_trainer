<script setup>
import { computed } from 'vue'
import GuideGroupCard from '@/components/guide/GuideGroupCard.vue'
import StickerPattern from '@/components/guide/StickerPattern.vue'
import { getGuideGroup } from '@/scripts/guide_lookup'
import { QUEST_STEPS, QUEST_PHASES, MASTERY_ACCURACY, keysForStep } from '@/scripts/quest'
import { formatAccuracy } from '@/scripts/formatters'
import guideData from '@/assets/guide/pll_two_sided_page1.json'

const props = defineProps({
  stepStatuses: { type: Array, required: true },
  currentStep: { type: Object, default: null },
  currentStepIndex: { type: Number, default: 0 },
  masteredCount: { type: Number, default: 0 },
  questComplete: { type: Boolean, default: false },
  loading: { type: Boolean, default: true },
})

const emit = defineEmits(['startStep', 'freePractice'])

const currentGuideGroup = computed(() => {
  if (!props.currentStep || props.currentStep.isCombo) return null
  return getGuideGroup(props.currentStep.groups[0])
})

const comboGroups = computed(() => {
  if (!props.currentStep || !props.currentStep.isCombo || !props.currentStep.groups) return []
  return props.currentStep.groups.map(id => getGuideGroup(id)).filter(Boolean)
})

const caseCount = computed(() => {
  if (!props.currentStep) return 0
  return keysForStep(props.currentStep).length
})

const completedSteps = computed(() => {
  return props.stepStatuses.filter(s => s.mastered)
})

const phaseSteps = computed(() => {
  return QUEST_PHASES.map(phase => ({
    phase,
    steps: QUEST_STEPS.filter(s => s.phase === phase.id).map(s => {
      const status = props.stepStatuses.find(st => st.step.id === s.id)
      return {
        step: s,
        mastered: status ? status.mastered : false,
        isCurrent: props.currentStep && s.id === props.currentStep.id,
      }
    })
  }))
})
</script>

<template>
  <section class="quest-hero">
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">

          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h4 class="mb-0 fw-bold">
              <i class="bi-map me-2 text-primary"/>Your Journey
            </h4>
            <button class="btn btn-sm btn-outline-secondary" @click="emit('freePractice')">
              Free Practice <i class="bi-arrow-right"/>
            </button>
          </div>

          <!-- Progress bar -->
          <div v-if="!loading" class="quest-progress mb-4">
            <div v-for="pg in phaseSteps" :key="pg.phase.id" class="quest-phase">
              <div class="quest-phase-label text-secondary small">{{ pg.phase.title }}</div>
              <div class="quest-phase-dots">
                <div
                  v-for="s in pg.steps"
                  :key="s.step.id"
                  class="quest-dot"
                  :class="{
                    'quest-dot-mastered': s.mastered,
                    'quest-dot-current': s.isCurrent,
                    'quest-dot-combo': s.step.isCombo,
                  }"
                  :title="s.step.label"
                >
                  <i v-if="s.mastered" class="bi-check-lg"/>
                  <span v-else-if="s.isCurrent" class="quest-dot-pulse"/>
                </div>
              </div>
            </div>
            <div class="quest-progress-text text-secondary small mt-1">
              {{ masteredCount }} / {{ stepStatuses.length }} steps completed
            </div>
          </div>

          <!-- Quest complete state -->
          <div v-if="questComplete" class="text-center py-4">
            <h3 class="text-success fw-bold mb-2">
              <i class="bi-trophy-fill me-2"/>Journey Complete!
            </h3>
            <p class="text-secondary mb-3">
              You've mastered all 21 PLL cases across every pattern group.
            </p>
            <button class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="emit('freePractice')">
              <i class="bi-lightning-charge-fill me-1"/>Free Practice
            </button>
          </div>

          <!-- Current step -->
          <template v-else-if="currentStep && !loading">
            <div class="quest-step-label text-secondary small mb-2">
              Step {{ currentStepIndex + 1 }} of {{ stepStatuses.length }}
              <span v-if="currentStep.isCombo" class="badge bg-primary-subtle text-primary-emphasis ms-1">Combo</span>
            </div>

            <!-- Individual group: show full guide card -->
            <div v-if="!currentStep.isCombo && currentGuideGroup" class="quest-guide-card mb-3">
              <GuideGroupCard
                :group="currentGuideGroup"
                :defaultPatternColumns="guideData.layout.defaultPatternColumns"
              />
            </div>

            <!-- Combo step: show group summaries -->
            <div v-else class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0 fw-bold">{{ currentStep.label }}</h6>
              </div>
              <div class="card-body">
                <div class="d-flex flex-wrap gap-3 justify-content-center">
                  <div v-for="group in comboGroups" :key="group.id" class="text-center">
                    <StickerPattern :layers="group.header.layers" :cellSize="18" :minColumns="6"/>
                    <div class="small text-secondary mt-1">{{ group.title }}</div>
                  </div>
                </div>
                <div class="text-center mt-2">
                  <span class="badge text-bg-secondary">{{ caseCount }} cases</span>
                </div>
              </div>
            </div>

            <!-- All Cases finale -->
            <div v-if="currentStep.id === 13" class="card mb-3">
              <div class="card-body text-center">
                <h5 class="fw-bold mb-1"><i class="bi-trophy me-1"/>Grand Finale</h5>
                <p class="text-secondary small mb-0">All 21 PLL cases, all pattern groups combined.</p>
              </div>
            </div>

            <!-- Practice button -->
            <div class="text-center">
              <button class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="emit('startStep', currentStep)">
                <i class="bi-lightning-charge-fill me-1"/>Practice {{ currentStep.label }}
              </button>
              <div class="text-secondary small mt-1">{{ caseCount }} cases</div>
            </div>
          </template>

          <!-- Completed steps -->
          <div v-if="completedSteps.length > 0 && !loading" class="mt-3">
            <details class="quest-completed">
              <summary class="text-secondary small">
                <i class="bi-check-circle-fill text-success me-1"/>{{ completedSteps.length }} step{{ completedSteps.length === 1 ? '' : 's' }} mastered
              </summary>
              <div class="quest-completed-list mt-2">
                <div v-for="s in completedSteps" :key="s.step.id" class="quest-completed-item">
                  <i class="bi-check-circle-fill text-success me-1"/>
                  <span>{{ s.step.label }}</span>
                  <span v-if="s.bestAccuracy !== null" class="text-secondary small ms-auto">{{ formatAccuracy(s.bestAccuracy) }}</span>
                </div>
              </div>
            </details>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.quest-hero {
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(var(--bs-primary-rgb), 0.08) 0%,
    transparent 70%
  );
}

.quest-progress {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.quest-phase-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.quest-phase-dots {
  display: flex;
  gap: 4px;
}

.quest-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--bs-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  position: relative;
  background: var(--bs-body-bg);
}

.quest-dot-combo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.quest-dot-mastered {
  background: var(--bs-success);
  border-color: var(--bs-success);
  color: white;
}

.quest-dot-current {
  border-color: var(--bs-primary);
  border-width: 2.5px;
}

.quest-dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bs-primary);
  animation: quest-pulse 1.5s ease-in-out infinite;
}

@keyframes quest-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.quest-progress-text {
  width: 100%;
}

.quest-guide-card {
  max-width: 400px;
  margin: 0 auto;
}

.quest-completed-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quest-completed-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
  font-size: 0.9rem;
}

.quest-completed summary {
  cursor: pointer;
  user-select: none;
}
</style>
