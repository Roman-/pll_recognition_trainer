<script setup>

import PllPic from "@/components/PllPic.vue";
import {GameState, useSessionStore} from "@/stores/SessionStore";
import {computed, onMounted, ref, watch} from "vue";
import {aufByDturn} from "@/scripts/pll_constants";
import Note from "@/components/Note.vue";
import ResultsList from "@/components/ResultsList.vue";
import OnScreenKeyboard from "@/components/OnScreenKeyboard.vue";
import ResultsModal from "@/components/ResultsModal.vue";
import GuideHint from "@/components/GuideHint.vue";
import {useSettingsStore} from "@/stores/SettingsStore";
import {isMobile} from "@/scripts/device";
import {useBreakpoint} from "@/composables/useBreakpoint";
import {useTrainerKeyboard} from "@/composables/useTrainerKeyboard";
import {useRouter} from "vue-router";

const session = useSessionStore()
const settings = useSettingsStore()
const router = useRouter()

const totalCases = computed(() =>
    session.store.queue.length + session.store.results.length - (session.store.mistake === "" ? 0 : 1)
)
const completed = computed(() => session.store.results.length)
const progressPercent = computed(() => totalCases.value > 0 ? (completed.value / totalCases.value * 100) : 0)

const shakeHint = ref(false)

const showMistake = computed(() =>
    session.store.state === GameState.Playing && !!session.store.mistake
)

const auf = computed(() => session.currentCase ? aufByDturn(session.currentCase.dTurn) : '')

const isXl = useBreakpoint('(min-width: 1200px)')

watch(() => session.store.state, (newState) => {
  if (newState === GameState.EvaluationDone) {
    router.replace('/results')
  }
})

watch(() => session.store.mistake, (newVal, oldVal) => {
  if (oldVal === "" && newVal) {
    shakeHint.value = true
    setTimeout(() => shakeHint.value = false, 2000)
  }
})

const { pendingKey } = useTrainerKeyboard(session, settings)

onMounted(() => {
  session.setInitial()
})

const keyPressHint = computed(() => {
  if (session.store.state === GameState.Playing && pendingKey.value) {
    return `${pendingKey.value}_ ...`
  }
  if (session.store.state === GameState.Playing && session.store.mistake) {
    const correctName = settings.store.fullNameMode
        ? session.currentCase.name
        : session.currentCase.name[0]
    return settings.store.showOnScreenKeyboard
        ? `Click ${correctName} to continue`
        : `Press ${correctName} to continue, Esc to pause`;
  }
  if (session.store.state === GameState.Playing && !session.store.mistake) {
    return settings.store.showOnScreenKeyboard
        ? "Which PLL case is this?"
        : "Enter PLL case name. Press Esc to pause";
  }
  if (session.store.state === GameState.Paused) {
    return settings.store.showOnScreenKeyboard
        ? ""
        : "Press space to " + (session.store.results.length === 0 ? "start" : "resume")
  }
  return session.store.state === GameState.Playing ? "Press Esc to pause" : "Press space to resume"
})

</script>

<template>
  <div class="d-flex h-100">
    <div class="flex-grow-1 d-flex flex-column">
      <div class="d-md-none mx-3 mt-2">
        <div class="progress" style="height: 22px;">
          <div class="progress-bar" role="progressbar"
               :style="{width: progressPercent + '%'}"
               :aria-valuenow="completed" aria-valuemin="0" :aria-valuemax="totalCases">
            {{ completed }}/{{ totalCases }}
          </div>
        </div>
      </div>
      <!-- Cube zone: 3-column grid on xl+, single column below -->
      <div class="trainer-cube-zone">
        <div class="trainer-side trainer-side-left">
          <template v-if="isXl && showMistake">
            <h2 class="text-center mb-2">{{ session.currentCase.name }} perm <span v-if="auf" class="badge bg-secondary" title="AUF">+{{ auf }}</span></h2>
            <GuideHint :pllCase="session.currentCase"/>
            <div class="mt-2">
              <Note :pllCase="session.currentCase" :enableHotkeys="true"/>
            </div>
          </template>
        </div>
        <div class="trainer-center">
          <PllPic :pllCase="session.currentCase" :viewType="session.store.mistake ? 'cube-pll' : 'cube'" :size="400" :clickable="false"/>
        </div>
        <div class="trainer-side trainer-side-right"></div>
      </div>
      <!-- Hint: show here when NOT mobile-mistake (desktop always, mobile no-mistake) -->
      <div v-if="isXl || !showMistake" class="text-secondary text-center my-3"
           :class="{ 'animate__animated animate__headShake': shakeHint }">
        {{ keyPressHint }}
      </div>
      <!-- Mobile/tablet mistake section (below xl) -->
      <div v-if="!isXl && showMistake" class="text-center mx-2 mb-3">
        <h2>{{ session.currentCase.name }} perm <span v-if="auf" class="badge bg-secondary" title="AUF">+{{ auf }}</span></h2>
        <GuideHint :pllCase="session.currentCase"/>
        <div class="mt-2">
          <Note :pllCase="session.currentCase" :enableHotkeys="true"/>
        </div>
      </div>
      <div v-if="session.store.state === GameState.Paused" class="text-center mb-3">
        <button class="btn btn-primary" @click="session.resumePlay()">
          {{ session.store.results.length === 0 ? 'Start' : 'Resume' }}<span v-if="!isMobile"> (Space)</span>
        </button>
      </div>
      <!-- Hint: show here when mobile-mistake (just above keyboard) -->
      <div v-if="!isXl && showMistake" class="text-secondary text-center mb-2"
           :class="{ 'animate__animated animate__headShake': shakeHint }">
        {{ keyPressHint }}
      </div>
      <OnScreenKeyboard/>
      <div v-if="session.store.state === GameState.Playing" class="text-center mb-3">
        <button v-if="isMobile" class="btn btn-secondary me-2" @click="session.pausePlay()">
          Pause
        </button>
        <button v-if="!session.store.mistake" class="btn btn-outline-secondary" @click="session.giveUpOnCase()">
          Give up<span v-if="!isMobile"> (S/?)</span>
        </button>
      </div>
    </div>

    <div class="d-none d-md-block results-sidebar">
      <div class="d-flex h-100">
        <div class="card my-2">
          <div class="card-body overflow-auto">
            <div class="h4">
              Results ({{ completed }}/{{ totalCases }})
            </div>
            <hr>
            <div class="resultsContainer">
              <ResultsList :results="session.store.results" :pictureSize="70" :showNotes="false"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ResultsModal v-if="session.store.showResultsModal"
                  :results="session.store.results"
                  :totalCases="totalCases"
                  :closeCallback="() => session.store.showResultsModal = false"/>
  </div>
</template>

<style scoped>
.flex-grow-1 {
  min-width: 0;
}

.results-sidebar {
  width: 290px;
  flex-shrink: 0;
}

.resultsContainer {
  overflow-y: auto;
  overflow-x: hidden;
}

.trainer-cube-zone {
  display: block;
  text-align: center;
}

.trainer-side {
  display: none;
}

@media (min-width: 1200px) {
  .trainer-cube-zone {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: start;
  }

  .trainer-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    padding-top: 1rem;
  }

  .trainer-side-left {
    justify-self: end;
  }

  .trainer-side-right {
    justify-self: start;
  }

  .trainer-center {
    width: 400px;
    max-width: 100%;
  }
}
</style>