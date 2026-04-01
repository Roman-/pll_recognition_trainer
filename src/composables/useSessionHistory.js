import { ref, computed, watch, onMounted } from 'vue'
import { getAllSessions } from '@/scripts/session_history'
import { sessionTypeKey } from '@/scripts/formatters'

const PAGE_SIZE = 10

export function useSessionHistory() {
    const sessions = ref([])
    const selectedType = ref('all')
    const currentPage = ref(1)

    onMounted(async () => {
        sessions.value = await getAllSessions()
    })

    const sessionTypes = computed(() => {
        const types = new Map()
        sessions.value.forEach(s => {
            const key = sessionTypeKey(s)
            if (!types.has(key)) {
                types.set(key, { label: s.presetLabel, caseCount: s.caseCount, key })
            }
        })
        return [...types.values()]
    })

    const filteredSessions = computed(() => {
        if (selectedType.value === 'all') return sessions.value
        return sessions.value.filter(s => sessionTypeKey(s) === selectedType.value)
    })

    const totalPages = computed(() => Math.ceil(filteredSessions.value.length / PAGE_SIZE))

    const paginatedSessions = computed(() => {
        const start = (currentPage.value - 1) * PAGE_SIZE
        return filteredSessions.value.slice(start, start + PAGE_SIZE)
    })

    const showingRange = computed(() => {
        const total = filteredSessions.value.length
        if (total === 0) return ''
        const start = (currentPage.value - 1) * PAGE_SIZE + 1
        const end = Math.min(currentPage.value * PAGE_SIZE, total)
        return `${start}\u2013${end} of ${total}`
    })

    watch(selectedType, () => { currentPage.value = 1 })

    // PB flags: which sessions represent a personal best at their point in time
    const pbMap = computed(() => {
        const map = new Map()
        const byType = new Map()
        ;[...sessions.value].reverse().forEach(s => {
            const key = sessionTypeKey(s)
            if (!byType.has(key)) byType.set(key, [])
            byType.get(key).push(s)
        })
        byType.forEach((typeSessions) => {
            let bestAccuracy = -1
            let bestAvgTime = Infinity
            typeSessions.forEach(s => {
                const acc = s.correctCount / s.totalCases
                const isPbAccuracy = acc > bestAccuracy
                const isPbTime = acc >= bestAccuracy && s.avgTimeMs < bestAvgTime
                if (isPbAccuracy || isPbTime) {
                    map.set(s.id, true)
                }
                if (acc > bestAccuracy) bestAccuracy = acc
                if (acc >= bestAccuracy && s.avgTimeMs < bestAvgTime) bestAvgTime = s.avgTimeMs
            })
        })
        return map
    })

    // Trend per session type: compare avg accuracy of last 3 vs previous 3
    const trendMap = computed(() => {
        const map = new Map()
        const byType = new Map()
        sessions.value.forEach(s => {
            const key = sessionTypeKey(s)
            if (!byType.has(key)) byType.set(key, [])
            byType.get(key).push(s)
        })
        byType.forEach((typeSessions, key) => {
            if (typeSessions.length < 4) return
            const recent3 = typeSessions.slice(0, 3)
            const prev3 = typeSessions.slice(3, 6)
            if (prev3.length === 0) return
            const avgAcc = arr => arr.reduce((sum, s) => sum + s.correctCount / s.totalCases, 0) / arr.length
            const recentAcc = avgAcc(recent3)
            const prevAcc = avgAcc(prev3)
            const diff = recentAcc - prevAcc
            if (diff > 0.02) map.set(key, 'up')
            else if (diff < -0.02) map.set(key, 'down')
        })
        return map
    })

    return {
        sessions,
        sessionTypes,
        selectedType,
        filteredSessions,
        currentPage,
        totalPages,
        paginatedSessions,
        showingRange,
        pbMap,
        trendMap,
    }
}
