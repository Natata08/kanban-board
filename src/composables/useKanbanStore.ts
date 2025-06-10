import { reactive, ref } from 'vue'
import { kanbanService } from '@/services/kanbanService'
import type { KanbanBoard, KanbanCard, KanbanColumn, CardCreationPayload } from '@/types/kanban'

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
    title?: string
    description?: string
    columnId?: string
  }) => {
    const original = findCardAndColumn(payload.id)
    if (!original) {
      errorMessage.value = 'Failed to update card: Card not found.'
      return
    }

    const originalCardState = { ...original.card }
    const originalColumn = original.column
    const originalCardIndex = original.column.cards?.findIndex((c) => c.id === payload.id) ?? -1

    const cardToUpdate = original.card
    if (payload.title !== undefined) cardToUpdate.title = payload.title
    if (payload.description !== undefined) cardToUpdate.description = payload.description

    if (payload.columnId && payload.columnId !== original.column.id) {
      const targetColumn = board.columns.find((col) => col.id === payload.columnId)
      if (targetColumn && originalCardIndex > -1) {
        original.column.cards?.splice(originalCardIndex, 1)
        if (!targetColumn.cards) targetColumn.cards = []
        cardToUpdate.column_id = payload.columnId
        targetColumn.cards.push(cardToUpdate)
      }
    }

    try {
      const { id, ...updateData } = payload
      const servicePayload = {
        title: updateData.title,
        description: updateData.description,
        column_id: updateData.columnId,
      }
      Object.keys(servicePayload).forEach(
        (key) =>
          servicePayload[key as keyof typeof servicePayload] === undefined &&
          delete servicePayload[key as keyof typeof servicePayload],
      )

      if (Object.keys(servicePayload).length > 0) {
        await kanbanService.updateCard(id, servicePayload)
      }
    } catch (error) {
      console.error('Failed to update card:', error)
      errorMessage.value = 'Failed to update card. Reverting changes.'

      const current = findCardAndColumn(payload.id)
      if (current && current.column) {
        const currentCardIndex = current.column.cards?.findIndex((c) => c.id === payload.id) ?? -1
        if (currentCardIndex > -1) {
          const [cardToMoveBack] = current.column.cards!.splice(currentCardIndex, 1)
          cardToMoveBack.title = originalCardState.title
          cardToMoveBack.description = originalCardState.description
          cardToMoveBack.column_id = originalCardState.column_id
          originalColumn.cards?.splice(originalCardIndex, 0, cardToMoveBack)
        }
      }
    }
  }

  const deleteCard = async (cardId: string) => {
    const original = findCardAndColumn(cardId)
    if (!original) return

    const originalCard = { ...original.card }
    const originalColumn = original.column
    const originalIndex = original.column.cards?.findIndex((c) => c.id === cardId) ?? -1
    if (originalIndex > -1) {
      original.column.cards?.splice(originalIndex, 1)
    }

    try {
      await kanbanService.deleteCard(cardId)
    } catch (error) {
      console.error('Failed to delete card:', error)
      errorMessage.value = 'Failed to delete card. Reverting changes.'
      if (originalIndex > -1) {
        originalColumn.cards?.splice(originalIndex, 0, originalCard)
      }
    }
  }

  const moveCard = async (payload: {
    cardId: string
    fromColumnId: string
    toColumnId: string
  }) => {
    errorMessage.value = ''

    const fromColumn = board.columns.find((col) => col.id === payload.fromColumnId)
    const toColumn = board.columns.find((col) => col.id === payload.toColumnId)

    if (!fromColumn || !toColumn) {
      errorMessage.value = 'Invalid column specified for move.'
      return
    }

    const cardIndex = fromColumn.cards?.findIndex((c) => c.id === payload.cardId) ?? -1
    if (cardIndex === -1 || !fromColumn.cards) {
      errorMessage.value = 'Card not found in source column.'
      return
    }

    const originalFromCards = [...fromColumn.cards]
    const originalToCards = toColumn.cards ? [...toColumn.cards] : []

    const [optimisticallyMovedCard] = fromColumn.cards.splice(cardIndex, 1)
    if (!toColumn.cards) {
      toColumn.cards = []
    }
    optimisticallyMovedCard.column_id = payload.toColumnId

    const newPosition =
      toColumn.cards.length > 0 ? Math.max(0, ...toColumn.cards.map((c) => c.position)) + 1 : 0
    optimisticallyMovedCard.position = newPosition
    toColumn.cards.push(optimisticallyMovedCard)

    try {
      await kanbanService.moveCard(payload.cardId, payload.toColumnId, newPosition)
    } catch (error) {
      console.error('Error moving card:', error)
      errorMessage.value = 'Failed to move card. Reverting local changes.'

      fromColumn.cards = originalFromCards
      toColumn.cards = originalToCards
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
