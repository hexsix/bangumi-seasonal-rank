import { useColorMode } from '~/composables/useColorMode'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const { isDark, toggleDark } = useColorMode()
    
    // Make it available throughout the app
    nuxtApp.provide('colorMode', {
      isDark,
      toggleDark
    })
  } else {
    // Provide a server-side stub
    nuxtApp.provide('colorMode', {
      isDark: ref(false), // Default to false on server
      toggleDark: () => {} // No-op on server
    })
  }
})
