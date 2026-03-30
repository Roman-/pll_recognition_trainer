import { ref, onUnmounted } from 'vue'

export function useBreakpoint(query) {
    const mql = window.matchMedia(query)
    const matches = ref(mql.matches)
    const update = (e) => { matches.value = e.matches }
    mql.addEventListener('change', update)
    onUnmounted(() => mql.removeEventListener('change', update))
    return matches
}
