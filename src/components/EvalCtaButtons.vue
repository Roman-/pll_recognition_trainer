<script setup>
const props = defineProps({
  isQuestSession: Boolean,
  questMastered: Boolean,
  nextQuestStep: Object,
  personalizedCount: Number,
  showDescription: Boolean,
})

const emit = defineEmits(['startNext', 'retry', 'personalized', 'repeat', 'newSession', 'journeyComplete'])
</script>

<template>
  <template v-if="isQuestSession">
    <button v-if="questMastered && nextQuestStep" class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="emit('startNext')">
      <i class="bi-arrow-right-circle-fill me-1"/>Next: {{ nextQuestStep.label }}
    </button>
    <button v-else-if="questMastered && !nextQuestStep" class="btn btn-success btn-lg px-4 py-2 start-btn" @click="emit('journeyComplete')">
      <i class="bi-trophy-fill me-1"/>Journey Complete!
    </button>
    <button v-else class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="emit('retry')">
      <i class="bi-arrow-counterclockwise me-1"/>Try Again
    </button>
  </template>
  <template v-else>
    <button class="btn btn-primary btn-lg px-4 py-2 start-btn" @click="emit('personalized')">
      <i class="bi-lightning-charge-fill me-1"/>Personalized Training ({{ personalizedCount }})
    </button>
    <p v-if="showDescription" class="text-secondary small mt-2 mb-0">
      Drills the cases you got wrong more often, with extra repetitions for your weakest patterns.
    </p>
  </template>
  <div class="d-flex flex-wrap justify-content-center gap-2 mt-2">
    <button v-if="isQuestSession" class="btn btn-sm btn-outline-primary" @click="emit('personalized')">
      <i class="bi-lightning-charge-fill me-1"/>Personalized ({{ personalizedCount }})
    </button>
    <button class="btn btn-sm btn-outline-secondary" @click="emit('repeat')">
      <i class="bi-arrow-counterclockwise me-1"/>Repeat
    </button>
    <button class="btn btn-sm btn-outline-secondary" @click="emit('newSession')">
      <i class="bi-plus-circle me-1"/>{{ isQuestSession ? 'Free Practice' : 'New Session' }}
    </button>
  </div>
</template>
