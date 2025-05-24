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
  <hr/>
  <div v-if="props.pllCase" class="row">
    <div class="col-auto">
      <PllPic :pllCase="props.pllCase" viewType="cube-top" :size="200" :clickable="true"/>
    </div>
    <div class="col text-start">
      <h3>{{props.pllCase.name}} perm, {{auf || "no"}} AUF</h3>
      <Note :pllCase="props.pllCase" :enableHotkeys="true"/>
    </div>
  </div>
</template>

<style scoped>
</style>