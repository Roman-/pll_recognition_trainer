<script setup>
import ResultItem from "@/components/ResultItem.vue";

const props = defineProps({
  results: Object,
  pictureSize: Number,
  showNotes: Boolean,
  showTopPicture: Boolean
})

</script>

<template>
  <div class="resultList">
    <TransitionGroup enter-active-class="animate__animated animate__fadeIn result-enter-fast">
      <div v-for="r in props.results" :key="r.started">
        <ResultItem :result="r" :pictureSize="props.pictureSize" :showNotes="props.showNotes" :showTopPicture="props.showTopPicture"/>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.resultList {
  /*picture + name + badge */
  min-width: 230px;
}
.result-enter-fast {
  --animate-duration: 250ms;
}
</style>