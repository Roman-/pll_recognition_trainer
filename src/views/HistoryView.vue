<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/SessionStore'
import { getAllSessions } from '@/scripts/session_history'
import { msToHumanReadable } from '@/scripts/time_formatter'
import { shuffle } from '@/scripts/helpers'

const router = useRouter()
const session = useSessionStore()
const sessions = ref([])
const selectedType = ref('all')
const currentPage = ref(1)
const PAGE_SIZE = 10

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

const totalPages = computed(() => Math.ceil(filteredSessions.value.length / PAGE_SIZE))

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredSessions.value.slice(start, start + PAGE_SIZE)
})

const showingRange = computed(() => {
  const total = filteredSessions.value.length
  if (total === 0) return ''
  const start = (currentPage.value - 1) * PAGE_SIZE + 1
  const end = Math.min(currentPage.value * PAGE_SIZE, total)
  return `${start}\u2013${end} of ${total}`
})

watch(selectedType, () => { currentPage.value = 1 })

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

// Trend per session type: compare avg accuracy of last 3 vs previous 3
const trendMap = computed(() => {
  const map = new Map()
  const byType = new Map()
  sessions.value.forEach(s => {
    const key = `${s.poolKey}|${s.sizeOption}`
    if (!byType.has(key)) byType.set(key, [])
    byType.get(key).push(s)
  })
  byType.forEach((typeSessions, key) => {
    if (typeSessions.length < 4) return
    // sessions are already newest-first
    const recent3 = typeSessions.slice(0, 3)
    const prev3 = typeSessions.slice(3, 6)
    if (prev3.length === 0) return
    const avgAcc = arr => arr.reduce((sum, s) => sum + s.correctCount / s.totalCases, 0) / arr.length
    const recentAcc = avgAcc(recent3)
    const prevAcc = avgAcc(prev3)
    const diff = recentAcc - prevAcc
    if (diff > 0.02) map.set(key, 'up')
    else if (diff < -0.02) map.set(key, 'down')
  })
  return map
})

function sessionTypeKey(s) {
  return `${s.poolKey}|${s.sizeOption}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatAccuracy(s) {
  return ((s.correctCount / s.totalCases) * 100).toFixed(1) + '%'
}

function repeatSession(s) {
  const keys = s.poolKey.split(',')
  let pool = keys
  if (s.sizeOption === 1) {
    pool = [...keys, ...keys]
  } else if (s.sizeOption > 0) {
    const extra = Math.round(keys.length * s.sizeOption)
    pool = [...keys, ...shuffle([...keys]).slice(0, extra)]
  }
  session.startSession(pool, s.sizeOption, s.presetLabel)
  router.push('/trainer')
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
      <div class="d-flex justify-content-center gap-4 mb-3 text-secondary small">
        <span><strong>{{ sessions.length }}</strong> sessions</span>
        <span><strong>{{ sessionTypes.length }}</strong> presets</span>
      </div>

      <div v-if="sessionTypes.length > 1" class="text-center mb-3">
        <select class="form-select form-select-sm d-inline-block" style="max-width: 280px;" v-model="selectedType">
          <option value="all">All types ({{ sessions.length }})</option>
          <option v-for="t in sessionTypes" :key="t.key" :value="t.key">
            {{ t.label }} ({{ t.caseCount }})
            <template v-if="trendMap.has(t.key)">{{ trendMap.get(t.key) === 'up' ? '\u25B2' : '\u25BC' }}</template>
          </option>
        </select>
      </div>

      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div v-if="totalPages > 1" class="text-center text-secondary small mb-2">
            Showing {{ showingRange }}
          </div>
          <div class="list-group">
            <div v-for="s in paginatedSessions" :key="s.id" class="list-group-item">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="fw-bold">
                    {{ s.presetLabel }}
                    <i v-if="trendMap.get(sessionTypeKey(s)) === 'up'" class="bi-arrow-up-short text-success"></i>
                    <i v-else-if="trendMap.get(sessionTypeKey(s)) === 'down'" class="bi-arrow-down-short text-danger"></i>
                  </div>
                  <div class="text-secondary small">{{ formatDate(s.completedAt) }}</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span v-if="pbMap.has(s.id)" class="badge bg-success">PB</span>
                  <button class="btn btn-sm btn-outline-primary repeat-btn" @click="repeatSession(s)" title="Repeat this session">
                    <i class="bi-lightning-charge-fill"></i>
                  </button>
                </div>
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

          <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Prev</a>
              </li>
              <li class="page-item disabled">
                <span class="page-link">{{ currentPage }} / {{ totalPages }}</span>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.repeat-btn {
  padding: 0.2rem 0.4rem;
  line-height: 1;
  font-size: 0.85rem;
}
</style>