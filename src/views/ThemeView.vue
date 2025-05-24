<script setup>
import ThemesSelect from "@/components/nav/ThemesSelect.vue";
const btnClasses = ["primary", "secondary", "dark", "light", "danger", "warning", "link"]
</script>

<template>
  <div class="input-group mb-3">
    <span class="input-group-text" id="basic-addon1">dark</span>
    <ThemesSelect is-dark="true"/>
  </div>
  <div class="input-group mb-3">
    <span class="input-group-text" id="basic-addon1">light</span>
    <ThemesSelect is-dark="false"/>
  </div>

  <h1>Preview:</h1>

  <button
      v-for="c in btnClasses"
      :class="`btn btn-${c} mx-1`">
    {{c}}
  </button>

</template>

<style scoped>
</style>