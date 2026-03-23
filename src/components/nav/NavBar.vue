<script setup>
import {useThemeStore} from "@/stores/ThemeStore";
import ThemeSwitcher from "@/components/nav/ThemeSwitcher.vue";
import {computed} from "vue";
import {GameState, useSessionStore} from "@/stores/SessionStore";
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
const isHome = computed(() => route.name === "Home")
const isTrainer = computed(() => route.name === "Meta")

const showResults = computed(() =>
    !isSettings.value && (session.store.state === GameState.Playing || session.store.results.length > 0)
)
const resultsCount = computed(() => session.store.results.length)

</script>

<template>
  <nav class="navbar sticky-top" :class="navBarClass">
    <div class="row w-100 align-items-center flex-nowrap">
      <div class="col-auto me-auto" @click="router.push('/')">
        <span class="navbar-brand clickable text-primary mx-2">
          <span class="d-none d-sm-inline">PLL Recognition Trainer</span>
          <span class="d-inline d-sm-none">PLL</span>
        </span>
      </div>
      <div class="col-auto">
        <button v-if="showResults && !isHome"
                class="btn btn-link text-info d-md-none"
                @click="session.store.showResultsModal = true"
                title="Results"
                tabindex="-1"
        >
          <i class="bi-list-ol font-bigger"/>
          <span class="badge bg-secondary align-top">{{ resultsCount }}</span>
        </button>
        <button v-if="!isSettings"
            class="btn btn-link text-info"
            @click="router.push('/settings')"
            title="Settings"
            tabindex="-1"
        >
          <i class="bi-gear font-bigger"/>
        </button>
        <button v-if="!isTrainer"
            class="btn btn-link text-info"
            @click="router.push('/trainer')"
            title="Start Training"
            tabindex="-1"
        >
          <i class="bi-lightning-charge-fill font-bigger"/>
        </button>
        <button v-if="!isHome" tabindex="-1" class="btn btn-link text-info" @click="resetSessionClicked" title="Restart evaluation">
          <i class="bi-arrow-counterclockwise font-bigger"/>
        </button>
        <ThemeSwitcher/>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>