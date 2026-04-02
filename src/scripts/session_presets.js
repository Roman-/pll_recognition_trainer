import { allPllKeys } from '@/scripts/pll_cases'
import { keysForGroups, getGuideGroup } from '@/scripts/guide_lookup'

export const presets = [
    { id: 'all', label: 'All Cases', groups: null },
    { id: 'look_around', label: 'Look Around', groups: ['bookends_no_bar', 'no_bookends'] },
    { id: 'single_bar', label: 'Single Bar', groups: ['lights_plus_2bar', 'outside_2bar', 'inside_2bar'] },
    { id: 'no_obvious_clues', label: 'No obvious clues', exclude: ['three_bar', 'double_lights', 'double_2bar'] },
]

export const ALL_GROUP_IDS = [
    'three_bar', 'double_lights', 'lights_plus_2bar',
    'lone_lights', 'double_2bar', 'outside_2bar',
    'inside_2bar', 'bookends_no_bar', 'no_bookends'
]

export function getGroups(groupIds) {
    if (!groupIds) return []
    return groupIds.map(id => getGuideGroup(id)).filter(Boolean)
}

export function presetKeys(preset) {
    if (preset.groups) return keysForGroups(preset.groups)
    if (preset.exclude) {
        const excludeSet = new Set(keysForGroups(preset.exclude))
        return allPllKeys().filter(k => !excludeSet.has(k))
    }
    return allPllKeys()
}

export function subtitle(preset) {
    if (preset.exclude) {
        return 'Without ' + getGroups(preset.exclude).map(g => g.title).join(', ')
    }
    if (!preset.groups || preset.groups.length <= 1) return null
    return getGroups(preset.groups).map(g => g.title).join(' + ')
}
