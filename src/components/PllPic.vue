<script setup>
import { PNG, SVG } from "sr-puzzlegen"
import {computed, onMounted, ref, watch} from "vue";
import {llPuzzleMask, noCubePuzzleMask, scrambleForCase} from "@/scripts/helpers";
import {useSettingsStore} from "@/stores/SettingsStore";
import CaseVariationsModal from "@/components/CaseVariationsModal.vue";

// viewType: "cube" or "cube-top"
const props = defineProps({
  pllCase: Object,
  viewType: String,
  size: Number,
  clickable: Boolean,
  crossColor: String
})

const cubeImgDiv = ref(null)
const settings = useSettingsStore()

const scramble = computed(() => scrambleForCase(props.pllCase, props.crossColor))

// Image of a cube for which the SOLUTION is: rotation + pll_alg(with block on BL) + inverse d turn(or AUF by d turn). Pll case object:
const insertSvg = () => {
  cubeImgDiv.value.innerHTML = ''

  let opts = {
    "puzzle": {
      "alg": scramble.value,
      "scheme": settings.store.colorScheme
    },
    "width": parseInt(props.size),
    "height": parseInt(props.size),
    strokeWidth: settings.store.strokeWidth,
  }

  if (props.viewType === "cube") {
    opts.puzzle.rotations = settings.store.puzzleRotations
  }

  const hideF2l = false
  if (!scramble.value) {
    opts.puzzle.mask = noCubePuzzleMask
  } else if (hideF2l) {
    opts.puzzle.mask = llPuzzleMask
  }
  SVG(cubeImgDiv.value, props.viewType, opts)
}

watch(() => props, insertSvg, {deep: true})
watch(() => settings.store, insertSvg, {deep: true})

onMounted(() => {
  insertSvg()
})

const modalShown = ref(false);
</script>

<template>
  <div ref="cubeImgDiv" :class="props.clickable ? 'clickable' : ''" @click="props.clickable && (modalShown = true)"></div>
  <CaseVariationsModal v-if="modalShown" :pllCase="props.pllCase" :closeCallback="() => modalShown=false"/>
</template>

<style scoped>
</style>