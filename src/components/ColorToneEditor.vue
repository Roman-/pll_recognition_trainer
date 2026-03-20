<script setup>
import {ref} from 'vue'
import {DefaultColorScheme} from '@/scripts/colors'

const props = defineProps({
  colorScheme: {
    type: Object,
    required: true
  }
})

const expanded = ref(false)

const faces = [
  {key: 'U', label: 'Top (U)'},
  {key: 'D', label: 'Bottom (D)'},
  {key: 'F', label: 'Front (F)'},
  {key: 'B', label: 'Back (B)'},
  {key: 'L', label: 'Left (L)'},
  {key: 'R', label: 'Right (R)'},
]

function resetColors() {
  for (const face of faces) {
    props.colorScheme[face.key].value = DefaultColorScheme[face.key].value
  }
}
</script>

<template>
  <div>
    <button
      class="btn btn-sm"
      :class="expanded ? 'btn-outline-secondary' : 'btn-outline-primary'"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Close' : 'Customize...' }}
    </button>

    <div v-if="expanded" class="row g-2 mt-2">
      <div v-for="face in faces" :key="face.key" class="col-4">
        <label class="form-label mb-1 small">{{ face.label }}</label>
        <input
          type="color"
          class="form-control form-control-color w-100"
          v-model="colorScheme[face.key].value"
        />
      </div>
      <div class="col-12">
        <button class="btn btn-link btn-sm p-0" @click="resetColors">Reset to defaults</button>
      </div>
    </div>
  </div>
</template>
