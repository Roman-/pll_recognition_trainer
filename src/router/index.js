import {createRouter, createWebHashHistory} from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import SessionSetupView from "@/views/SessionSetupView.vue";
import TrainerView from "@/views/TrainerView.vue";
import EvalResults from "@/views/EvalResults.vue";
import SettingsView from "@/views/SettingsView.vue";
import HistoryView from "@/views/HistoryView.vue";
import {GameState} from "@/scripts/game_constants";
import {useSessionStore} from "@/stores/SessionStore";

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
            name: 'Trainer',
            component: TrainerView
        },
        {
            path: '/results',
            name: 'Results',
            component: EvalResults,
            beforeEnter: () => {
                const session = useSessionStore()
                if (session.store.state !== GameState.EvaluationDone) {
                    return { name: 'Home' }
                }
            }
        },
        {
            path: '/settings',
            name: 'Settings',
            component: SettingsView
        },
        {
            path: '/history',
            name: 'History',
            component: HistoryView
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        },
    ]
})

export default router
