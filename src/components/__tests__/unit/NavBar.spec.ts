import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResizeObserver from 'resize-observer-polyfill'
import NavBar from '../../NavBar.vue'
import AboutDialog from '../../AboutDialog.vue'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
}

const matchMediaMock = vi.fn()

const vuetify = createVuetify({ components, directives })
global.ResizeObserver = ResizeObserver

describe('NavBar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NavBar>>

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      configurable: true,
      writable: true,
    })

    vi.clearAllMocks()

    localStorageMock.getItem.mockReturnValue('light')
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const parentWrapper = mount(
      {
        template: '<v-layout><v-app><NavBar /></v-app></v-layout>',
        components: {
          NavBar,
          AboutDialog,
        },
      },
      {
        global: {
          plugins: [vuetify],
          stubs: {
            AboutDialog: true,
          },
        },
      },
    )
    wrapper = parentWrapper.findComponent(NavBar)
  })

  it('renders with correct title', () => {
    expect(wrapper.text()).toContain('Kanban Board')
  })

  it('emits theme-change event when toggle theme button is clicked', async () => {
    const themeButton = wrapper.find('[aria-label="Toggle theme"]')
    await themeButton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('theme-change')
    expect(wrapper.emitted('theme-change')).toHaveLength(1)
    expect(wrapper.emitted('theme-change')![0]).toEqual([true])
  })

  it('displays moon icon when in light mode and sun icon when toggled to dark mode', async () => {
    await wrapper.vm.$nextTick()
    let themeButtonWrapper = wrapper.findComponent({
      name: 'VBtn',
      props: { 'aria-label': 'Toggle theme' },
    })
    let themeIconComponent = themeButtonWrapper.findComponent({ name: 'VIcon' })
    expect(themeIconComponent.props('icon')).toBe('mdi-weather-night')

    await themeButtonWrapper.trigger('click')
    await wrapper.vm.$nextTick()

    themeButtonWrapper = wrapper.findComponent({
      name: 'VBtn',
      props: { 'aria-label': 'Toggle theme' },
    })
    themeIconComponent = themeButtonWrapper.findComponent({ name: 'VIcon' })
    expect(themeIconComponent.props('icon')).toBe('mdi-weather-sunny')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('kanban-theme-preference', 'dark')
  })

  it('opens About dialog when information button is clicked', async () => {
    expect(wrapper.vm.showInfo).toBe(false)
    const infoButton = wrapper.find('div.d-none.d-md-flex [aria-label="Information"]')
    await infoButton.trigger('click')
    expect(wrapper.vm.showInfo).toBe(true)
  })
})
