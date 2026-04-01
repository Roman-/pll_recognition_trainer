<script setup>
import { formatAccuracy } from '@/scripts/formatters'
import { msToHumanReadable } from '@/scripts/time_formatter'

defineProps({
  pb: { type: Object, required: true },
})
</script>

<template>
  <div class="preset-stats mt-1">
    <div v-if="pb.bestAccuracy < 1" class="text-success small fw-bold">
      <i class="bi-bullseye me-1"/>{{ formatAccuracy(pb.bestAccuracy) }}
    </div>
    <div v-else class="text-warning small fw-bold">
      <i class="bi-star-fill me-1"/>Mastered
    </div>
    <div class="text-secondary small"><i class="bi-stopwatch me-1"/>{{ msToHumanReadable(pb.bestAvgTimeMs) }}/case</div>
    <div class="text-secondary small opacity-75">{{ pb.totalSessions }} session{{ pb.totalSessions !== 1 ? 's' : '' }}</div>
  </div>
</template>
