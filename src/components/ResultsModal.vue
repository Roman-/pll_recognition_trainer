<script setup>
import {onMounted, onUnmounted} from "vue";
import ResultsList from "@/components/ResultsList.vue";

const props = defineProps(['results', 'totalCases', 'closeCallback']);

const close = () => props.closeCallback()

const handleEscape = (e) => {
  if (e.key === 'Escape' && !document.querySelector('.modal.show')) {
    close()
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => {
  document.body.classList.add('overflow-hidden')
  window.addEventListener('keydown', handleEscape, true)
})

onUnmounted(() => {
  document.body.classList.remove('overflow-hidden')
  window.removeEventListener('keydown', handleEscape, true)
})
</script>

<template>
  <div class="results-overlay">
    <div class="results-content">
      <div class="h4">
        Results ({{ results.length }}/{{ totalCases }})
      </div>
      <hr>
      <div class="results-scroll">
        <ResultsList :results="results" :pictureSize="70" :showNotes="false"/>
      </div>
      <div class="results-footer">
        <button type="button" class="btn btn-primary" @click="close">
          Close (Esc)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-overlay {
  position: fixed;
  inset: 0;
  z-index: 1040;
  background: var(--bs-body-bg);
  display: flex;
  flex-direction: column;
}

.results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow: hidden;
}

.results-scroll {
  flex: 1;
  overflow-y: auto;
}

.results-footer {
  padding: 0.75rem 0 0;
  border-top: 1px solid var(--bs-border-color);
  text-align: end;
}
</style>
