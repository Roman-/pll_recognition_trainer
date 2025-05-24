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
    <div v-for="r in props.results">
      <ResultItem :result="r" :pictureSize="props.pictureSize" :showNotes="props.showNotes" :showTopPicture="props.showNotes"/>
    </div>
  </div>
</template>

<style scoped>
.resultList {
  /*picture + name + badge */
  min-width: 230px;
}
</style>