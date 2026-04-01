import { keysForGroups } from '@/scripts/guide_lookup'
import { allPllKeys } from '@/scripts/pll_cases'
import { computePoolKey } from '@/scripts/session_history'

export const MASTERY_ACCURACY = 0.9

export const QUEST_PHASES = [
    { id: 1, title: 'Most Distinctive' },
    { id: 2, title: 'Lights' },
    { id: 3, title: 'Bars' },
    { id: 4, title: 'Bookends' },
    { id: 5, title: 'Grand Finale' },
]

export const QUEST_STEPS = [
    { id: 1,  phase: 1, label: 'Double Lights',   groups: ['double_lights'],                                          isCombo: false },
    { id: 2,  phase: 1, label: 'Three-Bar',        groups: ['three_bar'],                                              isCombo: false },
    { id: 3,  phase: 2, label: 'Lone Lights',      groups: ['lone_lights'],                                            isCombo: false },
    { id: 4,  phase: 2, label: 'Lights + 2-Bar',   groups: ['lights_plus_2bar'],                                       isCombo: false },
    { id: 5,  phase: 2, label: 'All Lights',        groups: ['double_lights', 'lone_lights', 'lights_plus_2bar'],       isCombo: true },
    { id: 6,  phase: 3, label: 'Double 2-Bar',     groups: ['double_2bar'],                                            isCombo: false },
    { id: 7,  phase: 3, label: 'Outside 2-Bar',    groups: ['outside_2bar'],                                           isCombo: false },
    { id: 8,  phase: 3, label: 'Inside 2-Bar',     groups: ['inside_2bar'],                                            isCombo: false },
    { id: 9,  phase: 3, label: 'All Bars',          groups: ['three_bar', 'double_2bar', 'outside_2bar', 'inside_2bar'], isCombo: true },
    { id: 10, phase: 4, label: 'Bookends No Bar',  groups: ['bookends_no_bar'],                                        isCombo: false },
    { id: 11, phase: 4, label: 'No Bookends',      groups: ['no_bookends'],                                            isCombo: false },
    { id: 12, phase: 4, label: 'Look Around',       groups: ['bookends_no_bar', 'no_bookends'],                         isCombo: true },
    { id: 13, phase: 5, label: 'All Cases',         groups: null,                                                       isCombo: true },
]

export function keysForStep(step) {
    return step.groups ? keysForGroups(step.groups) : allPllKeys()
}

export function poolKeyForStep(step) {
    return computePoolKey(keysForStep(step))
}
