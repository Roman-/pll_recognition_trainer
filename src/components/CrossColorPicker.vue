<script setup>
import {computed} from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['w']
  }
})
const emit = defineEmits(['update:modelValue'])

const colors = [
  {letter: 'w', name: 'White', hex: '#FFFFFF', darkCheck: true},
  {letter: 'y', name: 'Yellow', hex: '#FFFF00', darkCheck: true},
  {letter: 'b', name: 'Blue', hex: '#0000FF', darkCheck: false},
  {letter: 'g', name: 'Green', hex: '#32CD32', darkCheck: false},
  {letter: 'o', name: 'Orange', hex: '#FFA500', darkCheck: false},
  {letter: 'r', name: 'Red', hex: '#FF0000', darkCheck: false},
]

const allSelected = computed(() => props.modelValue.length === colors.length)

function isSelected(letter) {
  return props.modelValue.includes(letter)
}

function toggle(letter) {
  if (isSelected(letter)) {
    if (props.modelValue.length <= 1) {
      // Shake the swatch — can't deselect last one
      const el = document.querySelector(`.swatch[data-color="${letter}"]`)
      if (el) {
        el.classList.remove('shake')
        void el.offsetWidth
        el.classList.add('shake')
      }
      return
    }
    emit('update:modelValue', props.modelValue.filter(c => c !== letter))
  } else {
    emit('update:modelValue', [...props.modelValue, letter])
  }
}

function selectAll() {
  emit('update:modelValue', colors.map(c => c.letter))
}

function onlyWhite() {
  emit('update:modelValue', ['w'])
}
</script>

<template>
  <div class="cross-color-picker">
    <div class="swatches">
      <div v-for="color in colors" :key="color.letter" class="swatch-wrapper">
        <button
          class="swatch"
          :class="{selected: isSelected(color.letter), light: color.darkCheck}"
          :data-color="color.letter"
          :style="{backgroundColor: color.hex}"
          :aria-pressed="isSelected(color.letter)"
          :aria-label="color.name"
          @click="toggle(color.letter)"
        >
          <svg v-if="isSelected(color.letter)" class="checkmark" viewBox="0 0 24 24" fill="none"
               :stroke="color.darkCheck ? '#333' : '#fff'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 12 10 18 20 6"/>
          </svg>
        </button>
        <span class="swatch-label" :class="{selected: isSelected(color.letter)}">{{ color.name }}</span>
      </div>
    </div>
    <div class="picker-actions">
      <button v-if="!allSelected" class="btn btn-link btn-sm p-0" @click="selectAll">Select all</button>
      <button v-else class="btn btn-link btn-sm p-0" @click="onlyWhite">Only white</button>
    </div>
  </div>
</template>

<style scoped>
.cross-color-picker {
  display: block;
}

.swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.swatch-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.swatch {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(128, 128, 128, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  outline: none;
}

.swatch.light {
  border-color: rgba(128, 128, 128, 0.5);
}

.swatch.selected {
  border: 3px solid var(--bs-primary, #0d6efd);
  transform: scale(1.1);
}

.swatch:focus-visible {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.5);
}

@media (hover: hover) {
  .swatch:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  }

  .swatch.selected:hover {
    transform: scale(1.1) translateY(-2px);
  }
}

.checkmark {
  width: 20px;
  height: 20px;
}

.swatch-label {
  font-size: 0.7rem;
  color: var(--bs-secondary-color, #6c757d);
  transition: font-weight 0.2s;
}

.swatch-label.selected {
  font-weight: 600;
}

.picker-actions {
  margin-top: 12px;
}

@keyframes shake {
  0%, 100% { transform: scale(1.1) translateX(0); }
  20% { transform: scale(1.1) translateX(-4px); }
  40% { transform: scale(1.1) translateX(4px); }
  60% { transform: scale(1.1) translateX(-3px); }
  80% { transform: scale(1.1) translateX(3px); }
}

.swatch.shake {
  animation: shake 0.3s ease;
}
</style>
