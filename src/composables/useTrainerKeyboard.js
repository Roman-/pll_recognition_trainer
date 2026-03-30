import { ref, watch } from 'vue'
import { useKeydown } from '@/composables/useKeydown'
import { isHelpKey, isPllLetter, isSingleLetterPll, isTwoLetterPllPrefix, validPllSuffixes } from '@/scripts/pll_constants'

export function useTrainerKeyboard(session, settings) {
    const pendingKey = ref(null)

    // Clear pendingKey when the case changes (e.g. correct answer submitted)
    watch(() => session.currentCase, () => {
        pendingKey.value = null
    })

    const handleKeyPress = e => {
        // if bs modal (.modal.show) or note input (.noteInput) is present, ignore
        if (document.querySelector(".modal.show")
            || session.store.showResultsModal
            || document.querySelector(".noteInput:focus")) {
            return
        }

        const withModifiers = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey

        if (settings.store.fullNameMode && pendingKey.value) {
            // We have a buffered prefix key — handle second keystroke
            if (!withModifiers && e.key === "Escape") {
                pendingKey.value = null
                session.pausePlay()
                e.preventDefault()
                return
            }
            if (!withModifiers && e.key === "Backspace") {
                pendingKey.value = null
                e.preventDefault()
                return
            }
            if (!withModifiers && isHelpKey(e.key)) {
                pendingKey.value = null
                session.giveUpOnCase()
                e.preventDefault()
                return
            }
            if (!withModifiers) {
                const suffix = e.key.toLowerCase()
                const suffixes = validPllSuffixes[pendingKey.value]
                if (suffixes && suffixes.includes(suffix)) {
                    const fullName = pendingKey.value + suffix
                    session.submitAnswer(fullName, true)
                    pendingKey.value = null
                    e.preventDefault()
                    return
                }
                // Invalid suffix — ignore
                e.preventDefault()
                return
            }
        }

        if (!withModifiers && e.key === "Escape") {
            pendingKey.value = null
            session.pausePlay()
            e.preventDefault()
            return
        }
        if (!withModifiers && e.key === " ") {
            session.resumePlay()
            e.preventDefault()
            return
        }
        if (!withModifiers && isPllLetter(e.key.toUpperCase())) {
            const letter = e.key.toUpperCase()
            if (settings.store.fullNameMode) {
                if (isSingleLetterPll(letter)) {
                    session.submitAnswer(letter, true)
                } else if (isTwoLetterPllPrefix(letter)) {
                    pendingKey.value = letter
                }
            } else {
                session.submitAnswer(letter)
            }
            e.preventDefault()
            return
        }
        if (!withModifiers && isHelpKey(e.key)) {
            session.giveUpOnCase()
            e.preventDefault()
            return
        }
        if (e.shiftKey && e.key === 'C' && !e.altKey && !e.ctrlKey && !e.metaKey && session.currentCase) {
            // Shift+C = cheat (for debugging purposes)
            if (settings.store.fullNameMode) {
                session.submitAnswer(session.currentCase.name, true)
            } else {
                session.submitAnswer(session.currentCase.name[0])
            }
            e.preventDefault()
            return
        }
    }

    useKeydown(handleKeyPress)

    return { pendingKey }
}
