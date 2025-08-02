import { ref, watch, onMounted } from 'vue'

export function useColorMode() {
  const isDark = ref(false)
  const storageKey = 'color-scheme'

  const setDark = (value: boolean) => {
    isDark.value = value
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', value)
      try {
        localStorage.setItem(storageKey, value ? 'dark' : 'light')
      } catch (e) {
        console.error('Failed to set color scheme in localStorage', e)
      }
    }
  }

  const toggleDark = () => {
    setDark(!isDark.value)
  }

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateColorScheme = (e: MediaQueryListEvent) => {
      // Only update if user hasn't made a manual choice
      if (localStorage.getItem(storageKey) === null) {
        setDark(e.matches)
      }
    }
    
    // Initial check
    try {
      const storedPreference = localStorage.getItem(storageKey)
      if (storedPreference) {
        setDark(storedPreference === 'dark')
      } else {
        setDark(mediaQuery.matches)
      }
    } catch (e) {
      console.error('Failed to get color scheme from localStorage', e)
      setDark(mediaQuery.matches)
    }

    // Listen for changes
    mediaQuery.addEventListener('change', updateColorScheme)
  })

  return {
    isDark,
    toggleDark
  }
}
