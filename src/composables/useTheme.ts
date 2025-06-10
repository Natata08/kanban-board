import { ref, onMounted, watch, onUnmounted, type Ref } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

const STORAGE_KEY = 'kanban-theme-preference'

const checkSystemDarkMode = (): boolean => {
  try {
    return window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false
  } catch (error) {
    console.warn('matchMedia not available, defaulting to light theme for system check', error)
    return false
  }
}

const getStoredTheme = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.warn('localStorage not available, unable to get stored theme', error)
    return null
  }
}

const setStoredTheme = (theme: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (error) {
    console.warn("localStorage not available, theme preferences won't persist", error)
  }
}

export function useThemeManager(): {
  isDark: Ref<boolean>
  toggleTheme: () => void
} {
  const vuetifyTheme = useVuetifyTheme()
  const isDark = ref(vuetifyTheme.global.name.value === 'dark')

  let mediaQueryList: MediaQueryList | null = null

  const systemThemeChangeHandler = (event: MediaQueryListEvent) => {
    if (getStoredTheme() === null) {
      isDark.value = event.matches
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  onMounted(() => {
    const storedTheme = getStoredTheme()
    let initialDarkValue: boolean

    if (storedTheme) {
      initialDarkValue = storedTheme === 'dark'
    } else {
      initialDarkValue = checkSystemDarkMode()
      try {
        mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQueryList.addEventListener('change', systemThemeChangeHandler)
      } catch (error) {
        console.warn('Failed to add system theme change listener.', error)
        mediaQueryList = null
      }
    }

    isDark.value = initialDarkValue
  })

  onUnmounted(() => {
    if (mediaQueryList) {
      try {
        mediaQueryList.removeEventListener('change', systemThemeChangeHandler)
      } catch (error) {
        console.warn('Failed to remove system theme change listener.', error)
      }
    }
  })

  watch(isDark, (newIsDark) => {
    vuetifyTheme.global.name.value = newIsDark ? 'dark' : 'light'
    setStoredTheme(newIsDark ? 'dark' : 'light')
  })

  return {
    isDark,
    toggleTheme,
  }
}
