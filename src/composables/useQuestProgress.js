import { ref, computed, onMounted } from 'vue'
import { QUEST_STEPS, MASTERY_ACCURACY, poolKeyForStep } from '@/scripts/quest'
import { getPersonalBests } from '@/scripts/session_history'
import { SIZE_MEDIUM } from '@/scripts/session_sizing'

export function useQuestProgress() {
    const stepStatuses = ref([])
    const loading = ref(true)

    async function load() {
        loading.value = true
        const statuses = await Promise.all(QUEST_STEPS.map(async step => {
            const poolKey = poolKeyForStep(step)
            const pb = await getPersonalBests(poolKey, SIZE_MEDIUM)
            return {
                step,
                mastered: pb ? pb.bestAccuracy >= MASTERY_ACCURACY : false,
                bestAccuracy: pb ? pb.bestAccuracy : null,
                totalSessions: pb ? pb.totalSessions : 0,
            }
        }))
        stepStatuses.value = statuses
        loading.value = false
    }

    const currentStepIndex = computed(() => {
        const idx = stepStatuses.value.findIndex(s => !s.mastered)
        return idx === -1 ? stepStatuses.value.length : idx
    })

    const currentStep = computed(() => QUEST_STEPS[currentStepIndex.value] || null)
    const masteredCount = computed(() => stepStatuses.value.filter(s => s.mastered).length)
    const questComplete = computed(() => masteredCount.value === QUEST_STEPS.length)
    const progressFraction = computed(() => QUEST_STEPS.length > 0 ? masteredCount.value / QUEST_STEPS.length : 0)

    onMounted(load)

    return { stepStatuses, currentStepIndex, currentStep, masteredCount, questComplete, progressFraction, loading, reload: load }
}
