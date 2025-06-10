import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKanbanStore } from '../useKanbanStore'
import { kanbanService } from '@/services/kanbanService'

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
})
