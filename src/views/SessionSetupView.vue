<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/SessionStore'
import { allPllKeys } from '@/scripts/pll_cases'
import { keysForGroups } from '@/scripts/guide_lookup'
import { presets, getGroups, presetKeys, subtitle } from '@/scripts/session_presets'
import { shuffle } from '@/scripts/helpers'
import StickerPattern from '@/components/guide/StickerPattern.vue'
import { useKeydown } from '@/composables/useKeydown'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()

const selectedPresetId = ref('all')
const customGroupIds = ref(null)
const sizeOption = ref(0)

// Initialize from query params (e.g., /setup?groups=three_bar)
const groupsParam = route.query.groups
if (groupsParam) {
  const ids = groupsParam.split(',')
  const sorted = [...ids].sort()
  const match = presets.find(p =>
    p.groups && p.groups.length === sorted.length &&
    [...p.groups].sort().every((g, i) => g === sorted[i])
  )
  if (match) {
    selectedPresetId.value = match.id
  } else {
    customGroupIds.value = ids
    selectedPresetId.value = 'custom'
  }
}

const customKeys = computed(() => customGroupIds.value ? keysForGroups(customGroupIds.value) : [])

const customLabel = computed(() =>
  getGroups(customGroupIds.value).map(g => g.title).join(' + ')
)

const poolKeys = computed(() => {
  if (selectedPresetId.value === 'custom') return customKeys.value
  const preset = presets.find(p => p.id === selectedPresetId.value)
  return preset ? presetKeys(preset) : allPllKeys()
})

const sizeOptions = [0, 0.15, 0.40, 1]

const extraCount = computed(() => Math.round(poolKeys.value.length * sizeOption.value))
const sessionCaseCount = computed(() => poolKeys.value.length + extraCount.value)

function selectPreset(id) {
  selectedPresetId.value = id
}

function buildSessionPool() {
  const keys = poolKeys.value
  if (sizeOption.value === 0) {
    return selectedPresetId.value === 'all' ? null : keys
  }
  if (sizeOption.value === 1) return [...keys, ...keys]
  return [...keys, ...shuffle([...keys]).slice(0, extraCount.value)]
}

function startSession() {
  session.startSession(buildSessionPool())
  router.push('/trainer')
}

useKeydown((e) => {
  if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
    e.preventDefault()
    startSession()
  }
})

const scrollRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = scrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function scrollBy(dir) {
  scrollRef.value?.scrollBy({ left: dir * 200, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollState()
  scrollRef.value?.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
  scrollRef.value?.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-4">
      <h3 class="fw-bold">Session Setup</h3>
      <p class="text-secondary mb-0">Choose which patterns to practice</p>
    </div>

    <div class="preset-scroll-wrapper">
      <button v-show="canScrollLeft" class="scroll-arrow scroll-arrow-left" @click="scrollBy(-1)">
        <i class="bi-chevron-left"></i>
      </button>
      <button v-show="canScrollRight" class="scroll-arrow scroll-arrow-right" @click="scrollBy(1)">
        <i class="bi-chevron-right"></i>
      </button>
    <div class="preset-scroll" ref="scrollRef">
    <div class="preset-grid">
      <!-- Custom card (from guide "Practice" button) -->
      <div v-if="customGroupIds"
           class="card preset-card"
           :class="{ 'preset-selected': selectedPresetId === 'custom' }"
           @click="selectPreset('custom')">
        <div class="card-body d-flex flex-column align-items-center text-center">
          <div class="preset-check">
            <i v-if="selectedPresetId === 'custom'" class="bi-check-circle-fill text-primary"></i>
            <i v-else class="bi-circle text-body-tertiary"></i>
          </div>
          <div class="preset-patterns mb-2">
            <StickerPattern
              v-for="group in getGroups(customGroupIds)"
              :key="group.id"
              :layers="group.header.layers"
              :cellSize="18"
              :minColumns="6"
            />
          </div>
          <h6 class="card-title mb-1">{{ customLabel }}</h6>
          <span class="badge text-bg-secondary mt-auto">{{ customKeys.length }} cases</span>
        </div>
      </div>

      <!-- Preset cards -->
      <div v-for="preset in presets"
           :key="preset.id"
           class="card preset-card"
           :class="{ 'preset-selected': selectedPresetId === preset.id }"
           @click="selectPreset(preset.id)">
        <div class="card-body d-flex flex-column align-items-center text-center">
          <div class="preset-check">
            <i v-if="selectedPresetId === preset.id" class="bi-check-circle-fill text-primary"></i>
            <i v-else class="bi-circle text-body-tertiary"></i>
          </div>
          <div v-if="preset.groups" class="preset-patterns mb-2">
            <StickerPattern
              v-for="group in getGroups(preset.groups)"
              :key="group.id"
              :layers="group.header.layers"
              :cellSize="18"
              :minColumns="6"
            />
          </div>
          <div v-else class="preset-icon mb-2">
            <i :class="preset.exclude ? 'bi-dash-circle' : 'bi-grid-3x3-gap-fill'"></i>
          </div>
          <h6 class="card-title mb-1">{{ preset.label }}</h6>
          <small v-if="subtitle(preset)" class="text-secondary d-block mb-2">{{ subtitle(preset) }}</small>
          <span class="badge text-bg-secondary mt-auto">{{ presetKeys(preset).length }} cases</span>
        </div>
      </div>
    </div>
    </div>
    </div>

    <div class="text-center mt-4">
      <div class="text-secondary small mb-2">Session size</div>
      <div class="btn-group" role="group">
        <template v-for="opt in sizeOptions" :key="opt">
          <input type="radio" class="btn-check" :id="'size-' + opt" v-model="sizeOption" :value="opt">
          <label class="btn btn-outline-secondary" :for="'size-' + opt">
            {{ poolKeys.length + Math.round(poolKeys.length * opt) }}
          </label>
        </template>
      </div>
      <div class="text-secondary small mt-1 opacity-50">Extra cases are random duplicates from the same set to make it less predictable</div>
    </div>

    <div class="text-center mt-3">
      <button class="btn btn-primary btn-lg px-5 py-2 start-btn" @click="startSession">
        <i class="bi-lightning-charge-fill me-1"/>Start Session ({{ sessionCaseCount }})
      </button>
      <div class="text-secondary small mt-2 opacity-50">Press Space to start</div>
    </div>
  </div>
</template>

<style scoped>
.preset-scroll-wrapper {
  position: relative;
}

.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  border: none;
  background: var(--bs-body-bg, #fff);
  color: var(--bs-body-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.15s;
}

.scroll-arrow:hover {
  opacity: 1;
}

.scroll-arrow-left {
  left: 4px;
}

.scroll-arrow-right {
  right: 4px;
}

.preset-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.preset-scroll::-webkit-scrollbar {
  display: none;
}

.preset-grid {
  display: inline-flex;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
}

.preset-card {
  width: 180px;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
  border: 2px solid transparent;
}

.preset-card:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.4);
}

.preset-selected {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.15rem rgba(var(--bs-primary-rgb), 0.15);
}

.preset-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 1.1rem;
}

.preset-patterns {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 36px;
}

.preset-icon {
  font-size: 1.8rem;
  opacity: 0.35;
  min-height: 36px;
  display: flex;
  align-items: center;
}
</style>