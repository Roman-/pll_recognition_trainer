import db from '@/db'
import { allPllKeys } from '@/scripts/pll_cases'

export function computePoolKey(pool) {
    const keys = pool ? [...new Set(pool)] : allPllKeys()
    return keys.sort().join(',')
}

export async function saveSession({ pool, sizeOption, presetLabel, results }) {
    const poolKey = computePoolKey(pool)
    const totalCases = results.length
    const correctCount = results.filter(r => r.mistake === '').length
    let totalTimeMs = 0
    results.forEach(r => totalTimeMs += new Date(r.finished) - new Date(r.started))

    return db.sessions.add({
        completedAt: new Date(),
        poolKey,
        sizeOption,
        presetLabel,
        caseCount: (pool ? new Set(pool) : new Set(allPllKeys())).size,
        totalCases,
        correctCount,
        totalTimeMs,
        avgTimeMs: totalCases > 0 ? totalTimeMs / totalCases : 0,
    })
}

export async function getSessionsByType(poolKey, sizeOption) {
    return db.sessions.where({ poolKey, sizeOption }).sortBy('completedAt')
}

export async function getAllSessions() {
    return db.sessions.orderBy('completedAt').reverse().toArray()
}

export async function getPersonalBests(poolKey, sizeOption) {
    const sessions = await getSessionsByType(poolKey, sizeOption)
    if (sessions.length === 0) return null

    const accuracies = sessions.map(s => s.correctCount / s.totalCases)
    const bestAccuracy = Math.max(...accuracies)

    // Best avg time among sessions with best accuracy (reward speed only at peak accuracy)
    const perfectSessions = sessions.filter(s => s.correctCount / s.totalCases === bestAccuracy)
    const bestAvgTimeMs = Math.min(...perfectSessions.map(s => s.avgTimeMs))

    return {
        bestAccuracy,
        bestAvgTimeMs,
        totalSessions: sessions.length,
    }
}
