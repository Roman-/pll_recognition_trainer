<script setup>
import { SVG } from "sr-puzzlegen-pll"
import {computed, onMounted, ref, watch} from "vue";
import {noCubePuzzleMask, scrambleForCase} from "@/scripts/helpers";
import {topViewAdjustment} from "@/scripts/colors";
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

const scramble = computed(() => {
    const base = scrambleForCase(props.pllCase, props.crossColor)
    if (props.viewType === "cube-top") {
        const adj = topViewAdjustment(settings.store.puzzleRotations)
        return adj ? `${base} ${adj}` : base
    }
    return base
})

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

  if (!scramble.value) {
    opts.puzzle.mask = noCubePuzzleMask
  }
  SVG(cubeImgDiv.value, props.viewType, opts)
}

watch(
  () => [scramble.value, props.viewType, props.size,
         settings.store.puzzleRotations, settings.store.strokeWidth,
         settings.store.colorScheme],
  insertSvg,
  { deep: true }
)

onMounted(() => {
  insertSvg()
})

const modalShown = ref(false);
</script>

<template>
  <div ref="cubeImgDiv" :class="props.clickable ? 'clickable' : ''" @click="props.clickable && (modalShown = true)"></div>
  <Teleport v-if="modalShown" to="body">
    <CaseVariationsModal :pllCase="props.pllCase" :closeCallback="() => modalShown=false"/>
  </Teleport>
</template>

<style scoped>
:deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>