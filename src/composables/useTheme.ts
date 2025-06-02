import { ref, watch } from 'vue'
import { usePreferredDark } from '@vueuse/core'

export const useTheme = () => {
  const isDark = ref(usePreferredDark().value)
  
  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme
  }
} 