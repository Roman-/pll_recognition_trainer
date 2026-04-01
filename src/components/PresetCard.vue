<script setup>
import { getGroups, presetKeys, subtitle } from '@/scripts/session_presets'
import { msToHumanReadable } from '@/scripts/time_formatter'
import StickerPattern from '@/components/guide/StickerPattern.vue'

const props = defineProps({
  preset: { type: Object, default: null },
  customGroupIds: { type: Array, default: null },
  customLabel: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  pb: { type: Object, default: null },
})

defineEmits(['select'])

function formatAccuracy(val) {
  return (val * 100).toFixed(1) + '%'
}
</script>

<template>
  <div class="card preset-card" :class="{ 'preset-selected': selected }" @click="$emit('select')">
    <div class="card-body d-flex flex-column align-items-center text-center">
      <div class="preset-check">
        <i v-if="selected" class="bi-check-circle-fill text-primary"></i>
        <i v-else class="bi-circle text-body-tertiary"></i>
      </div>

      <!-- Custom card -->
      <template v-if="customGroupIds">
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
        <div v-if="pb" class="preset-stats mt-1">
          <div class="text-success small fw-bold">
            <i class="bi-bullseye me-1"/>{{ formatAccuracy(pb.bestAccuracy) }}
            <i v-if="pb.bestAccuracy === 1" class="bi-star-fill text-warning ms-1"></i>
          </div>
          <div class="text-secondary small"><i class="bi-stopwatch me-1"/>{{ msToHumanReadable(pb.bestAvgTimeMs) }}/case</div>
          <div class="text-secondary small opacity-75">{{ pb.totalSessions }} session{{ pb.totalSessions !== 1 ? 's' : '' }}</div>
        </div>
        <span class="badge text-bg-secondary mt-auto">{{ presetKeys({ groups: customGroupIds }).length }} cases</span>
      </template>

      <!-- Preset card -->
      <template v-else-if="preset">
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
        <div v-if="pb" class="preset-stats mt-1">
          <div class="text-success small fw-bold">
            <i class="bi-bullseye me-1"/>{{ formatAccuracy(pb.bestAccuracy) }}
            <i v-if="pb.bestAccuracy === 1" class="bi-star-fill text-warning ms-1"></i>
          </div>
          <div class="text-secondary small"><i class="bi-stopwatch me-1"/>{{ msToHumanReadable(pb.bestAvgTimeMs) }}/case</div>
          <div class="text-secondary small opacity-75">{{ pb.totalSessions }} session{{ pb.totalSessions !== 1 ? 's' : '' }}</div>
        </div>
        <span class="badge text-bg-secondary mt-auto">{{ presetKeys(preset).length }} cases</span>
      </template>
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
