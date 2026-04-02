import {reactive, watch} from 'vue'
import {defineStore} from 'pinia'

const notesKey = 'pll_notes';
// notes: {`name/rotation` : note}
const initialNotes = JSON.parse(localStorage.getItem(notesKey)) || {}

export const useNotesStore = defineStore('notes', () => {
    const notes = reactive(initialNotes)

    watch(notes, () => localStorage.setItem(notesKey, JSON.stringify(notes)))

    const clearNotes = () => {
        Object.keys(notes).forEach(key => delete notes[key])
    }

    return {notes, clearNotes}
});
