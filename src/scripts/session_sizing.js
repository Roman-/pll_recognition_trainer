import { shuffle } from '@/scripts/helpers'

// --- Size option constants ---
export const SIZE_UNIQUE = 0
export const SIZE_MEDIUM = 1
export const SIZE_LARGE = 2
export const SIZE_OPTIONS = [SIZE_UNIQUE, SIZE_MEDIUM, SIZE_LARGE]
export const SIZE_DEFAULT = SIZE_MEDIUM

// --- Rounding helpers ---
function roundUpTo(n, multiple) {
    return Math.ceil(n / multiple) * multiple
}

// --- Formulas ---
export function computeSessionTotal(uniqueCount, sizeOption) {
    switch (sizeOption) {
        case SIZE_UNIQUE:
            return uniqueCount
        case SIZE_MEDIUM:
            return roundUpTo(Math.max(uniqueCount * 1.2, uniqueCount + 4), 5)
        case SIZE_LARGE:
            return roundUpTo(Math.max(uniqueCount * 1.6, uniqueCount + 11), 10)
        default:
            return uniqueCount
    }
}

export function computeExtraCount(uniqueCount, sizeOption) {
    return computeSessionTotal(uniqueCount, sizeOption) - uniqueCount
}

// --- Pool building ---
export function buildSessionPool(uniqueKeys, sizeOption) {
    const extra = computeExtraCount(uniqueKeys.length, sizeOption)
    if (extra === 0) return [...uniqueKeys]
    return [...uniqueKeys, ...shuffle([...uniqueKeys]).slice(0, extra)]
}

// --- Helper text ---
export function sizeHelpText(sizeOption) {
    if (sizeOption === SIZE_UNIQUE) {
        return 'No duplicates \u2014 session order becomes predictable'
    }
    return 'Extra cases are random duplicates from the same set to make it less predictable'
}