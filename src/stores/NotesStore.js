import {computed, reactive, ref, watch} from 'vue'
import {defineStore} from 'pinia'

const notesKey = 'pll_notes';
// notes: {`name/auf` : note}
const initialNotes = JSON.parse(localStorage.getItem(notesKey)) || {}

export const useNotesStore = defineStore('notes', () => {
    const notes = reactive(initialNotes)

    watch(notes, () => localStorage.setItem(notesKey, JSON.stringify(notes)))

    return {notes}
});
