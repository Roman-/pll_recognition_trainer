<script setup>
import {useSessionStore} from "@/stores/SessionStore";
import {useSettingsStore} from "@/stores/SettingsStore";
import {computed, watch} from "vue";
import confetti from "@hiseb/confetti";
import {resultsToEvalResults, evalQueueSize} from "@/scripts/evaluation";
import ResultsList from "@/components/ResultsList.vue";
import {msToHumanReadable} from "@/scripts/time_formatter";
import {formatAccuracy} from "@/scripts/formatters";
import {useRouter} from "vue-router";
import {useSessionPB} from "@/composables/usePersonalBests";
import {useQuestProgress} from "@/composables/useQuestProgress";
import {QUEST_STEPS, MASTERY_ACCURACY, keysForStep} from "@/scripts/quest";
import {buildSessionPool, SIZE_MEDIUM} from "@/scripts/session_sizing";

const session = useSessionStore()
const settings = useSettingsStore()
const router = useRouter()
const quest = useQuestProgress()

const evalResults = computed(() => resultsToEvalResults(session.store.results))
const totalTimeSpent = computed(() => {
  let ms = 0
  session.store.results.forEach(r => ms += (new Date(r.finished) - new Date(r.started)))
  return ms
})
const numCorrect = computed(() => session.store.results.filter(r => r.mistake === "").length)
const accuracy = computed(() => session.store.results.length > 0 ? numCorrect.value / session.store.results.length : 0)
const avgTimeMs = computed(() => session.store.results.length > 0 ? totalTimeSpent.value / session.store.results.length : 0)
const subtitle1 = computed(() => {
  return `${numCorrect.value}/${session.store.results.length} cases in ${msToHumanReadable(totalTimeSpent.value)}`
})
const subtitle2 = computed(() => {
  return `${msToHumanReadable(totalTimeSpent.value / session.store.results.length)} per case`
})
const personalizedCount = computed(() => evalQueueSize(evalResults.value, session.store.pool))

// Quest context
const activeQuestStepId = computed(() => settings.store.activeQuestStepId)
const questStep = computed(() => {
  if (!activeQuestStepId.value) return null
  return QUEST_STEPS.find(s => s.id === activeQuestStepId.value) || null
})
const isQuestSession = computed(() => questStep.value !== null)
const questMastered = computed(() => isQuestSession.value && accuracy.value >= MASTERY_ACCURACY)
const nextQuestStep = computed(() => {
  if (!questStep.value) return null
  return QUEST_STEPS.find(s => s.id === questStep.value.id + 1) || null
})

function startQuestStep(step) {
  const keys = keysForStep(step)
  const pool = step.groups ? buildSessionPool(keys, SIZE_MEDIUM) : null
  session.startSession(pool, SIZE_MEDIUM, step.label)
  settings.store.activeQuestStepId = step.id
  router.push('/trainer')
}

function retryQuestStep() {
  if (questStep.value) startQuestStep(questStep.value)
}

function startNextQuestStep() {
  if (nextQuestStep.value) startQuestStep(nextQuestStep.value)
}

const startPersonalizedTraining = () => {
  session.startPersonalized()
  router.push('/trainer')
}

const repeatSession = () => {
  session.startSession(session.store.pool, session.store.sizeOption, session.store.presetLabel)
  router.push('/trainer')
}

const { pb, sessionNumber, isNewBestAccuracy, isNewBestTime } = useSessionPB(
  session.store.pool, session.store.sizeOption, accuracy, avgTimeMs
)

watch([isNewBestAccuracy, isNewBestTime], ([acc, time]) => {
  if (acc || time) confetti({ count: 150, velocity: 250 })
})

watch(questMastered, (mastered) => {
  if (mastered) confetti({ count: 150, velocity: 250 })
})

</script>

