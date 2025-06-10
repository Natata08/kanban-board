import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import CardDialog from '../../CardDialog.vue'
import type { KanbanCard, KanbanColumn } from '../../../types/kanban'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'visualViewport', {
    writable: true,
    configurable: true,
    value: {
      width: 1920,
      height: 1080,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      onresize: null,
      onscroll: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    },
  })
}

interface MockVForm {
  validate: () => Promise<{ valid: boolean }>
  resetValidation: () => void
}

interface CardDialogMountProps {
  isEditMode: boolean
  cardData?: KanbanCard | null
  initialColumnId?: string | null
}

const TestWrapperComponent = defineComponent({
  components: { CardDialog, 'v-app': components.VApp },
  template: `<v-app><card-dialog v-bind="$attrs" /></v-app>`,
  inheritAttrs: false,
})

describe('CardDialog.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof TestWrapperComponent>>
  let appDiv: HTMLDivElement

  const mockAvailableColumns: KanbanColumn[] = [
    { id: 'col1', title: 'To Do', cards: [], position: 1 },
    { id: 'col2', title: 'In Progress', cards: [], position: 2 },
  ]

  const mockCardFormRef: MockVForm = {
    validate: vi.fn(),
    resetValidation: vi.fn(),
  }

  const mountComponent = (props: CardDialogMountProps) => {
    appDiv = document.createElement('div')
    appDiv.setAttribute('id', 'app')
    document.body.appendChild(appDiv)

    return mount(TestWrapperComponent, {
      props: {
        modelValue: true,
        availableColumns: mockAvailableColumns,
        ...props,
      },
      global: {
        plugins: [vuetify],
      },
      attachTo: appDiv,
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockCardFormRef.validate = vi.fn().mockResolvedValue({ valid: true })
    mockCardFormRef.resetValidation = vi.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    if (appDiv) {
      appDiv.remove()
    }
  })

  describe('Create Mode', () => {
    beforeEach(async () => {
      wrapper = mountComponent({
        isEditMode: false,
        cardData: null,
        initialColumnId: mockAvailableColumns[0].id,
      })
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      if (cardDialogInstance.cardFormRef) {
        cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>
      } else {
        Object.defineProperty(cardDialogInstance, 'cardFormRef', {
          configurable: true,
          value: mockCardFormRef as InstanceType<typeof components.VForm>,
          writable: true,
        })
      }
    })

    it('renders correctly in create mode', async () => {
      await wrapper.vm.$nextTick()

      const title = document.body.querySelector('[data-testid="card-dialog-title"]')
      expect(title).not.toBeNull()
      expect(title?.textContent).toBe('Add New Card')

      const titleInput = document.body.querySelector(
        '[data-testid="card-title-input"] input',
      ) as HTMLInputElement | null
      const descriptionInput = document.body.querySelector(
        '[data-testid="card-description-input"] textarea',
      ) as HTMLTextAreaElement | null

      expect(titleInput).not.toBeNull()
      expect(descriptionInput).not.toBeNull()
      expect(titleInput?.value).toBe('')
      expect(descriptionInput?.value).toBe('')

      const cardDialogVm = wrapper.findComponent(CardDialog).vm
      expect(cardDialogVm.formData.targetColumnId).toBe(mockAvailableColumns[0].id)
    })

    it('emits update:modelValue false when cancel button is clicked', async () => {
      await wrapper.vm.$nextTick()
      const cancelButton = document.body.querySelector(
        '[data-testid="card-cancel-button"]',
      ) as HTMLElement | null
      expect(cancelButton).not.toBeNull()
      cancelButton?.click()

      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['update:modelValue']).toBeTruthy()
      expect(cardDialogWrapper.emitted()['update:modelValue'][0]).toEqual([false])
    })

    it('emits save-card with correct payload when form is submitted and valid', async () => {
      await wrapper.vm.$nextTick()
      const newTitle = 'New Test Card'
      const newDescription = 'This is a new card.'
      const targetColumn = mockAvailableColumns[1].id

      const titleInput = document.body.querySelector(
        '[data-testid="card-title-input"] input',
      ) as HTMLInputElement | null
      const descriptionInput = document.body.querySelector(
        '[data-testid="card-description-input"] textarea',
      ) as HTMLTextAreaElement | null
      const saveButton = document.body.querySelector(
        '[data-testid="card-save-button"]',
      ) as HTMLElement | null

      expect(titleInput).not.toBeNull()
      expect(descriptionInput).not.toBeNull()
      expect(saveButton).not.toBeNull()

      titleInput!.value = newTitle
      titleInput!.dispatchEvent(new Event('input'))
      descriptionInput!.value = newDescription
      descriptionInput!.dispatchEvent(new Event('input'))

      const cardDialogVm = wrapper.findComponent(CardDialog).vm
      cardDialogVm.formData.targetColumnId = targetColumn

      await wrapper.vm.$nextTick()
      saveButton?.click()
      await wrapper.vm.$nextTick()

      expect(mockCardFormRef.validate).toHaveBeenCalled()
      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['save-card']).toBeTruthy()
      expect(cardDialogWrapper.emitted()['save-card'][0]).toEqual([
        {
          card: { title: newTitle, description: newDescription },
          targetColumnId: targetColumn,
        },
      ])
    })

    it('does not emit save-card if form is invalid', async () => {
      await wrapper.vm.$nextTick()
      mockCardFormRef.validate = vi.fn().mockResolvedValue({ valid: false })
      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>

      const saveButton = document.body.querySelector(
        '[data-testid="card-save-button"]',
      ) as HTMLElement | null
      expect(saveButton).not.toBeNull()

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      saveButton?.click()
      await wrapper.vm.$nextTick()

      expect(mockCardFormRef.validate).toHaveBeenCalled()
      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['save-card']).toBeFalsy()

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Edit Mode', () => {
    const mockEditCard: KanbanCard = {
      id: 'card1',
      title: 'Existing Card Title',
      description: 'Existing card description.',
      column_id: mockAvailableColumns[0].id,
      position: 1,
    }
    const mockInitialColumnId = mockAvailableColumns[0].id

    beforeEach(async () => {
      wrapper = mountComponent({
        isEditMode: true,
        cardData: { ...mockEditCard }, // Pass a copy
        initialColumnId: mockInitialColumnId,
      })
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0)) // Extra tick for overlays

      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      if (cardDialogInstance.cardFormRef) {
        cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>
      } else {
        Object.defineProperty(cardDialogInstance, 'cardFormRef', {
          configurable: true,
          value: mockCardFormRef as InstanceType<typeof components.VForm>,
          writable: true,
        })
      }
    })

    it('renders correctly in edit mode with pre-filled data', async () => {
      await wrapper.vm.$nextTick()

      const title = document.body.querySelector('[data-testid="card-dialog-title"]')
      expect(title).not.toBeNull()
      expect(title?.textContent).toBe('Edit Card')

      const titleInput = document.body.querySelector(
        '[data-testid="card-title-input"] input',
      ) as HTMLInputElement | null
      const descriptionInput = document.body.querySelector(
        '[data-testid="card-description-input"] textarea',
      ) as HTMLTextAreaElement | null

      expect(titleInput).not.toBeNull()
      expect(descriptionInput).not.toBeNull()
      expect(titleInput?.value).toBe(mockEditCard.title)
      expect(descriptionInput?.value).toBe(mockEditCard.description)

      const cardDialogVm = wrapper.findComponent(CardDialog).vm
      expect(cardDialogVm.formData.targetColumnId).toBe(mockInitialColumnId)
    })

    it('emits save-card with original data when saved without changes', async () => {
      await wrapper.vm.$nextTick()
      mockCardFormRef.validate = vi.fn().mockResolvedValue({ valid: true })
      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>

      const saveButton = document.body.querySelector(
        '[data-testid="card-save-button"]',
      ) as HTMLElement | null
      expect(saveButton).not.toBeNull()
      saveButton?.click()
      await wrapper.vm.$nextTick()

      expect(mockCardFormRef.validate).toHaveBeenCalled()
      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['save-card']).toBeTruthy()
      expect(cardDialogWrapper.emitted()['save-card'][0]).toEqual([
        {
          card: {
            title: mockEditCard.title,
            description: mockEditCard.description,
          },
          originalCardId: mockEditCard.id,
          targetColumnId: mockInitialColumnId,
        },
      ])
    })

    it('emits save-card with updated title when title is changed', async () => {
      await wrapper.vm.$nextTick()
      mockCardFormRef.validate = vi.fn().mockResolvedValue({ valid: true })
      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>

      const newTitle = 'Updated Card Title'
      const titleInput = document.body.querySelector(
        '[data-testid="card-title-input"] input',
      ) as HTMLInputElement | null
      expect(titleInput).not.toBeNull()
      titleInput!.value = newTitle
      titleInput!.dispatchEvent(new Event('input'))
      await wrapper.vm.$nextTick()

      const saveButton = document.body.querySelector(
        '[data-testid="card-save-button"]',
      ) as HTMLElement | null
      expect(saveButton).not.toBeNull()
      saveButton?.click()
      await wrapper.vm.$nextTick()

      expect(mockCardFormRef.validate).toHaveBeenCalled()
      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['save-card']).toBeTruthy()
      expect(cardDialogWrapper.emitted()['save-card'][0]).toEqual([
        {
          card: {
            title: newTitle,
            description: mockEditCard.description,
          },
          originalCardId: mockEditCard.id,
          targetColumnId: mockInitialColumnId,
        },
      ])
    })

    it('emits save-card with updated description when description is changed', async () => {
      await wrapper.vm.$nextTick()
      mockCardFormRef.validate = vi.fn().mockResolvedValue({ valid: true })
      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>

      const newDescription = 'Updated card description.'
      const descriptionInput = document.body.querySelector(
        '[data-testid="card-description-input"] textarea',
      ) as HTMLTextAreaElement | null
      expect(descriptionInput).not.toBeNull()
      descriptionInput!.value = newDescription
      descriptionInput!.dispatchEvent(new Event('input'))
      await wrapper.vm.$nextTick()

      const saveButton = document.body.querySelector(
        '[data-testid="card-save-button"]',
      ) as HTMLElement | null
      expect(saveButton).not.toBeNull()
      saveButton?.click()
      await wrapper.vm.$nextTick()

      expect(mockCardFormRef.validate).toHaveBeenCalled()
      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['save-card']).toBeTruthy()
      expect(cardDialogWrapper.emitted()['save-card'][0]).toEqual([
        {
          card: {
            title: mockEditCard.title,
            description: newDescription,
          },
          originalCardId: mockEditCard.id,
          targetColumnId: mockInitialColumnId,
        },
      ])
    })

    it('emits save-card with updated target column when column is changed', async () => {
      await wrapper.vm.$nextTick()
      mockCardFormRef.validate = vi.fn().mockResolvedValue({ valid: true })
      const cardDialogInstance = wrapper.findComponent(CardDialog).vm
      cardDialogInstance.cardFormRef = mockCardFormRef as InstanceType<typeof components.VForm>

      const newTargetColumnId = mockAvailableColumns[1].id
      cardDialogInstance.formData.targetColumnId = newTargetColumnId
      await wrapper.vm.$nextTick()

      const saveButton = document.body.querySelector(
        '[data-testid="card-save-button"]',
      ) as HTMLElement | null
      expect(saveButton).not.toBeNull()
      saveButton?.click()
      await wrapper.vm.$nextTick()

      expect(mockCardFormRef.validate).toHaveBeenCalled()
      const cardDialogWrapper = wrapper.findComponent(CardDialog)
      expect(cardDialogWrapper.emitted()['save-card']).toBeTruthy()
      expect(cardDialogWrapper.emitted()['save-card'][0]).toEqual([
        {
          card: {
            title: mockEditCard.title,
            description: mockEditCard.description,
          },
          originalCardId: mockEditCard.id,
          targetColumnId: newTargetColumnId,
        },
      ])
    })
  })
})
