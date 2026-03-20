import {reactive, watch} from 'vue'
import {defineStore} from 'pinia'
import {CubeViews, DefaultAllowedCrossColors, DefaultColorScheme, strokeWidthOptions} from "@/scripts/colors";
import {isMobile} from "@/scripts/device";

const defaultSettings = {
    puzzleRotations: CubeViews["Center"],
    strokeWidth: strokeWidthOptions["1"],
    colorScheme: DefaultColorScheme,
    allowedCrossColors: DefaultAllowedCrossColors,
    showOnScreenKeyboard: isMobile,
    fullNameMode: false
}

const localStorageKey = "pll_recognition_settings"
export const useSettingsStore = defineStore('settings', () => {
    const saved = JSON.parse(localStorage.getItem(localStorageKey))
    const store = reactive(saved ? { ...defaultSettings, ...saved } : defaultSettings)

    const reset = () => {
        Object.assign(store, defaultSettings)
    }

    // save to local storage on change
    watch(store, () => {
        localStorage.setItem(localStorageKey, JSON.stringify(store))
    }, {deep: true})

    return {store, reset}
});
