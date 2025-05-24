<script setup>
import {useSettingsStore} from "@/stores/SettingsStore";
import PllPic from "@/components/PllPic.vue";
import {useRouter} from "vue-router";
import {CubeColors, CubeViews, randomCrossColor, strokeWidthOptions} from "@/scripts/colors";
import {computed, ref} from "vue";

const router = useRouter();

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
const customizeColorsVisible = ref(false)

</script>

<template>
  <div class="container">
    <h2 class="text-center">Settings</h2>

    <div class="row my-1">
      <div class="col-6 d-flex align-items-center justify-content-end">
        <div class="text-end">
          <div>Cross color</div>
          <div class="text-secondary">(select multiple)</div>
        </div>
      </div>
      <div class="col-6 text-start">
        <select v-model="settings.store.allowedCrossColors" size="6" class="w-25" multiple>
          <option v-for="color in CubeColors" :value="color[0].toLowerCase()">{{color}}</option>
        </select>
      </div>
    </div>

    <div class="row my-1">
      <div class="col-6 d-flex align-items-center justify-content-end">
        View
      </div>
      <div class="col-6 text-start">
        <select v-model="settings.store.puzzleRotations" class="form-control themed w-25">
          <option v-for="viewName in Object.keys(CubeViews)" :value="CubeViews[viewName]">{{viewName}}</option>
        </select>
      </div>
    </div>

    <div class="row my-1">
      <div class="col-6 d-flex align-items-center justify-content-end">
        Stroke
      </div>
      <div class="col-6 text-start">
        <select class="form-control themed w-25" v-model.number="settings.store.strokeWidth">
          <option v-for="w in Object.keys(strokeWidthOptions)" :value="strokeWidthOptions[w]">{{w}}</option>
        </select>
      </div>
    </div>

    <div class="row my-1">
      <div class="col-6 d-flex align-items-center justify-content-end">
        Color tones
      </div>
      <div class="col-6 text-start">
          <input v-if="customizeColorsVisible" type="color" v-for="face in ['U', 'D', 'L', 'R', 'F', 'B']" v-model="settings.store.colorScheme[face].value"/>
        <button v-else @click="customizeColorsVisible=true" class="btn btn-sm btn-outline-primary">Customize...</button>
      </div>
    </div>

    <hr class="m-1">
    <div class="text-center">
      <PllPic :pllCase="pllCaseForPicture" viewType="cube" :size="300" :crossColor="pictureCrossColor"/>
    </div>
  </div>

  <div class="row">
    <div class="col-6 d-flex align-items-center justify-content-end">
      <button class="btn btn-warning" @click="resetSettings">Reset</button>
    </div>
    <div class="col-6 text-start">
      <button class="btn btn-success" @click="router.push('meta')">Save</button>
    </div>
  </div>
</template>

<style scoped>
</style>