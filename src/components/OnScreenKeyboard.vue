<template>
  <div v-if="settings.store.showOnScreenKeyboard" class="text-center my-2">
    <div v-if="session.store.state === GameState.Playing">
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
    </div>
  </div>
</template>

<script setup>
import {onUnmounted, ref, watch} from 'vue'
import {useSessionStore, GameState} from '@/stores/SessionStore'
import {useSettingsStore} from '@/stores/SettingsStore'
import {PLL_LETTERS} from '@/scripts/helpers'

const session = useSessionStore()
const settings = useSettingsStore()

const letters = PLL_LETTERS

const fullNameRow1 = ['Aa', 'Ab', 'E', 'F', 'Ga', 'Gb', 'Gc']
const fullNameRow2 = ['Gd', 'H', 'Ja', 'Jb', 'Na', 'Nb', 'Ra']
const fullNameRow3 = ['Rb', 'T', 'Ua', 'Ub', 'V', 'Y', 'Z']

const buttonFeedback = ref({ key: null, type: null })

let feedbackTimer = null
watch(() => session.lastSubmission, (submission) => {
  if (!submission) return
  buttonFeedback.value = { key: submission.key, type: submission.type }
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    buttonFeedback.value = { key: null, type: null }
  }, 300)
}, { flush: 'sync' })

onUnmounted(() => clearTimeout(feedbackTimer))

function handleAnswer(answer, fullNameMode = false) {
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