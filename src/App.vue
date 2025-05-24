<script setup>
import { RouterView } from 'vue-router'
import NavBar from "@/components/nav/NavBar.vue";
import "@/assets/global.css"

import {useThemeStore} from "@/stores/ThemeStore";
import {useSettingsStore} from "@/stores/SettingsStore";
import {watch} from "vue";
import {useSessionStore} from "@/stores/SessionStore";
useThemeStore().applyCurrentTheme();
const settings = useSettingsStore()
const session = useSessionStore()
watch(settings.store, () => session.setAllowedCrossColors(settings.store.allowedCrossColors))
</script>

<template>
  <div class="vh-100 d-flex flex-column">
    <div>
      <NavBar/>
    </div>
    <div class="flex-grow-1 overflow-auto">
      <RouterView/>
    </div>
  </div>
</template>

<style scoped>
</style>