<template>
  <div class="d-flex flex-column align-items-center">
    <h2>Results</h2>
    <p class="text-secondary mb-3">{{ subtitle1 }} &middot; {{ subtitle2 }}</p>

    <!-- Unified stats card -->
    <div v-if="sessionNumber > 0" class="card mb-3" style="max-width: 480px; width: 100%;">
      <div class="card-body text-center py-2 px-3">
        <div class="text-secondary small mb-1">
          Session #{{ sessionNumber }} &middot; {{ session.store.presetLabel || 'All Cases' }}
        </div>
        <div v-if="!pb" class="text-success small fw-bold">First session of this type!</div>
        <template v-else>
          <div class="d-flex justify-content-around">
            <div>
              <div class="text-secondary small">Accuracy</div>
              <div v-if="isNewBestAccuracy" class="text-success fw-bold">
                {{ formatAccuracy(accuracy) }} <i class="bi-star-fill"/>
              </div>
              <div v-else>
                {{ formatAccuracy(accuracy) }}
                <span class="text-secondary small">(PB: {{ formatAccuracy(pb.bestAccuracy) }})</span>
              </div>
            </div>
            <div>
              <div class="text-secondary small">Avg time</div>
              <div v-if="isNewBestTime" class="text-success fw-bold">
                {{ msToHumanReadable(avgTimeMs) }} <i class="bi-star-fill"/>
              </div>
              <div v-else>
                {{ msToHumanReadable(avgTimeMs) }}
                <span class="text-secondary small">(PB: {{ msToHumanReadable(pb.bestAvgTimeMs) }})</span>
              </div>
            </div>
          </div>
          <div v-if="isNewBestAccuracy || isNewBestTime" class="text-success fw-bold mt-1">
            New personal best!
          </div>
        </template>

        <!-- Quest mastery (inline within same card) -->
        <template v-if="isQuestSession">
          <hr class="my-2">
          <div class="text-secondary small mb-1">
            Journey &middot; {{ questStep.label }}
          </div>
          <div v-if="questMastered" class="text-success fw-bold">
            <i class="bi-check-circle-fill me-1"/>Step mastered!
          </div>
          <div v-else class="text-warning">
            {{ formatAccuracy(accuracy) }} &mdash; need {{ formatAccuracy(MASTERY_ACCURACY) }} to advance
          </div>
        </template>
      </div>
    </div>

    <!-- Primary CTA card -->
    <div class="card cta-card mt-2" style="max-width: 480px; width: 100%;">
      <div class="card-body text-center py-3">
        <template v-if="isQuestSession">
          <button v-if="questMastered && nextQuestStep" class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="startNextQuestStep">
            <i class="bi-arrow-right-circle-fill me-1"/>Next: {{ nextQuestStep.label }}
          </button>
          <button v-else-if="questMastered && !nextQuestStep" class="btn btn-success btn-lg px-4 py-2 start-btn" @click="router.push('/')">
            <i class="bi-trophy-fill me-1"/>Journey Complete!
          </button>
          <button v-else class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="retryQuestStep">
            <i class="bi-arrow-counterclockwise me-1"/>Try Again
          </button>
        </template>
        <template v-else>
          <button class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="startPersonalizedTraining">
            <i class="bi-lightning-charge-fill me-1"/>Personalized Training ({{ personalizedCount }})
          </button>
          <p class="text-secondary small mt-2 mb-0">
            Drills the cases you got wrong more often, with extra repetitions for your weakest patterns.
          </p>
        </template>
      </div>
    </div>

    <!-- Secondary actions -->
    <div class="d-flex flex-wrap justify-content-center gap-2 mt-3">
      <button v-if="isQuestSession" class="btn btn-sm btn-outline-primary" @click="startPersonalizedTraining">
        <i class="bi-lightning-charge-fill me-1"/>Personalized ({{ personalizedCount }})
      </button>
      <button class="btn btn-sm btn-outline-secondary" @click="repeatSession">
        <i class="bi-arrow-counterclockwise me-1"/>Repeat
      </button>
      <button class="btn btn-sm btn-outline-secondary" @click="router.push('/setup')">
        <i class="bi-plus-circle me-1"/>{{ isQuestSession ? 'Free Practice' : 'New Session' }}
      </button>
    </div>

    <!-- Results list -->
    <p class="text-secondary small text-center mt-4 mb-2">
      <i class="bi-info-circle me-1"/>Click any cube picture to view all color and AUF variations.
    </p>
    <div class="col-12 col-md-8 col-lg-6 mx-auto">
      <ResultsList :results="evalResults" :pictureSize="220" :showNotes="true" :showTopPicture="true" :cardLayout="true"/>
    </div>

    <!-- Bottom CTAs (duplicated after scrolling through results) -->
    <div class="col-12 col-md-8 col-lg-6 mx-auto text-center bottom-cta pt-3 mt-4 mb-4">
      <template v-if="isQuestSession">
        <button v-if="questMastered && nextQuestStep" class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="startNextQuestStep">
          <i class="bi-arrow-right-circle-fill me-1"/>Next: {{ nextQuestStep.label }}
        </button>
        <button v-else-if="questMastered && !nextQuestStep" class="btn btn-success btn-lg px-4 py-2 start-btn" @click="router.push('/')">
          <i class="bi-trophy-fill me-1"/>Journey Complete!
        </button>
        <button v-else class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="retryQuestStep">
          <i class="bi-arrow-counterclockwise me-1"/>Try Again
        </button>
      </template>
      <template v-else>
        <button class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="startPersonalizedTraining">
          <i class="bi-lightning-charge-fill me-1"/>Personalized Training ({{ personalizedCount }})
        </button>
      </template>
      <div class="d-flex flex-wrap justify-content-center gap-2 mt-2">
        <button v-if="isQuestSession" class="btn btn-sm btn-outline-primary" @click="startPersonalizedTraining">
          <i class="bi-lightning-charge-fill me-1"/>Personalized ({{ personalizedCount }})
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="repeatSession">
          <i class="bi-arrow-counterclockwise me-1"/>Repeat
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="router.push('/setup')">
          <i class="bi-plus-circle me-1"/>{{ isQuestSession ? 'Free Practice' : 'New Session' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cta-card {
  border-color: rgba(var(--bs-primary-rgb), 0.3);
}

.bottom-cta {
  border-top: 1px solid var(--bs-border-color);
}
</style>
