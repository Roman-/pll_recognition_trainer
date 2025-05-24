<script setup>
import {useNotesStore} from "@/stores/NotesStore";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {caseToKey} from "@/scripts/pll_cases";

const noteHotkey = 'N'

const props = defineProps({
  pllCase: Object,
  key: String,
  enableHotkeys: Boolean
})

const input = ref(null)

const key = computed(() => {
  if (props.key) {
    return props.key;
  }
  return caseToKey(props.pllCase)
})
const isEditing = ref(false)
const notes = useNotesStore()

const startEditing = () => {
  isEditing.value = true
  // focus input and select all
  setTimeout(() => {
    if (input.value) {
      input.value.focus()
      input.value.select()
    }
  }, 0)
}

const finishEditing = () => {
  isEditing.value = false
}
const inputKeyDown = (e) => {
  if (e.key === 'Enter' || e.key === 'Escape') {
    finishEditing()
    e.stopPropagation()
    e.preventDefault() // this is redundant, and e.stopPropagation() should be below the brace
  }
}


const componentKeyDown = (e) => {
  if (isEditing.value) {
    return
  }
  // shift + E to enable editing
  if (e.key === noteHotkey && e.shiftKey) {
    startEditing()
    e.stopPropagation()
    e.preventDefault()
  }
}

onMounted(() => {
  if (props.enableHotkeys) {
    window.addEventListener("keydown", componentKeyDown)
  }
})
onUnmounted(() => {
  if (props.enableHotkeys) {
    window.removeEventListener("keydown", componentKeyDown)
  }
})

</script>

<template>
  <div>
    <div v-if="isEditing" class="row">
      <div class="col-auto">
        <input
            type="text"
            maxlength="200"
            v-model.trim="notes.notes[key]"
            class="noteInput themed"
            @keydown="inputKeyDown"
            @focusout="finishEditing"
            ref="input"
        />
      </div>
      <div class="col-auto">
        Press Enter to save
      </div>
    </div>
    <div v-else>
      <div v-if="notes.notes[key]" class="row gx-0">
        <div class="col-auto h5" title="Your note">
          {{ notes.notes[key] }}
        </div>
        <div class="col-auto">
          <button
              @click="startEditing"
              class="btn btn-link btn-sm mx-1"
              :title="'Edit' + props.enableHotkeys ? ` (shift+${noteHotkey})` : ''"
          >
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </div>
      <button v-else class="btn btn-link px-0 py-0" @click="startEditing">
        Add note{{props.enableHotkeys ? ` (shift+${noteHotkey})` : ""}}
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
