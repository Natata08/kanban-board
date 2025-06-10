import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKanbanStore } from '../useKanbanStore'
import { kanbanService } from '@/services/kanbanService'
import type { KanbanCard } from '@/types/kanban'

vi.mock('@/services/kanbanService', () => ({
  kanbanService: {
    fetchCompleteBoard: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    moveCard: vi.fn(),
  },
}))

const { board, isLoading, errorMessage } = useKanbanStore()
const resetStoreState = () => {
  board.columns = []
  isLoading.value = false
  errorMessage.value = ''
}

describe('useKanbanStore', () => {
  beforeEach(() => {
    resetStoreState()
    vi.clearAllMocks()
  })

  it('has a correct initial state', () => {
    expect(board.columns).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(errorMessage.value).toBe('')
  })

  describe('loadBoard', () => {
    it('loads the board and updates state on success', async () => {
      const mockBoard = {
        columns: [
          {
            id: 'col1',
            title: 'To Do',
            position: 0,
            cards: [
              {
                id: 'card1',
                title: 'Test Card',
                column_id: 'col1',
                position: 0,
                description: 'desc',
                created_at: 'date',
              },
            ],
          },
        ],
      }
      vi.mocked(kanbanService.fetchCompleteBoard).mockResolvedValue(mockBoard)

      const store = useKanbanStore()
      await store.loadBoard()

      expect(kanbanService.fetchCompleteBoard).toHaveBeenCalledTimes(1)
      expect(isLoading.value).toBe(false)
      expect(errorMessage.value).toBe('')
      expect(kanbanService.fetchCompleteBoard).toHaveBeenCalledTimes(1)
      expect(isLoading.value).toBe(false)
      expect(errorMessage.value).toBe('')
      expect(board.columns).toEqual(mockBoard.columns)
    })

    it('sets an error message on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const error = new Error('Network Error')
      vi.mocked(kanbanService.fetchCompleteBoard).mockRejectedValue(error)

      const store = useKanbanStore()
      await store.loadBoard()

      expect(kanbanService.fetchCompleteBoard).toHaveBeenCalledTimes(1)
      expect(isLoading.value).toBe(false)
      expect(errorMessage.value).toBe('Failed to load board. Please try again.')
      expect(board.columns).toEqual([])

      consoleErrorSpy.mockRestore()
    })
  })

  describe('createCard', () => {
    it('optimistically adds a new card and call the service', async () => {
      const initialColumn = { id: 'col1', title: 'To Do', position: 0, cards: [] }
      board.columns = [initialColumn]

      const newCardPayload = {
        title: 'New Task',
        description: 'A task to be done',
        columnId: 'col1',
      }
      const newCardFromApi: KanbanCard = {
        id: 'card-new',
        title: newCardPayload.title,
        description: newCardPayload.description,
        column_id: newCardPayload.columnId,
        position: 0,
        created_at: new Date().toISOString(),
      }

      vi.mocked(kanbanService.createCard).mockResolvedValue(newCardFromApi)

      const store = useKanbanStore()
      await store.createCard(newCardPayload)

      expect(kanbanService.createCard).toHaveBeenCalledWith({
        title: newCardPayload.title,
        description: newCardPayload.description,
        column_id: newCardPayload.columnId,
        position: 0,
      })

      expect(board.columns[0].cards).toHaveLength(1)
      expect(board.columns[0].cards![0].id).toBe(newCardFromApi.id)
      expect(errorMessage.value).toBe('')
    })
  })
})
