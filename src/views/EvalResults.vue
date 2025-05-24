<script setup>
import {useSessionStore} from "@/stores/SessionStore";
import {computed} from "vue";
import {resultsToEvalResults} from "@/scripts/pll_cases";
import ResultsList from "@/components/ResultsList.vue";
import {msToHumanReadable} from "@/scripts/time_formatter";

const session = useSessionStore()
const evalResults = computed(() => resultsToEvalResults(session.store.results))
const totalTimeSpent = computed(() => {
  let ms = 0
  session.store.results.forEach(r => ms += (new Date(r.finished) - new Date(r.started)))
  return ms
})
const numCorrect = computed(() => session.store.results.filter(r => r.mistake === "").length)
const subtitle1 = computed(() => {
  return `${numCorrect.value}/${session.store.results.length} cases in ${msToHumanReadable(totalTimeSpent.value)}`
})
const subtitle2 = computed(() => {
  return `${msToHumanReadable(totalTimeSpent.value / session.store.results.length)} per case`
})

</script>

<template>
  <div class="d-flex flex-column align-items-center">
    <h1>Evaluation results</h1>
    <h4>{{subtitle1}}</h4>
    <h4>{{subtitle2}}</h4>
    <button class="btn btn-primary m-2" @click="session.startPersonalized()">Start personalized training</button>
    <div class="w-100 p-2 pt-3">
      <p>
        Study these cases thoroughly and add notes on how you recognize them.
        You can <strong>click the cube picture</strong> to view the PLL in all color/AUF variations.
      </p>
      <p>
        When you start personalized training, you will be shown the cases you got wrong more often.
      </p>
    </div>
    <div class="w-100">
      <ResultsList :results="evalResults" :pictureSize="220" :showNotes="true" :showTopPicture="true"/>
    </div>
  </div>
</template>

<style scoped>
</style>