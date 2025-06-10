import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import KanbanBoard from '../../KanbanBoard.vue'
import KanbanColumn from '../../KanbanColumn.vue'
import ResizeObserver from 'resize-observer-polyfill'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({ components, directives })
global.ResizeObserver = ResizeObserver

const mockBoardState = {
  columns: [
    { id: 'col-1', title: 'To Do', cards: [{ id: 'card-1', title: 'Task 1' }] },
    { id: 'col-2', title: 'In Progress', cards: [] },
  ],
}

const mockLoadBoard = vi.fn()
const mockDeleteCard = vi.fn()
const mockCreateCard = vi.fn()
const mockUpdateCard = vi.fn()
const mockMoveCard = vi.fn()

vi.mock('@/composables/useKanbanStore', () => ({
  useKanbanStore: () => ({
    board: mockBoardState,
    isLoading: { value: false },
    errorMessage: { value: '' },
    loadBoard: mockLoadBoard,
    deleteCard: mockDeleteCard,
    createCard: mockCreateCard,
    updateCard: mockUpdateCard,
    moveCard: mockMoveCard,
  }),
}))

describe('KanbanBoard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof KanbanBoard>>

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(KanbanBoard, {
      global: {
        plugins: [vuetify],
      },
    })
  })

  it('calls the loadBoard action when the component is mounted', () => {
    expect(mockLoadBoard).toHaveBeenCalledTimes(1)
  })

  it('renders the correct number of columns based on the mocked store state', () => {
    const columns = wrapper.findAllComponents(KanbanColumn)
    expect(columns).toHaveLength(mockBoardState.columns.length)
  })
})
