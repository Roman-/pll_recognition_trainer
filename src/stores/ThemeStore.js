/*
* Dynamically change themes downloaded from https://bootswatch.com/.
* Usage: in main.js, do:
*  import "bootstrap"
*
* And then in App.vue, do:
*  import {useThemeStore} from "@/stores/ThemeStore";
*  useThemeStore().applyCurrentTheme();
*
* Then, whenever you want to change theme, do this:
* useThemeStore().toggleDayNight();
*/
import {computed, ref} from 'vue'
import { defineStore } from 'pinia'

const isDarkKey = "my_pll.is_dark";
const darkNameKey = "my_pll.dark_name";
const lightNameKey = "my_pll.light_name";

const defaultIsDark = true;
const defaultLightName = "flatly";
const defaultDarkName = "darkly";
const defaultLightThemeColor = "#ffffff";
const defaultDarkThemeColor = "#222222";

export const lightThemesSet = ["cerulean", "cosmo", "flatly", "litera", "lux", "materia", "minty", "morph", "quartz", "sandstone", "sketchy", "zephyr"];
export const darkThemesSet = ["cyborg", "darkly", "slate", "solar", "superhero"];
const isAvailable = (themeName, isDark) => {
  return (isDark ? darkThemesSet : lightThemesSet).includes(themeName);
}

function loadFromStorage(key, defaultValue, validator) {
  const stored = localStorage?.getItem(key);
  if (stored == null) return defaultValue;
  return validator ? (validator(stored) ? stored : defaultValue) : stored;
}

function loadBooleanFromStorage(key, defaultValue) {
  const stored = localStorage?.getItem(key);
  return stored == null ? defaultValue : stored === "true";
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(loadBooleanFromStorage(isDarkKey, defaultIsDark))
  const lightThemeName = ref(loadFromStorage(lightNameKey, defaultLightName, n => isAvailable(n, false)));
  const darkThemeName = ref(loadFromStorage(darkNameKey, defaultDarkName, n => isAvailable(n, true)));
  const name = computed(()=> isDark.value ? darkThemeName.value : lightThemeName.value);
  const icon = computed(() => isDark.value ? "bi-moon" : "bi-sun");

  const getThemeCssUrl = (themeName) => {
    return new URL(`../assets/bootstrap_themes/${themeName}.min.css`, import.meta.url).href
  }

  function setThemeColor(color) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    meta.setAttribute('content', color);
  }

  function updateThemeColor(fallbackColor = isDark.value ? defaultDarkThemeColor : defaultLightThemeColor) {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg').trim();
    setThemeColor(themeColor || fallbackColor);
  }

  function applyCurrentTheme() {
    const link_id = "bootstrap_stylesheet";
    const link = document.getElementById(link_id);
    if (!link) {
      const link = document.createElement('link');
      link.id = link_id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const stylesheet = document.getElementById("bootstrap_stylesheet");
    stylesheet.addEventListener('load', () => updateThemeColor(), { once: true });
    setThemeColor(isDark.value ? defaultDarkThemeColor : defaultLightThemeColor);
    stylesheet.href = getThemeCssUrl(name.value);
  }

  function toggleDayNight() {
    isDark.value = !isDark.value;
    applyCurrentTheme();
    if (localStorage) {
      localStorage.setItem(isDarkKey, ""+isDark.value);
    }
  }

  function setThemeName(themeName, forDarkMode) {
    if (!isAvailable(themeName, forDarkMode)) {
      return console.error("setThemeName(" + forDarkMode + "): " + themeName + " not available in themes set");
    }
    (forDarkMode ? darkThemeName : lightThemeName).value = themeName;
    if (forDarkMode === isDark.value) {
      applyCurrentTheme();
    }
    localStorage.setItem(forDarkMode ? darkNameKey : lightNameKey, themeName);
  }

  function setDarkTheme(themeName){ setThemeName(themeName, true) }
  function setLightTheme(themeName){ setThemeName(themeName, false); }

  function reset() {
    isDark.value = defaultIsDark;
    lightThemeName.value = defaultLightName;
    darkThemeName.value = defaultDarkName;
    applyCurrentTheme();
    localStorage.removeItem(isDarkKey);
    localStorage.removeItem(darkNameKey);
    localStorage.removeItem(lightNameKey);
  }

  return { isDark, lightThemeName, darkThemeName, icon, toggleDayNight, applyCurrentTheme, setDarkTheme, setLightTheme, reset}
});
