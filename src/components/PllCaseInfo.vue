<script setup>
import PllPic from "@/components/PllPic.vue";
import {computed} from "vue";
import {aufByDturn} from "@/scripts/helpers";
import Note from "@/components/Note.vue";

const props = defineProps(['pllCase'])
const title = computed(() => {
  if (!props.pllCase) {
    return ""
  }
  let s = props.pllCase.name
  s += " (" + (props.pllCase.dTurn || "no") + " AUF)"
  return s
})
const auf = computed(() => aufByDturn(props.pllCase.dTurn))

</script>

<template>
  <div v-if="props.pllCase" class="text-center">
    <h5>{{props.pllCase.name}} perm <span v-if="auf" class="badge bg-secondary" title="AUF">+{{auf}}</span></h5>
    <PllPic :pllCase="props.pllCase" viewType="cube-top" :size="200" :clickable="true"/>
    <div class="mt-2">
      <Note :pllCase="props.pllCase" :enableHotkeys="true"/>
    </div>
  </div>
</template>

<style scoped>
</style>