import {createRouter, createWebHashHistory} from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import SessionSetupView from "@/views/SessionSetupView.vue";
import MetaTrainerView from "@/views/MetaTrainerView.vue";
import SettingsView from "@/views/SettingsView.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView
        },
        {
            path: '/setup',
            name: 'Setup',
            component: SessionSetupView
        },
        {
            path: '/trainer',
            name: 'Meta',
            component: MetaTrainerView
        },
        {
            path: '/settings',
            name: 'Settings',
            component: SettingsView
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        },
    ]
})

export default router
