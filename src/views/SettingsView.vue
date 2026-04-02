<script setup>
import {useSettingsStore} from "@/stores/SettingsStore";
import {useThemeStore, lightThemesSet, darkThemesSet} from "@/stores/ThemeStore";
import PllPic from "@/components/PllPic.vue";
import {randomCrossColor, mutateColorScheme} from "@/scripts/colors";
import {CubeViews, strokeWidthOptions, randomRotationOffset} from "@/scripts/cube_display";
import CrossColorPicker from "@/components/CrossColorPicker.vue";
import ColorToneEditor from "@/components/ColorToneEditor.vue";
import {useNotesStore} from "@/stores/NotesStore";
import {clearAllSessions} from "@/scripts/session_history";
import {computed, ref, watch} from "vue";

const settings = useSettingsStore()
const notesStore = useNotesStore()
const themeStore = useThemeStore()
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const pllCaseForPicture = {
  rotation: "y2",
  name: "Ja",
  dTurn: "d2",
  colorShift: 0,
  crossColor: randomCrossColor(settings.store.allowedCrossColors)
}

const resetSettings = () => {
  if (confirm("Reset to defaults?")) {
    settings.reset()
    themeStore.reset()
  }
}

const pictureCrossColor = computed(() => randomCrossColor(settings.store.allowedCrossColors))

const rotationOverride = ref(settings.store.angleVariance ? randomRotationOffset(settings.store.puzzleRotations) : null)
const colorSchemeOverride = ref(settings.store.colorVariance ? mutateColorScheme(settings.store.colorScheme) : null)

watch(() => settings.store.angleVariance, (on) => {
  rotationOverride.value = on ? randomRotationOffset(settings.store.puzzleRotations) : null
})
watch(() => settings.store.colorVariance, (on) => {
  colorSchemeOverride.value = on ? mutateColorScheme(settings.store.colorScheme) : null
})

const resetJourney = async () => {
  if (confirm("This will permanently delete all training history, personal bests, and quest progress. Continue?")) {
    await clearAllSessions()
    settings.store.questStarted = false
    settings.store.activeQuestStepId = null
  }
}

const clearAllNotes = () => {
  if (confirm("This will permanently delete all your per-case notes. Continue?")) {
    notesStore.clearNotes()
  }
}
</script>

<template>
  <div class="container py-3">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <h2 class="text-center mb-4">Settings</h2>

        <div class="mb-3">
          <label class="form-label">Cross color</label>
          <CrossColorPicker v-model="settings.store.allowedCrossColors" />
        </div>

        <div class="d-flex align-items-center gap-2 mb-3">
          <label class="form-label mb-0 flex-shrink-0">View</label>
          <select v-model="settings.store.puzzleRotations" class="form-select themed">
            <option v-for="viewName in Object.keys(CubeViews)" :value="CubeViews[viewName]">{{viewName}}</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-2 mb-3">
          <label class="form-label mb-0 flex-shrink-0">Stroke</label>
          <select class="form-select themed" v-model.number="settings.store.strokeWidth">
            <option v-for="w in Object.keys(strokeWidthOptions)" :value="strokeWidthOptions[w]">{{w}}</option>
          </select>
        </div>

        <div class="d-flex align-items-start gap-2 mb-3">
          <label class="form-label mb-0 flex-shrink-0 mt-1">Color tones</label>
          <ColorToneEditor :colorScheme="settings.store.colorScheme" />
        </div>

        <div class="text-center mb-3">
          <PllPic :pllCase="pllCaseForPicture" viewType="cube" :size="250" :crossColor="pictureCrossColor" :rotationOverride="rotationOverride" :colorSchemeOverride="colorSchemeOverride"/>
        </div>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="onScreenKeyboard" v-model="settings.store.showOnScreenKeyboard" />
            <label class="form-check-label" for="onScreenKeyboard">On-screen keyboard</label>
          </div>
        </div>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="fullNameMode" v-model="settings.store.fullNameMode" />
            <label class="form-check-label" for="fullNameMode">Full name mode</label>
          </div>
          <small class="text-secondary">Type full case name (e.g. Ga instead of just G)</small>
        </div>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="angleVariance" v-model="settings.store.angleVariance" />
            <label class="form-check-label" for="angleVariance">Angle variance</label>
          </div>
          <small class="text-secondary">Randomly rotate the cube angle for each new case</small>
        </div>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="colorVariance" v-model="settings.store.colorVariance" />
            <label class="form-check-label" for="colorVariance">Color variance</label>
          </div>
          <small class="text-secondary">Randomly shift cube colors for each new case</small>
        </div>

        <hr/>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="nightMode" :checked="themeStore.isDark" @change="themeStore.toggleDayNight()" />
            <label class="form-check-label" for="nightMode">Night mode</label>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 mb-3">
          <label class="form-label mb-0 flex-shrink-0">Day theme</label>
          <select class="form-select themed" :value="themeStore.lightThemeName" @change="themeStore.setLightTheme($event.target.value)">
            <option v-for="t in lightThemesSet" :value="t">{{ capitalize(t) }}</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-2 mb-3">
          <label class="form-label mb-0 flex-shrink-0">Night theme</label>
          <select class="form-select themed" :value="themeStore.darkThemeName" @change="themeStore.setDarkTheme($event.target.value)">
            <option v-for="t in darkThemesSet" :value="t">{{ capitalize(t) }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-warning" @click="resetSettings">Reset</button>
          <router-link to="/setup" class="btn btn-success">Start Training</router-link>
        </div>

        <hr class="mt-5"/>
        <h5 class="text-danger mb-3">Danger Zone</h5>
        <div class="d-grid gap-2">
          <button class="btn btn-outline-danger" @click="resetJourney">Clear All Training History</button>
          <small class="text-secondary mt-n1">Clears all training history, personal bests, and quest progress</small>
          <button class="btn btn-outline-danger" @click="clearAllNotes">Clear All Notes</button>
          <small class="text-secondary mt-n1">Removes all per-case recognition notes</small>
        </div>
      </div>
    </div>
  </div>
</template>
