import {createRouter, createWebHashHistory} from 'vue-router'
import MetaTrainerView from "@/views/MetaTrainerView.vue";
import SettingsView from "@/views/SettingsView.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'Meta',
            component: MetaTrainerView
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        },
        {
            path: '/settings',
            name: 'Settings',
            component: SettingsView
        },
    ]
})

export default router
