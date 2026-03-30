import { ref, onMounted, onUnmounted } from 'vue'

export function useHorizontalScroll() {
  const scrollRef = ref(null)
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  function updateScrollState() {
    const el = scrollRef.value
    if (!el) return
    canScrollLeft.value = el.scrollLeft > 0
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
  }

  function scrollBy(dir) {
    scrollRef.value?.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  onMounted(() => {
    updateScrollState()
    scrollRef.value?.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
  })

  onUnmounted(() => {
    scrollRef.value?.removeEventListener('scroll', updateScrollState)
    window.removeEventListener('resize', updateScrollState)
  })

  return { scrollRef, canScrollLeft, canScrollRight, scrollBy }
}
