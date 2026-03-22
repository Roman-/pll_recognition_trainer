import {createRouter, createWebHashHistory} from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import MetaTrainerView from "@/views/MetaTrainerView.vue";
import SettingsView from "@/views/SettingsView.vue";
import GuideView from "@/views/GuideView.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView
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
            path: '/guide',
            name: 'Guide',
            component: GuideView
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        },
    ]
})

export default router
