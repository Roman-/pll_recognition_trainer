<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/SessionStore'
import { allPllKeys } from '@/scripts/pll_cases'
import { keysForGroups, getGuideGroup } from '@/scripts/guide_lookup'
import StickerPattern from '@/components/guide/StickerPattern.vue'
import { useKeydown } from '@/composables/useKeydown'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()

const presets = [
  { id: 'all', label: 'All Cases', groups: null },
  { id: 'no_obvious_clues', label: 'No obvious clues', exclude: ['three_bar', 'double_lights', 'double_2bar'] },
  { id: 'no_lights', label: 'No Lights', exclude: ['double_lights', 'lone_lights', 'lights_plus_2bar'] },
  { id: 'no_bars', label: 'No Bars', exclude: ['three_bar', 'double_2bar', 'outside_2bar', 'inside_2bar', 'lights_plus_2bar'] },
  { id: 'all_lights', label: 'All Lights', groups: ['double_lights', 'lone_lights', 'lights_plus_2bar'] },
  { id: 'all_bars', label: 'All Bars', groups: ['three_bar', 'double_2bar', 'outside_2bar', 'inside_2bar'] },
  { id: 'double_lights', label: 'Double Lights', groups: ['double_lights'] },
  { id: 'bookends_no_bookends', label: 'Bookends/No Bookends', groups: ['bookends_no_bar', 'no_bookends'] },
]

const selectedPresetId = ref('all')
const customGroupIds = ref(null)

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

function getGroups(groupIds) {
  if (!groupIds) return []
  return groupIds.map(id => getGuideGroup(id)).filter(Boolean)
}

function presetKeys(preset) {
  if (preset.groups) return keysForGroups(preset.groups)
  if (preset.exclude) {
    const excludeSet = new Set(keysForGroups(preset.exclude))
    return allPllKeys().filter(k => !excludeSet.has(k))
  }
  return allPllKeys()
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

function subtitle(preset) {
  if (preset.exclude) {
    return 'Without ' + getGroups(preset.exclude).map(g => g.title).join(', ')
  }
  if (!preset.groups || preset.groups.length <= 1) return null
  return getGroups(preset.groups).map(g => g.title).join(' + ')
}

function selectPreset(id) {
  selectedPresetId.value = id
}

function startSession() {
  const pool = selectedPresetId.value === 'all' ? null : poolKeys.value
  session.startSession(pool)
  router.push('/trainer')
}

useKeydown((e) => {
  if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
    e.preventDefault()
    startSession()
  }
})
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-4">
      <h3 class="fw-bold">Session Setup</h3>
      <p class="text-secondary mb-0">Choose which patterns to practice</p>
    </div>

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

    <div class="text-center mt-4">
      <button class="btn btn-primary btn-lg px-5 py-2 start-btn" @click="startSession">
        <i class="bi-lightning-charge-fill me-1"/>Start Session ({{ poolKeys.length }})
      </button>
      <div class="text-secondary small mt-2 opacity-50">Press Space to start</div>
    </div>
  </div>
</template>

<style scoped>
.preset-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.preset-card {
  width: 210px;
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