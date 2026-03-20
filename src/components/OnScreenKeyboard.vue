<template>
  <div v-if="settings.store.showOnScreenKeyboard" class="text-center my-2">
    <div v-if="session.store.state === GameState.Paused">
      <button class="btn btn-primary" @click="session.resumePlay()">
        {{ session.store.results.length === 0 ? 'Start' : 'Resume' }}
      </button>
    </div>
    <div v-else-if="session.store.state === GameState.Playing">
      <template v-if="settings.store.fullNameMode">
        <div class="d-flex flex-nowrap justify-content-center mb-1 mx-1 fullname-row">
          <button v-for="name in fullNameRow1" :key="name" class="btn btn-fullname"
                  :class="buttonClass(name)" @click="handleAnswer(name, true)">
            {{ name }}
          </button>
        </div>
        <div class="d-flex flex-nowrap justify-content-center mb-1 mx-1 fullname-row">
          <button v-for="name in fullNameRow2" :key="name" class="btn btn-fullname"
                  :class="buttonClass(name)" @click="handleAnswer(name, true)">
            {{ name }}
          </button>
        </div>
        <div class="d-flex flex-nowrap justify-content-center mb-1 mx-1 fullname-row">
          <button v-for="name in fullNameRow3" :key="name" class="btn btn-fullname"
                  :class="buttonClass(name)" @click="handleAnswer(name, true)">
            {{ name }}
          </button>
        </div>
      </template>
      <template v-else>
        <div class="d-flex flex-wrap justify-content-center">
          <button v-for="letter in letters" :key="letter" class="btn m-1"
                  :class="buttonClass(letter)" @click="handleAnswer(letter)">
            {{ letter }}
          </button>
        </div>
      </template>
      <div class="mt-2">
        <button class="btn btn-secondary" @click="session.pausePlay()">Pause</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useSessionStore, GameState} from '@/stores/SessionStore'
import {useSettingsStore} from '@/stores/SettingsStore'

const session = useSessionStore()
const settings = useSettingsStore()

const letters = ['A','E','F','G','H','J','N','R','T','U','V','Y','Z']

const fullNameRow1 = ['Aa', 'Ab', 'E', 'F', 'Ga', 'Gb', 'Gc']
const fullNameRow2 = ['Gd', 'H', 'Ja', 'Jb', 'Na', 'Nb', 'Ra']
const fullNameRow3 = ['Rb', 'T', 'Ua', 'Ub', 'V', 'Y', 'Z']

const buttonFeedback = ref({ key: null, type: null })

function handleAnswer(answer, fullNameMode = false) {
  const current = session.currentCase
  if (current) {
    const correctName = fullNameMode ? current.name : current.name[0]
    const isCorrect = answer === correctName
    // Only flash on first attempt; on retries, flash correct only
    if (!session.store.mistake || isCorrect) {
      buttonFeedback.value = { key: answer, type: isCorrect ? 'correct' : 'wrong' }
      setTimeout(() => buttonFeedback.value = { key: null, type: null }, 300)
    }
  }
  session.submitAnswer(answer, fullNameMode)
}

function buttonClass(key) {
  if (buttonFeedback.value.key === key) {
    return buttonFeedback.value.type === 'correct' ? 'btn-success' : 'btn-danger'
  }
  return 'btn-outline-primary'
}
</script>

<style scoped>
button {
  min-width: 3rem;
}

.fullname-row {
  gap: 0.25rem;
}

.btn-fullname {
  flex: 1 1 0;
  max-width: 4rem;
  min-width: 0;
  padding: 0.375rem 0;
}

/* On touch devices, :hover sticks after a tap until you touch elsewhere.
   Reset hover back to the button's default look; :active still fires
   while the finger is down so there's still visual tap feedback. */
@media (hover: none) {
  button.btn:not(:active):hover {
    color: var(--bs-btn-color);
    background-color: var(--bs-btn-bg);
    border-color: var(--bs-btn-border-color);
  }
}
</style>