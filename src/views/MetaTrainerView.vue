<script setup>

import {GameState, useSessionStore} from "@/stores/SessionStore";
import TrainerView from "@/views/TrainerView.vue";
import EvalResults from "@/views/EvalResults.vue";

const session = useSessionStore()

</script>

<template>
    <EvalResults v-if="session.store.state === GameState.EvaluationDone"/>
    <TrainerView v-else/>
</template>

<style scoped>
</style>