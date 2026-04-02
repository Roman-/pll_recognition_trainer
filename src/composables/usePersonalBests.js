import { ref, computed, watch, onMounted, unref } from 'vue'
import { presets, presetKeys } from '@/scripts/session_presets'
import { useCustomPresetsStore } from '@/stores/CustomPresetsStore'
import { computePoolKey, getPersonalBests } from '@/scripts/session_history'

export function usePresetPBs(sizeOption) {
    const presetPBs = ref(new Map())
    const customPresetsStore = useCustomPresetsStore()

    async function load() {
        const map = new Map()
        const allPresets = [...presets, ...customPresetsStore.customPresets]
        for (const preset of allPresets) {
            const keys = presetKeys(preset)
            const poolKey = computePoolKey(keys)
            const pb = await getPersonalBests(poolKey, unref(sizeOption))
            if (pb) map.set(preset.id, pb)
        }
        presetPBs.value = map
    }

    onMounted(load)
    watch(sizeOption, load)
    watch(() => customPresetsStore.customPresets.length, load)

    return { presetPBs }
}

export function useSessionPB(pool, sizeOption, accuracy, avgTimeMs) {
    const pb = ref(null)
    const sessionNumber = ref(0)

    const isNewBestAccuracy = computed(() => pb.value && unref(accuracy) >= pb.value.bestAccuracy)
    const isNewBestTime = computed(() => {
        if (!pb.value) return false
        return unref(accuracy) >= pb.value.bestAccuracy && unref(avgTimeMs) <= pb.value.bestAvgTimeMs
    })

    onMounted(async () => {
        const poolKey = computePoolKey(unref(pool))
        const bests = await getPersonalBests(poolKey, unref(sizeOption))
        if (bests) {
            sessionNumber.value = bests.totalSessions
            if (bests.totalSessions > 1) {
                pb.value = bests
            }
        } else {
            sessionNumber.value = 1
        }
    })

    return { pb, sessionNumber, isNewBestAccuracy, isNewBestTime }
}
