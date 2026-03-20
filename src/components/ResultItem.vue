<script setup>
import PllPic from "@/components/PllPic.vue";
import {msToHumanReadable} from "@/scripts/time_formatter";
import {computed} from "vue";
import {resultTimeMs} from "@/scripts/pll_cases";
import Note from "@/components/Note.vue";

const props = defineProps({
  result: Object,
  pictureSize: Number,
  showNotes: Boolean,
  showTopPicture: Boolean,
  cardLayout: Boolean
})

const timeText = computed(() => {
  const ms = resultTimeMs(props.result)
  return ms >= 60000 ? "60+" : msToHumanReadable(ms)
})

const resultIsPoor = computed(() => resultTimeMs(props.result) > 3000)
</script>

<template>
  <!-- Card layout for evaluation results -->
  <div v-if="cardLayout" class="card mb-3">
    <div class="card-body">
      <!-- Row 1: Name + Badge -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">{{ props.result.pllCase.name }}</h5>
        <span v-if="props.result.mistake" class="badge bg-danger" :title="timeText">
          {{ props.result.mistake === "-" ? "gave up" : `not ${props.result.mistake}` }}
        </span>
        <span v-else class="badge" :class="resultIsPoor ? 'bg-warning' : 'bg-success'">
          {{ timeText }}
        </span>
      </div>
      <!-- Row 2: Two images side by side -->
      <div class="row mb-2">
        <div class="col-6">
          <PllPic :pllCase="props.result.pllCase" viewType="cube-top" :size="props.pictureSize" :clickable="true"/>
        </div>
        <div class="col-6">
          <PllPic :pllCase="props.result.pllCase" viewType="cube" :size="props.pictureSize" :clickable="true"/>
        </div>
      </div>
      <!-- Row 3: Note -->
      <Note :pll-case="props.result.pllCase" :enableHotkeys="false"/>
    </div>
  </div>

  <!-- Compact layout (existing behavior) -->
  <div v-else class="row align-items-center mx-0">
    <div v-if="props.showTopPicture" class="col col-auto">
      <PllPic :pllCase="props.result.pllCase" viewType="cube-top" :size="Math.round(props.pictureSize * 0.8)" :clickable="true"/>
    </div>
    <div class="col col-auto">
      <PllPic :pllCase="props.result.pllCase" viewType="cube" :size="props.pictureSize" :clickable="true"/>
    </div>
    <div class="col col-auto h4">
      {{props.result.pllCase.name}}
    </div>
    <div class="col col-auto h4">
      <span v-if="props.result.mistake" class="badge bg-danger" :title="timeText">
        {{props.result.mistake === "-" ? "gave up" : `not ${props.result.mistake}`}}
      </span>
      <span v-else class="badge" :class="resultIsPoor ? 'bg-warning' : 'bg-success'">
        {{timeText}}
      </span>
    </div>
    <div class="col" v-if="props.showNotes">
      <Note :pll-case="props.result.pllCase" :enableHotkeys="false"/>
    </div>
  </div>
</template>

<style scoped>
</style>
