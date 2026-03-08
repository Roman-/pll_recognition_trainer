<script setup>

import {useThemeStore} from "@/stores/ThemeStore";
const themeStore = useThemeStore();

</script>

<template>
  <button class="btn btn-link text-info" @click="themeStore.toggleDayNight()" title="Toggle night mode">
    <i class="bi-moon font-bigger" :class="themeStore.icon"/>
  </button>
</template>

<style scoped>
</style>
