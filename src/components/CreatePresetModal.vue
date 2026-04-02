<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import { getGuideGroup, keysForGroups } from '@/scripts/guide_lookup'
import { ALL_GROUP_IDS } from '@/scripts/session_presets'
import { useCustomPresetsStore } from '@/stores/CustomPresetsStore'
import StickerPattern from '@/components/guide/StickerPattern.vue'
import guideData from '@/assets/guide/pll_two_sided_page1.json'

const props = defineProps(['closeCallback'])

const customPresetsStore = useCustomPresetsStore()

const modalRef = ref(null)
const selected = ref(new Set())
const nameManuallyEdited = ref(false)
const presetName = ref('')

const gridRows = guideData.layout.rows

const groups = computed(() =>
  ALL_GROUP_IDS.map(id => {
    const g = getGuideGroup(id)
    return {
      id,
      title: g.title,
      headerLayers: g.header.layers,
      caseCount: keysForGroups([id]).length,
    }
  })
)

const autoName = computed(() => {
  if (selected.value.size === 0) return ''
  return [...selected.value]
    .map(id => getGuideGroup(id)?.title)
    .filter(Boolean)
    .join(' + ')
})

watch(autoName, (name) => {
  if (!nameManuallyEdited.value) presetName.value = name
})

function toggleGroup(id) {
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selected.value = s
}

function onNameInput() {
  nameManuallyEdited.value = true
}

const totalCases = computed(() => {
  if (selected.value.size === 0) return 0
  return keysForGroups([...selected.value]).length
})

const canSave = computed(() => selected.value.size > 0 && presetName.value.trim().length > 0)

function selectAll() {
  selected.value = new Set(ALL_GROUP_IDS)
}

function selectNone() {
  selected.value = new Set()
  nameManuallyEdited.value = false
}

function save() {
  if (!canSave.value) return
  const label = presetName.value.trim() || autoName.value || 'Custom'
  customPresetsStore.addPreset(label, [...selected.value])
  Modal.getInstance(modalRef.value)?.hide()
}

function resetAll() {
  customPresetsStore.clearAll()
  Modal.getInstance(modalRef.value)?.hide()
}

onMounted(() => {
  const m = new Modal(modalRef.value)
  m.show()
  modalRef.value.addEventListener('hidden.bs.modal', props.closeCallback)
})
</script>

<template>
  <div class="modal fade" ref="modalRef" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create Custom Preset</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="Preset name"
              v-model="presetName"
              @input="onNameInput"
            >
          </div>

          <div class="d-flex justify-content-end gap-2 mb-2">
            <button class="btn btn-outline-secondary btn-sm" @click="selectAll">All</button>
            <button class="btn btn-outline-secondary btn-sm" @click="selectNone">None</button>
          </div>

          <div class="group-grid">
            <template v-for="row in gridRows" :key="row.join()">
              <div
                v-for="groupId in row"
                :key="groupId"
                class="group-cell"
                :class="{ 'group-selected': selected.has(groupId) }"
                @click="toggleGroup(groupId)"
              >
                <div class="group-check">
                  <i v-if="selected.has(groupId)" class="bi-check-square-fill text-primary"></i>
                  <i v-else class="bi-square text-body-tertiary"></i>
                </div>
                <StickerPattern
                  :layers="groups.find(g => g.id === groupId).headerLayers"
                  :cellSize="16"
                  :minColumns="6"
                />
                <div class="group-label">{{ groups.find(g => g.id === groupId).title }}</div>
                <span class="badge text-bg-secondary group-badge">{{ groups.find(g => g.id === groupId).caseCount }}</span>
              </div>
            </template>
          </div>

          <div class="text-center mt-3 text-secondary small">
            {{ selected.size > 0 ? totalCases + ' cases selected' : '\u00a0' }}
          </div>

          <div v-if="customPresetsStore.customPresets.length > 0" class="text-center mt-3">
            <button class="btn btn-link btn-sm text-danger text-decoration-none" @click="resetAll">
              <i class="bi-trash3 me-1"/>Reset all custom presets
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="!canSave" @click="save">
            <i class="bi-plus-lg me-1"/>Save Preset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.group-cell {
  position: relative;
  border: 2px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 0.6rem;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, background-color 0.15s;
}

.group-cell:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.4);
}

.group-selected {
  border-color: var(--bs-primary) !important;
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.group-check {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 1rem;
}

.group-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.group-badge {
  font-size: 0.65rem;
  margin-top: 0.25rem;
}
</style>
