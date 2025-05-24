<template>
  <div v-if="settings.store.showOnScreenKeyboard" class="text-center my-2">
    <div v-if="session.store.state === GameState.Paused">
      <button class="btn btn-primary" @click="session.resumePlay()">
        {{ session.store.results.length === 0 ? 'Start' : 'Resume' }}
      </button>
    </div>
    <div v-else-if="session.store.state === GameState.Playing">
      <div class="mb-2">
        <button class="btn btn-secondary" @click="session.pausePlay()">Pause</button>
      </div>
      <div class="d-flex flex-wrap justify-content-center">
        <button v-for="letter in letters" :key="letter" class="btn btn-outline-primary m-1"
                @click="session.submitAnswer(letter)">
          {{ letter }}
        </button>
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
</script>

<style scoped>
button {
  min-width: 3rem;
}
</style>
