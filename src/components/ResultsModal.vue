<script setup>
import {onMounted, ref} from "vue";
import {Modal} from 'bootstrap'
import ResultsList from "@/components/ResultsList.vue";

const props = defineProps(['results', 'totalCases', 'closeCallback']);

const modal = ref(null)

onMounted(() => {
  const m = new Modal(modal.value);
  m.show();
  modal.value.addEventListener('hidden.bs.modal', props.closeCallback)
})
</script>

<template>
  <div class="modal fade" ref="modal" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body">
          <div class="h4">
            Results ({{ results.length }}/{{ totalCases }})
          </div>
          <hr>
          <ResultsList :results="results" :pictureSize="70" :showNotes="false"/>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
