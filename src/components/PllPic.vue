<script setup>
import { SVG } from "sr-puzzlegen-pll"
import {computed, onMounted, ref, watch} from "vue";
import {noCubePuzzleMask, scrambleForCase} from "@/scripts/helpers";
import {topViewAdjustment} from "@/scripts/colors";
import {useSettingsStore} from "@/stores/SettingsStore";
import CaseVariationsModal from "@/components/CaseVariationsModal.vue";

const props = defineProps({
  pllCase: Object,
  viewType: String,
  size: Number,
  clickable: Boolean,
  crossColor: String,
  hoverViewType: String,
  hovered: { type: Boolean, default: undefined }
})

const cubeImgDiv = ref(null)
const hoverImgDiv = ref(null)
const settings = useSettingsStore()

const localHovered = ref(false)
const isHovered = computed(() => props.hovered !== undefined ? props.hovered : localHovered.value)

const scramble = computed(() => {
    const base = scrambleForCase(props.pllCase, props.crossColor)
    if (props.viewType === "cube-top") {
        const adj = topViewAdjustment(settings.store.puzzleRotations)
        return adj ? `${base} ${adj}` : base
    }
    return base
})

const insertSvgInto = (targetRef, viewType) => {
  if (!targetRef.value) return
  targetRef.value.innerHTML = ''

  let opts = {
    "puzzle": {
      "alg": scramble.value,
      "scheme": settings.store.colorScheme
    },
    "width": parseInt(props.size),
    "height": parseInt(props.size),
    strokeWidth: settings.store.strokeWidth,
  }

  if (viewType === "cube" || viewType === "cube-pll") {
    opts.puzzle.rotations = settings.store.puzzleRotations
  }

  if (!scramble.value) {
    opts.puzzle.mask = noCubePuzzleMask
  }
  SVG(targetRef.value, viewType, opts)
}

const insertSvg = () => insertSvgInto(cubeImgDiv, props.viewType)
const insertHoverSvg = () => {
  if (props.hoverViewType) insertSvgInto(hoverImgDiv, props.hoverViewType)
}

watch(
  () => [scramble.value, props.viewType, props.hoverViewType, props.size,
         settings.store.puzzleRotations, settings.store.strokeWidth,
         settings.store.colorScheme],
  () => { insertSvg(); insertHoverSvg() },
  { deep: true }
)

onMounted(() => {
  insertSvg()
  insertHoverSvg()
})

const modalShown = ref(false);
const onClick = () => { if (props.clickable) modalShown.value = true }
</script>

<template>
  <!-- Dual-layer mode: cross-fade between viewType and hoverViewType -->
  <div v-if="hoverViewType"
       class="pll-pic-hover-wrapper"
       :class="props.clickable ? 'clickable' : ''"
       @mouseenter="props.hovered === undefined && (localHovered = true)"
       @mouseleave="props.hovered === undefined && (localHovered = false)"
       @click="onClick">
    <div ref="cubeImgDiv" class="pll-pic-layer pll-pic-base"></div>
    <div ref="hoverImgDiv" class="pll-pic-layer pll-pic-overlay" :class="{ 'pll-pic-visible': isHovered }"></div>
  </div>

  <!-- Single-layer mode: original behavior -->
  <div v-else ref="cubeImgDiv" :class="props.clickable ? 'clickable' : ''" @click="onClick"></div>

  <Teleport v-if="modalShown" to="body">
    <CaseVariationsModal :pllCase="props.pllCase" :closeCallback="() => modalShown=false"/>
  </Teleport>
</template>

<style scoped>
:deep(svg) {
  max-width: 100%;
  height: auto;
}

.pll-pic-hover-wrapper {
  position: relative;
  display: inline-block;
}

.pll-pic-overlay {
  transition: opacity 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}

.pll-pic-overlay.pll-pic-visible {
  opacity: 1;
}
</style>
