<script setup>
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/SessionStore'
import { msToHumanReadable } from '@/scripts/time_formatter'
import { formatAccuracy, formatDate, sessionTypeKey } from '@/scripts/formatters'
import { buildSessionPool } from '@/scripts/session_sizing'
import { useSessionHistory } from '@/composables/useSessionHistory'

const router = useRouter()
const session = useSessionStore()

const {
  sessions,
  sessionTypes,
  selectedType,
  filteredSessions,
  currentPage,
  totalPages,
  paginatedSessions,
  showingRange,
  pbMap,
  trendMap,
} = useSessionHistory()

function repeatSession(s) {
  const keys = s.poolKey.split(',')
  const pool = buildSessionPool(keys, s.sizeOption)
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
                  <i class="bi-bullseye me-1"/>{{ formatAccuracy(s.correctCount / s.totalCases) }}
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
