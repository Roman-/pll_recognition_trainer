import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'

const localStorageKey = 'pll_custom_presets'

export const useCustomPresetsStore = defineStore('customPresets', () => {
    const saved = JSON.parse(localStorage.getItem(localStorageKey))
    const customPresets = reactive(Array.isArray(saved) ? saved : [])

    watch(customPresets, () => {
        localStorage.setItem(localStorageKey, JSON.stringify(customPresets))
    }, { deep: true })

    function addPreset(label, groupIds) {
        const preset = {
            id: 'custom_' + Date.now(),
            label,
            groups: [...groupIds],
        }
        customPresets.push(preset)
        return preset
    }

    function removePreset(id) {
        const idx = customPresets.findIndex(p => p.id === id)
        if (idx !== -1) customPresets.splice(idx, 1)
    }

    function clearAll() {
        customPresets.splice(0, customPresets.length)
    }

    return { customPresets, addPreset, removePreset, clearAll }
})
