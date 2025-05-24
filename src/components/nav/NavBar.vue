<script setup>
import {useThemeStore} from "@/stores/ThemeStore";
import ThemeSwitcher from "@/components/nav/ThemeSwitcher.vue";
import {computed} from "vue";
import {useSessionStore} from "@/stores/SessionStore";
const session = useSessionStore()

const themeStore = useThemeStore();
const navBarClass = computed(() => themeStore.isDark ? "navbar-dark bg-dark" : "navbar-light bg-light");
const resetSessionClicked = () => {
  if (confirm("Restart evaluation?")) {
    session.restartEvaluation()
  }
}
import {useRoute, useRouter} from "vue-router";
const router = useRouter();
const route = useRoute();
const isSettings = computed(() => route.name === "Settings")
const onSettingsClicked = () => {
  if (isSettings.value) {
    router.push("Meta")
  } else {
    router.push("Settings")
  }
}

</script>

<template>
  <nav class="navbar sticky-top" :class="navBarClass">
    <div class="row w-100 align-items-center">
      <div class="col-auto me-auto" @click="router.push('meta')">
        <span class="navbar-brand clickable text-primary mx-2">PLL Recognition Trainer</span>
      </div>
      <div class="col-auto">
        <button
            class="btn btn-link"
            @click="onSettingsClicked"
            :class="isSettings ? 'text-secondary' : 'text-info'"
            title="Settings"
            tabindex="-1"
        >
          <i class="bi-gear font-bigger"/>
        </button>
        <button tabindex="-1" class="btn btn-link text-info" @click="resetSessionClicked" title="Restart evaluation">
          <i class="bi-arrow-counterclockwise font-bigger"/>
        </button>
        <ThemeSwitcher/>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>