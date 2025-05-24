import {computed, reactive, ref, watch} from 'vue'
import {defineStore} from 'pinia'
import {CubeViews, DefaultAllowedCrossColors, DefaultColorScheme, strokeWidthOptions} from "@/scripts/colors";
import {random_element} from "@/scripts/helpers";

const defaultSettings = {
    puzzleRotations: CubeViews["Center"],
    strokeWidth: strokeWidthOptions["1"],
    colorScheme: DefaultColorScheme,
    allowedCrossColors: DefaultAllowedCrossColors
}

const localStorageKey = "pll_recognition_settings"
export const useSettingsStore = defineStore('settings', () => {
    const store = reactive(JSON.parse(localStorage.getItem(localStorageKey)) || defaultSettings)

    const reset = () => {
        Object.assign(store, defaultSettings)
    }

    // save to local storage on change
    watch(store, () => {
        localStorage.setItem(localStorageKey, JSON.stringify(store))
    }, {deep: true})

    return {store, reset}
});
