<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllSessions } from '@/scripts/session_history'
import { msToHumanReadable } from '@/scripts/time_formatter'

const router = useRouter()
const sessions = ref([])
const selectedType = ref('all')

onMounted(async () => {
  sessions.value = await getAllSessions()
})

const sessionTypes = computed(() => {
  const types = new Map()
  sessions.value.forEach(s => {
    const key = `${s.poolKey}|${s.sizeOption}`
    if (!types.has(key)) {
      types.set(key, { label: s.presetLabel, caseCount: s.caseCount, key })
    }
  })
  return [...types.values()]
})

const filteredSessions = computed(() => {
  if (selectedType.value === 'all') return sessions.value
  return sessions.value.filter(s => `${s.poolKey}|${s.sizeOption}` === selectedType.value)
})

// Compute PB flags per session type
const pbMap = computed(() => {
  const map = new Map()
  // Group by type, process in chronological order
  const byType = new Map()
  ;[...sessions.value].reverse().forEach(s => {
    const key = `${s.poolKey}|${s.sizeOption}`
    if (!byType.has(key)) byType.set(key, [])
    byType.get(key).push(s)
  })
  byType.forEach((typeSessions) => {
    let bestAccuracy = -1
    let bestAvgTime = Infinity
    typeSessions.forEach(s => {
      const acc = s.correctCount / s.totalCases
      const isPbAccuracy = acc > bestAccuracy
      const isPbTime = acc >= bestAccuracy && s.avgTimeMs < bestAvgTime
      if (isPbAccuracy || isPbTime) {
        map.set(s.id, true)
      }
      if (acc > bestAccuracy) bestAccuracy = acc
      if (acc >= bestAccuracy && s.avgTimeMs < bestAvgTime) bestAvgTime = s.avgTimeMs
    })
  })
  return map
})

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatAccuracy(s) {
  return ((s.correctCount / s.totalCases) * 100).toFixed(1) + '%'
}
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-4">
      <h3 class="fw-bold">Session History</h3>
    </div>

    <div v-if="sessions.length === 0" class="text-center text-secondary py-5">
      <i class="bi-clock-history" style="font-size: 3rem;"></i>
      <p class="mt-3">No completed sessions yet.</p>
      <button class="btn btn-primary" @click="router.push('/setup')">
        <i class="bi-lightning-charge-fill me-1"/>Start a session
      </button>
    </div>

    <template v-else>
      <div v-if="sessionTypes.length > 1" class="text-center mb-3">
        <select class="form-select form-select-sm d-inline-block" style="max-width: 280px;" v-model="selectedType">
          <option value="all">All types ({{ sessions.length }})</option>
          <option v-for="t in sessionTypes" :key="t.key" :value="t.key">
            {{ t.label }} ({{ t.caseCount }})
          </option>
        </select>
      </div>

      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="list-group">
            <div v-for="s in filteredSessions" :key="s.id" class="list-group-item">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-bold">{{ s.presetLabel }}</div>
                  <div class="text-secondary small">{{ formatDate(s.completedAt) }}</div>
                </div>
                <span v-if="pbMap.has(s.id)" class="badge bg-success">PB</span>
              </div>
              <div class="d-flex gap-3 mt-1 small">
                <span>
                  <i class="bi-bullseye me-1"/>{{ formatAccuracy(s) }}
                </span>
                <span>
                  <i class="bi-stopwatch me-1"/>{{ msToHumanReadable(s.avgTimeMs) }}/case
                </span>
                <span class="text-secondary">
                  {{ s.correctCount }}/{{ s.totalCases }} cases
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
</style>
