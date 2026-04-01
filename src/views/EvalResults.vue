<script setup>
import {useSessionStore} from "@/stores/SessionStore";
import {computed, watch} from "vue";
import confetti from "@hiseb/confetti";
import {resultsToEvalResults, evalQueueSize} from "@/scripts/evaluation";
import ResultsList from "@/components/ResultsList.vue";
import {msToHumanReadable} from "@/scripts/time_formatter";
import {formatAccuracy} from "@/scripts/formatters";
import {useRouter} from "vue-router";
import {useSessionPB} from "@/composables/usePersonalBests";

const session = useSessionStore()
const router = useRouter()
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

</script>

<template>
  <div class="d-flex flex-column align-items-center">
    <h1>Evaluation results</h1>
    <h4>{{subtitle1}}</h4>
    <h4>{{subtitle2}}</h4>

    <div v-if="sessionNumber > 0" class="card mt-3 mb-2" style="max-width: 360px; width: 100%;">
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
      </div>
    </div>

    <button class="btn btn-primary btn-lg px-4 py-2 m-2 start-btn" @click="startPersonalizedTraining">
      <i class="bi-lightning-charge-fill me-1"/>Start personalized training ({{ personalizedCount }})
    </button>
    <button class="btn btn-outline-secondary btn-lg px-4 py-2 m-2" @click="repeatSession">
      <i class="bi-arrow-counterclockwise me-1"/>Repeat this session
    </button>
    <button class="btn btn-outline-primary btn-lg px-4 py-2 m-2" @click="router.push('/setup')">
      <i class="bi-plus-circle me-1"/>Start new session
    </button>
    <div class="col-12 col-md-8 col-lg-6 mx-auto p-2 pt-3">
      <p>
        Study these cases thoroughly and add notes on how you recognize them.
        You can <strong>click the cube picture</strong> to view the PLL in all color/AUF variations.
      </p>
      <p>
        When you start personalized training, you will be shown the cases you got wrong more often.
      </p>
    </div>
    <div class="col-12 col-md-8 col-lg-6 mx-auto">
      <ResultsList :results="evalResults" :pictureSize="220" :showNotes="true" :showTopPicture="true" :cardLayout="true"/>
    </div>
  </div>
</template>

<style scoped>
</style>
