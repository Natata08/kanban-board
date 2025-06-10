import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ConfirmationDialog from '../../ConfirmationDialog.vue'
import { ref, nextTick } from 'vue'

if (typeof window !== 'undefined') {
  if (!window.visualViewport) {
    // @ts-expect-error We are intentionally mocking/overriding visualViewport for tests
    window.visualViewport = {
      width: 1920,
      height: 1080,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
  }
  if (!global.ResizeObserver) {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    global.ResizeObserver = ResizeObserverMock
  }
}

const mockShow = ref(false)
const mockTitle = ref('Default Title')
const mockMessage = ref('Default Message')
const mockCloseFn = vi.fn()
const mockConfirmFn = vi.fn()

vi.mock('@/composables/useConfirmationDialog', () => ({
  useConfirmationDialog: () => ({
    show: mockShow,
    title: mockTitle,
    message: mockMessage,
    close: mockCloseFn,
    confirm: mockConfirmFn,
  }),
}))

const vuetify = createVuetify({ components, directives })

describe('ConfirmationDialog.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ConfirmationDialog>>
  let domElement: HTMLDivElement

  const mountComponent = () => {
    domElement = document.createElement('div')
    domElement.id = 'test-dialog-container'
    document.body.appendChild(domElement)

    return mount(ConfirmationDialog, {
      global: {
        plugins: [vuetify],
      },
      attachTo: domElement,
    })
  }

  beforeEach(() => {
    mockShow.value = false
    mockTitle.value = 'Default Title'
    mockMessage.value = 'Default Message'
    mockCloseFn.mockClear()
    mockConfirmFn.mockClear()

    const oldContainer = document.getElementById('test-dialog-container')
    if (oldContainer) {
      oldContainer.remove()
    }
  })

  afterEach(() => {
    if (wrapper && wrapper.exists()) {
      wrapper.unmount()
    }
    if (domElement) {
      domElement.remove()
    }
  })

  it('is not visible when show is false', () => {
    mockShow.value = false
    wrapper = mountComponent()

    const dialogCard = document.body.querySelector('.v-dialog .v-card')
    expect(dialogCard).toBeNull()
  })

  it('renders correctly with title and message when show is true', async () => {
    mockShow.value = true
    mockTitle.value = 'Test Confirmation Title'
    mockMessage.value = 'Are you sure about this test action?'
    wrapper = mountComponent()
    await nextTick()

    const titleEl = document.body.querySelector('[data-testid="confirmation-dialog-title"]')
    const messageEl = document.body.querySelector('[data-testid="confirmation-dialog-message"]')

    expect(titleEl).not.toBeNull()
    expect(titleEl?.textContent).toBe('Test Confirmation Title')
    expect(messageEl).not.toBeNull()
    expect(messageEl?.textContent).toBe('Are you sure about this test action?')
  })

  it('calls close function when Cancel button is clicked', async () => {
    mockShow.value = true
    wrapper = mountComponent()
    await nextTick()

    const cancelButton = document.body.querySelector(
      '[data-testid="confirmation-cancel-button"]',
    ) as HTMLElement | null
    expect(cancelButton).not.toBeNull()
    cancelButton?.click()

    expect(mockCloseFn).toHaveBeenCalledTimes(1)
    expect(mockConfirmFn).not.toHaveBeenCalled()
  })

  it('calls confirm function when Confirm button is clicked', async () => {
    mockShow.value = true
    wrapper = mountComponent()
    await nextTick()

    const confirmButton = document.body.querySelector(
      '[data-testid="confirmation-confirm-button"]',
    ) as HTMLElement | null
    expect(confirmButton).not.toBeNull()
    confirmButton?.click()

    expect(mockConfirmFn).toHaveBeenCalledTimes(1)
    expect(mockCloseFn).not.toHaveBeenCalled()
  })
})
