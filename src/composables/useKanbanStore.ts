import { reactive, ref } from 'vue'
import { kanbanService } from '@/services/kanbanService'
import type {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  CardCreationPayload,
  CardUpdatePayload,
} from '@/types/kanban'

const board = reactive<KanbanBoard>({ columns: [] })
const isLoading = ref(false)
const errorMessage = ref('')

export function useKanbanStore() {
  const findCardAndColumn = (cardId: string): { card: KanbanCard; column: KanbanColumn } | null => {
    for (const column of board.columns) {
      const card = column.cards?.find((c) => c.id === cardId)
      if (card) {
        return { card, column }
      }
    }
    return null
  }

  const loadBoard = async () => {
    if (isLoading.value) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const data = await kanbanService.fetchCompleteBoard()
      board.columns = data.columns
    } catch (error) {
      console.error('Failed to load board:', error)
      errorMessage.value = 'Failed to load board. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  const createCard = async (payload: { title: string; description: string; columnId: string }) => {
    isLoading.value = true
    try {
      const targetColumn = board.columns.find((col) => col.id === payload.columnId)
      if (!targetColumn) throw new Error('Target column not found')

      const position = targetColumn.cards?.length
        ? Math.max(...targetColumn.cards.map((c) => c.position)) + 1
        : 0
      const newCardData: CardCreationPayload = {
        title: payload.title,
        description: payload.description,
        column_id: payload.columnId,
        position,
      }
      const newCard = await kanbanService.createCard(newCardData)
      if (!targetColumn.cards) targetColumn.cards = []
      targetColumn.cards.push(newCard)
    } catch (error) {
      console.error('Error creating card:', error)
      errorMessage.value = 'Failed to create card.'
    } finally {
      isLoading.value = false
    }
  }

  const updateCard = async (payload: {
    id: string
    title: string
    description: string
    columnId: string
  }) => {
    isLoading.value = true
    try {
      const original = findCardAndColumn(payload.id)
      if (!original) throw new Error('Card not found')

      const cardUpdatePayload: CardUpdatePayload = {
        id: payload.id,
        title: payload.title,
        description: payload.description,
        column_id: payload.columnId,
      }
      await kanbanService.updateCard(payload.id, cardUpdatePayload)

      original.card.title = payload.title
      original.card.description = payload.description

      if (original.column.id !== payload.columnId) {
        const cardIndex = original.column.cards?.findIndex((c) => c.id === payload.id)
        if (cardIndex !== undefined && cardIndex > -1) {
          const [movedCard] = original.column.cards!.splice(cardIndex, 1)
          const targetColumn = board.columns.find((col) => col.id === payload.columnId)
          if (targetColumn) {
            if (!targetColumn.cards) targetColumn.cards = []
            movedCard.column_id = payload.columnId
            targetColumn.cards.push(movedCard)
          }
        }
      }
    } catch (error) {
      console.error('Error updating card:', error)
      errorMessage.value = 'Failed to update card.'
      await loadBoard()
    } finally {
      isLoading.value = false
    }
  }

  const deleteCard = async (cardId: string) => {
    isLoading.value = true
    try {
      await kanbanService.deleteCard(cardId)
      const original = findCardAndColumn(cardId)
      if (original?.column?.cards) {
        original.column.cards = original.column.cards.filter((c) => c.id !== cardId)
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      errorMessage.value = 'Failed to delete card.'
    } finally {
      isLoading.value = false
    }
  }

  const moveCard = async (payload: {
    cardId: string
    fromColumnId: string
    toColumnId: string
  }) => {
    isLoading.value = true
    try {
      const fromColumn = board.columns.find((col) => col.id === payload.fromColumnId)
      const toColumn = board.columns.find((col) => col.id === payload.toColumnId)
      if (!fromColumn || !toColumn) throw new Error('Column not found')

      const cardIndex = fromColumn.cards?.findIndex((c) => c.id === payload.cardId)
      if (cardIndex === undefined || cardIndex < 0)
        throw new Error('Card not found in source column')

      const newPosition = toColumn.cards?.length
        ? Math.max(...toColumn.cards.map((c) => c.position)) + 1
        : 0
      await kanbanService.moveCard(payload.cardId, payload.toColumnId, newPosition)

      const [cardToMove] = fromColumn.cards!.splice(cardIndex, 1)
      if (!toColumn.cards) toColumn.cards = []
      cardToMove.column_id = payload.toColumnId
      cardToMove.position = newPosition
      toColumn.cards.push(cardToMove)
    } catch (error) {
      console.error('Error moving card:', error)
      errorMessage.value = 'Failed to move card.'
      await loadBoard()
    } finally {
      isLoading.value = false
    }
  }

  return {
    board,
    isLoading,
    errorMessage,
    loadBoard,
    findCardAndColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  }
}
