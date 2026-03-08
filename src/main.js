import { createApp } from 'vue'
import App from './App.vue'

// router
import router from './router'

// Pinia
import { createPinia } from 'pinia'

// bootstrap, icons and theme
import "bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"
// the .min.css file for specific Bootstrap theme will be loaded and applied in App.vue

createApp(App)
  .use(router)
  .use(createPinia())
  .mount('#app')
