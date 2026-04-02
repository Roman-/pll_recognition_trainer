<script setup>
import { getGroups, presetKeys, subtitle } from '@/scripts/session_presets'
import StickerPattern from '@/components/guide/StickerPattern.vue'
import PbStats from '@/components/PbStats.vue'

const props = defineProps({
  preset: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  deletable: { type: Boolean, default: false },
  pb: { type: Object, default: null },
})

defineEmits(['select', 'delete'])
</script>

<template>
  <div class="card preset-card" :class="{ 'preset-selected': selected }" @click="$emit('select')">
    <div class="card-body d-flex flex-column align-items-center text-center">
      <div class="preset-check">
        <i v-if="selected" class="bi-check-circle-fill text-primary"></i>
        <i v-else class="bi-circle text-body-tertiary"></i>
      </div>

      <button
        v-if="deletable"
        class="preset-delete"
        @click.stop="$emit('delete')"
        title="Delete preset"
      >
        <i class="bi-x-lg"></i>
      </button>

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
      <PbStats v-if="pb" :pb="pb"/>
      <span class="badge text-bg-secondary mt-auto">{{ presetKeys(preset).length }} cases</span>
    </div>
  </div>
</template>

<style scoped>
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

.preset-delete {
  position: absolute;
  top: 6px;
  left: 6px;
  border: none;
  background: none;
  color: var(--bs-secondary);
  font-size: 0.75rem;
  padding: 2px 4px;
  line-height: 1;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}

.preset-card:hover .preset-delete {
  opacity: 0.6;
}

.preset-delete:hover {
  opacity: 1 !important;
  color: var(--bs-danger);
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

.preset-stats {
  font-size: 0.78rem;
  line-height: 1.3;
}
</style>
