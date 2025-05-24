<script setup>

import PllPic from "@/components/PllPic.vue";
import {GameState, useSessionStore} from "@/stores/SessionStore";
import PllCaseInfo from "@/components/PllCaseInfo.vue";
import {computed, onMounted, onUnmounted} from "vue";
import {isHelpKey, isPllLetter} from "@/scripts/helpers";
import ResultsList from "@/components/ResultsList.vue";
import OnScreenKeyboard from "@/components/OnScreenKeyboard.vue";
import {useSettingsStore} from "@/stores/SettingsStore";

const session = useSessionStore()
const settings = useSettingsStore()

const handleKeyPress = e => {
  // if bs modal (.modal.show) or note input (.noteInput) is present, ignore
  if (document.querySelector(".modal.show")
      || document.querySelector(".noteInput:focus")) {
    return
  }

  const withModifiers = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
  if (!withModifiers && e.key === "Escape") {
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
    session.submitAnswer(e.key.toUpperCase())
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
    session.submitAnswer(session.currentCase.name[0])
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
  if (session.store.state === GameState.Playing && session.store.mistake) {
    return settings.store.showOnScreenKeyboard
        ? `Click ${session.currentCase.name[0]} to continue`
        : `Press ${session.currentCase.name[0]} to continue, Esc to pause`;
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
      <div class="text-center">
        <PllPic :pllCase="session.currentCase" viewType="cube" :size="400" :clickable="false"/>
      </div>
      <div class="text-secondary text-center my-3">
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

    <div>
      <div class="d-flex h-100">
        <div class="card my-2">
          <div class="card-body overflow-auto">
            <div class="h4">
              {{
                `Results (${session.store.results.length}/${session.store.queue.length + session.store.results.length - (session.store.mistake === "" ? 0 : 1)})`
              }}
            </div>
            <hr>
            <div class="resultsContainer">
              <ResultsList :results="session.store.results" :pictureSize="70" :showNotes="false"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resultsContainer {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>