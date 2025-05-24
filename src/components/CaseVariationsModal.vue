<script setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import {Modal} from 'bootstrap'
import PllPic from "@/components/PllPic.vue";
import {useNotesStore} from "@/stores/NotesStore";
import Note from "@/components/Note.vue";
import {colorNameByLetter, CubeColors} from "@/scripts/colors";

const props = defineProps(['pllCase', 'closeCallback']);

const modal = ref(null)
const notes = useNotesStore()

// when the component is mounted (via v-if), show this modal right away and destroy (via callback) on close
onMounted(() => {
  const m = new Modal(modal.value);
  m.show();
  modal.value.addEventListener('hidden.bs.modal', props.closeCallback)
})

const pllCases = computed(() => {
  // populate pllCase from pllcases by altering dTurn and colorShift
  let variations = []
  const dTurns = ["", "d", "d2", "d\'"]
  const colorShifts = [0, 1, 2, 3]
  dTurns.forEach(dTurn => {
    colorShifts.forEach(colorShift => {
      variations.push({
        rotation: props.pllCase.rotation,
        name: props.pllCase.name,
        dTurn: dTurn,
        colorShift: colorShift,
        crossColor: props.pllCase.crossColor
      })
    })
    // rotate colorshifts array 1 element to the left
    colorShifts.push(colorShifts.shift())
  })
  return variations
})

const title = computed(() => {
  return props.pllCase.name + " perm" + (props.pllCase.rotation ? (" / " + props.pllCase.rotation) : "")
})

const crossColor = ref(colorNameByLetter(props.pllCase.crossColor))

</script>

<template>
  <div class="modal fade" ref="modal" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body">
          <div class="d-flex">
            <div>
              <PllPic :pllCase="pllCase" viewType="cube-top" :size="130" :clickable="false" :crossColor="crossColor"/>
            </div>
            <div class="flex-grow-1 m-2">
              <div class="h5">
                {{title}}
              </div>
              <div class="mb-1">
                Cross color:
                <select v-model="crossColor" class="mx-1">
                  <option v-for="c in CubeColors" :value="c">{{c}}</option>
                </select>
              </div>
              <div>
                <Note :pllCase="props.pllCase" :enableHotkeys="true"/>
              </div>
            </div>
            <div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
          </div>
          <hr>
          <div class="row gx-0">
            <div v-for="pllCase in pllCases" class="col-3 text-center">
              <PllPic :pllCase="pllCase" viewType="cube" :size="150" :clickable="false" :crossColor="crossColor"/>
            </div>
          </div>
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
