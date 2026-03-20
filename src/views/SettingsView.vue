<script setup>
import {useSettingsStore} from "@/stores/SettingsStore";
import PllPic from "@/components/PllPic.vue";
import {CubeViews, randomCrossColor, strokeWidthOptions} from "@/scripts/colors";
import CrossColorPicker from "@/components/CrossColorPicker.vue";
import ColorToneEditor from "@/components/ColorToneEditor.vue";
import {computed} from "vue";

const settings = useSettingsStore()
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
  }
}

const pictureCrossColor = computed(() => randomCrossColor(settings.store.allowedCrossColors))
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
          <PllPic :pllCase="pllCaseForPicture" viewType="cube" :size="250" :crossColor="pictureCrossColor"/>
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

        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-warning" @click="resetSettings">Reset</button>
          <router-link to="/trainer" class="btn btn-success">Start Training</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
