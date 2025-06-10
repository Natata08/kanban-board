import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick, defineComponent, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useThemeManager } from '../useTheme'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

const mockVuetifyTheme = {
  global: {
    name: ref('light'),
  },
}
vi.mock('vuetify', async (importOriginal) => {
  return {
    ...importOriginal,
    useTheme: () => mockVuetifyTheme,
  }
})

interface UseThemeManagerReturn {
  isDark: Ref<boolean>
  toggleTheme: () => void
}

const mountUseThemeManager = (): UseThemeManagerReturn => {
  let composableResult: UseThemeManagerReturn
  const TestComponent = defineComponent({
    setup() {
      composableResult = useThemeManager()
      return () => null
    },
  })
  mount(TestComponent)
  return composableResult!
}

describe('useThemeManager', () => {
  beforeEach(() => {
    localStorage.clear()
    mockVuetifyTheme.global.name.value = 'light'
    vi.clearAllMocks()
  })

  it('initializes with light theme by default', async () => {
    const { isDark } = mountUseThemeManager()
    await nextTick()
    expect(isDark.value).toBe(false)
    expect(mockVuetifyTheme.global.name.value).toBe('light')
  })

  it('initializes with theme from localStorage if present', async () => {
    localStorage.setItem('kanban-theme-preference', 'dark')
    const { isDark } = mountUseThemeManager()
    await nextTick()
    expect(isDark.value).toBe(true)
    expect(mockVuetifyTheme.global.name.value).toBe('dark')
  })

  it('toggles theme from light to dark and updates localStorage', async () => {
    const { isDark, toggleTheme } = mountUseThemeManager()
    await nextTick()
    expect(isDark.value).toBe(false)

    toggleTheme()
    await nextTick()

    expect(isDark.value).toBe(true)
    expect(mockVuetifyTheme.global.name.value).toBe('dark')
    expect(localStorage.getItem('kanban-theme-preference')).toBe('dark')
  })

  it('toggles theme from dark to light and updates localStorage', async () => {
    localStorage.setItem('kanban-theme-preference', 'dark')
    const { isDark, toggleTheme } = mountUseThemeManager()
    await nextTick()
    expect(isDark.value).toBe(true)

    toggleTheme()
    await nextTick()

    expect(isDark.value).toBe(false)
    expect(mockVuetifyTheme.global.name.value).toBe('light')
    expect(localStorage.getItem('kanban-theme-preference')).toBe('light')
  })
})
