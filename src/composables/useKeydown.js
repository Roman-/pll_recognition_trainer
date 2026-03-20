import { onMounted, onUnmounted } from 'vue'

export function useKeydown(handler, options) {
  onMounted(() => window.addEventListener('keydown', handler, options))
  onUnmounted(() => window.removeEventListener('keydown', handler, options))
}
