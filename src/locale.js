import { createI18n } from 'vue-i18n'

import en from '@/assets/i18n/en.json'
import ru from '@/assets/i18n/ru.json'
export const supportedLocales = [
  { code: "en", messages: en,  name: "English", emoji: "🇬🇧" },
  { code: "ru", messages: ru,  name: "Русский", emoji: "🇷🇺" }
]
const localStorageKey = "locale-thing" // replace with app-specific
const defaultLocale = 'en';
export const addTranslationUrl = "https://add_translation_example_url.com";

const getUserLocale = ()=>{
  if (localStorage) {
    // try to get from local storage
    const loadedData = localStorage.getItem(localStorageKey);
    if (typeof loadedData === "string" && loadedData.length === 2) {
      return loadedData;
    }
  }
  const secondGuess = window.navigator.language || window.navigator.userLanguage;
  if (typeof secondGuess === "string" && secondGuess.length >= 2) {
    const lang = secondGuess.split('-')[0].toLowerCase()
    if (supportedLocales.find(o => o.code === lang)) {
      return lang
    }
  }
  console.log("using default locale " + defaultLocale);
  return defaultLocale;
}

const userLocale = getUserLocale();

document.querySelector("html")
  .setAttribute("lang", userLocale);

export const i18n = createI18n({
  legacy: false,
  locale: userLocale,
  fallbackLocale: defaultLocale,
  messages: supportedLocales.find(o => o.code === userLocale).messages
});

// code: 2-letter locale code
export const setLocaleAndReload = (code) => {
  if (!supportedLocales.find(o => o.code === code)) {
    console.error("setLocaleAndReload(", code, "). Supported: ", supportedLocales);
    return;
  }
  localStorage.setItem(localStorageKey, code);
  location.reload();
}

