<script setup>

import PllPic from "@/components/PllPic.vue";
import {GameState, useSessionStore} from "@/stores/SessionStore";
import PllCaseInfo from "@/components/PllCaseInfo.vue";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {isHelpKey, isPllLetter, isSingleLetterPll, isTwoLetterPllPrefix, validPllSuffixes} from "@/scripts/helpers";
import ResultsList from "@/components/ResultsList.vue";
import OnScreenKeyboard from "@/components/OnScreenKeyboard.vue";
import ResultsModal from "@/components/ResultsModal.vue";
import {useSettingsStore} from "@/stores/SettingsStore";

const session = useSessionStore()
const settings = useSettingsStore()

const totalCases = computed(() =>
    session.store.queue.length + session.store.results.length - (session.store.mistake === "" ? 0 : 1)
)
const completed = computed(() => session.store.results.length)
const progressPercent = computed(() => totalCases.value > 0 ? (completed.value / totalCases.value * 100) : 0)

const pendingKey = ref(null)
const shakeHint = ref(false)

watch(() => session.store.mistake, (newVal, oldVal) => {
  if (oldVal === "" && newVal) {
    shakeHint.value = true
    setTimeout(() => shakeHint.value = false, 2000)
  }
})

// Clear pendingKey when the case changes (e.g. correct answer submitted)
watch(() => session.currentCase, () => {
  pendingKey.value = null
})

const handleKeyPress = e => {
  // if bs modal (.modal.show) or note input (.noteInput) is present, ignore
  if (document.querySelector(".modal.show")
      || session.store.showResultsModal
      || document.querySelector(".noteInput:focus")) {
    return
  }

  const withModifiers = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey

  if (settings.store.fullNameMode && pendingKey.value) {
    // We have a buffered prefix key — handle second keystroke
    if (!withModifiers && e.key === "Escape") {
      pendingKey.value = null
      session.pausePlay()
      e.preventDefault()
      return
    }
    if (!withModifiers && e.key === "Backspace") {
      pendingKey.value = null
      e.preventDefault()
      return
    }
    if (!withModifiers && isHelpKey(e.key)) {
      pendingKey.value = null
      session.giveUpOnCase()
      e.preventDefault()
      return
    }
    if (!withModifiers) {
      const suffix = e.key.toLowerCase()
      const suffixes = validPllSuffixes[pendingKey.value]
      if (suffixes && suffixes.includes(suffix)) {
        const fullName = pendingKey.value + suffix
        session.submitAnswer(fullName, true)
        pendingKey.value = null
        e.preventDefault()
        return
      }
      // Invalid suffix — ignore
      e.preventDefault()
      return
    }
  }

  if (!withModifiers && e.key === "Escape") {
    pendingKey.value = null
    session.pausePlay()
    e.preventDefault()
    return
  }
  if (!withModifiers && e.key === " ") {
    session.resumePlay()
    e.preventDefault()
    return
  }
  if (!withModifiers && isPllLetter(e.key.toUpperCase())) {
    const letter = e.key.toUpperCase()
    if (settings.store.fullNameMode) {
      if (isSingleLetterPll(letter)) {
        session.submitAnswer(letter, true)
      } else if (isTwoLetterPllPrefix(letter)) {
        pendingKey.value = letter
      }
    } else {
      session.submitAnswer(letter)
    }
    e.preventDefault()
    return
  }
  if (!withModifiers && isHelpKey(e.key)) {
    session.giveUpOnCase()
    e.preventDefault()
    return
  }
  if (!withModifiers && e.key === '0' && session.currentCase) {
    // = cheat (for debugging purposes
    if (settings.store.fullNameMode) {
      session.submitAnswer(session.currentCase.name, true)
    } else {
      session.submitAnswer(session.currentCase.name[0])
    }
    e.preventDefault()
    return
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress)
  session.setInitial()
})

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress)
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
      <div class="text-center">
        <PllPic :pllCase="session.currentCase" viewType="cube" :size="400" :clickable="false"/>
      </div>
      <div class="text-secondary text-center my-3"
           :class="{ 'animate__animated animate__shakeX': shakeHint }">
        {{ keyPressHint }}
      </div>
      <OnScreenKeyboard/>
      <div v-if="session.store.state === GameState.Playing && session.store.mistake">
        <hr>
        <div class="d-flex justify-content-center">
          <PllCaseInfo :pllCase="session.currentCase"/>
        </div>
      </div>
    </div>

    <div class="d-none d-md-block">
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

.resultsContainer {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>