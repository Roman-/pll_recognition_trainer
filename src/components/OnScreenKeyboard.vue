<template>
  <div v-if="settings.store.showOnScreenKeyboard" class="text-center my-2">
    <div v-if="session.store.state === GameState.Paused">
      <button class="btn btn-primary" @click="session.resumePlay()">
        {{ session.store.results.length === 0 ? 'Start' : 'Resume' }}
      </button>
    </div>
    <div v-else-if="session.store.state === GameState.Playing">
      <template v-if="settings.store.fullNameMode">
        <div class="d-flex flex-wrap justify-content-center mb-1">
          <button v-for="name in fullNameRow1" :key="name" class="btn btn-outline-primary m-1"
                  @click="session.submitAnswer(name, true)">
            {{ name }}
          </button>
        </div>
        <div class="d-flex flex-wrap justify-content-center mb-1">
          <button v-for="name in fullNameRow2" :key="name" class="btn btn-outline-primary m-1"
                  @click="session.submitAnswer(name, true)">
            {{ name }}
          </button>
        </div>
        <div class="d-flex flex-wrap justify-content-center mb-1">
          <button v-for="name in fullNameRow3" :key="name" class="btn btn-outline-primary m-1"
                  @click="session.submitAnswer(name, true)">
            {{ name }}
          </button>
        </div>
      </template>
      <template v-else>
        <div class="d-flex flex-wrap justify-content-center">
          <button v-for="letter in letters" :key="letter" class="btn btn-outline-primary m-1"
                  @click="session.submitAnswer(letter)">
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
import {useSessionStore, GameState} from '@/stores/SessionStore'
import {useSettingsStore} from '@/stores/SettingsStore'

const session = useSessionStore()
const settings = useSettingsStore()

const letters = ['A','E','F','G','H','J','N','R','T','U','V','Y','Z']

const fullNameRow1 = ['Aa', 'Ab', 'Ga', 'Gb', 'Gc', 'Gd']
const fullNameRow2 = ['Ja', 'Jb', 'Na', 'Nb', 'Ra', 'Rb', 'Ua', 'Ub']
const fullNameRow3 = ['E', 'F', 'H', 'T', 'V', 'Y', 'Z']
</script>

<style scoped>
button {
  min-width: 3rem;
}
</style>
