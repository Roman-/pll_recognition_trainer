<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/SessionStore'
import { useSettingsStore } from '@/stores/SettingsStore'
import { useCustomPresetsStore } from '@/stores/CustomPresetsStore'
import { allPllKeys } from '@/scripts/pll_cases'
import { keysForGroups } from '@/scripts/guide_lookup'
import { presets, presetKeys } from '@/scripts/session_presets'
import { SIZE_OPTIONS, SIZE_DEFAULT, SIZE_UNIQUE, computeSessionTotal, computeExtraCount, buildSessionPool as buildPool, sizeHelpText } from '@/scripts/session_sizing'
import { useKeydown } from '@/composables/useKeydown'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'
import { usePresetPBs } from '@/composables/usePersonalBests'
import PresetCard from '@/components/PresetCard.vue'
import CreatePresetModal from '@/components/CreatePresetModal.vue'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()
const settings = useSettingsStore()
const customPresetsStore = useCustomPresetsStore()

onMounted(() => {
  settings.store.activeQuestStepId = null
})
const { scrollRef, canScrollLeft, canScrollRight, scrollBy } = useHorizontalScroll()

const selectedPresetId = ref('all')
const sizeOption = ref(SIZE_DEFAULT)
const showCreateModal = ref(false)

// Initialize from query params (e.g., /setup?groups=three_bar)
const groupsParam = route.query.groups
if (groupsParam) {
  const ids = groupsParam.split(',')
  const sorted = [...ids].sort()
  // Check default presets
  const defaultMatch = presets.find(p =>
    p.groups && p.groups.length === sorted.length &&
    [...p.groups].sort().every((g, i) => g === sorted[i])
  )
  if (defaultMatch) {
    selectedPresetId.value = defaultMatch.id
  } else {
    // Check custom presets
    const customMatch = customPresetsStore.customPresets.find(p =>
      p.groups.length === sorted.length &&
      [...p.groups].sort().every((g, i) => g === sorted[i])
    )
    if (customMatch) {
      selectedPresetId.value = customMatch.id
    } else {
      // Auto-create a custom preset
      const preset = customPresetsStore.addPreset(ids.map(id => id).join(' + '), ids)
      selectedPresetId.value = preset.id
    }
  }
}

const allPresets = computed(() => [...presets, ...customPresetsStore.customPresets])

function findPreset(id) {
  return allPresets.value.find(p => p.id === id)
}

const poolKeys = computed(() => {
  const preset = findPreset(selectedPresetId.value)
  return preset ? presetKeys(preset) : allPllKeys()
})

const extraCount = computed(() => computeExtraCount(poolKeys.value.length, sizeOption.value))
const sessionCaseCount = computed(() => computeSessionTotal(poolKeys.value.length, sizeOption.value))

const { presetPBs } = usePresetPBs(sizeOption)

function selectPreset(id) {
  selectedPresetId.value = id
}

function deletePreset(id) {
  if (selectedPresetId.value === id) selectedPresetId.value = 'all'
  customPresetsStore.removePreset(id)
}

function buildSessionPool() {
  if (sizeOption.value === SIZE_UNIQUE && selectedPresetId.value === 'all') return null
  return buildPool(poolKeys.value, sizeOption.value)
}

function getPresetLabel() {
  const preset = findPreset(selectedPresetId.value)
  return preset ? preset.label : 'All Cases'
}

function startSession() {
  session.startSession(buildSessionPool(), sizeOption.value, getPresetLabel())
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
    <div v-if="settings.store.questMode && settings.store.questStarted" class="text-center mb-2">
      <router-link to="/" class="text-secondary small text-decoration-none">
        <i class="bi-arrow-left me-1"/>Back to Quest
      </router-link>
    </div>
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
          <PresetCard
            v-for="preset in allPresets"
            :key="preset.id"
            :preset="preset"
            :selected="selectedPresetId === preset.id"
            :deletable="preset.id.startsWith('custom_')"
            :pb="presetPBs.get(preset.id)"
            @select="selectPreset(preset.id)"
            @delete="deletePreset(preset.id)"
          />
          <div class="card preset-card add-card" @click="showCreateModal = true">
            <div class="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <i class="bi-plus-lg add-icon"></i>
              <small class="text-secondary mt-1">Custom</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-4">
      <div class="text-secondary small mb-2">Session size</div>
      <div class="btn-group" role="group">
        <template v-for="opt in SIZE_OPTIONS" :key="opt">
          <input type="radio" class="btn-check" :id="'size-' + opt" v-model="sizeOption" :value="opt">
          <label class="btn btn-outline-secondary" :for="'size-' + opt">
            {{ computeSessionTotal(poolKeys.length, opt) }}
          </label>
        </template>
      </div>
      <div class="small mt-1 opacity-50" :class="sizeOption === SIZE_UNIQUE ? 'text-warning' : 'text-secondary'">{{ sizeHelpText(sizeOption) }}</div>
    </div>

    <div class="text-center mt-3">
      <button class="btn btn-primary btn-lg px-5 py-2 start-btn" @click="startSession">
        <i class="bi-lightning-charge-fill me-1"/>Start Session ({{ sessionCaseCount }})
      </button>
      <div class="text-secondary small mt-2 opacity-50">Press Space to start</div>
    </div>

    <CreatePresetModal v-if="showCreateModal" :closeCallback="() => showCreateModal = false"/>
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

.add-card {
  width: 180px;
  flex-shrink: 0;
  cursor: pointer;
  border: 2px dashed var(--bs-border-color);
  transition: border-color 0.2s;
}

.add-card:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.5);
}

.add-icon {
  font-size: 2rem;
  opacity: 0.4;
}

.add-card:hover .add-icon {
  opacity: 0.7;
}
</style>
