<template>
  <div class="kanban-board fill-height">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-end mb-4">
          <v-btn color="primary" @click="openAddCardDialog(null)">
            <v-icon left>mdi-plus</v-icon>
            Add new task
          </v-btn>
        </div>
        <div class="kanban-board-columns d-flex">
          <KanbanColumn
            v-for="column in board.columns"
            :key="column.id"
            :column="column"
            @edit-card="openEditCardDialog"
            @delete-card="handleDeleteCard"
            @card-moved="handleCardMoved"
            @add-card="openAddCardDialog"
          />
        </div>
      </v-col>
    </v-row>

    <CardDialog
      v-model="cardDialog.show"
      :is-edit-mode="cardDialog.isEditMode"
      :card-data="cardDialog.cardData"
      :initial-column-id="cardDialog.targetColumnId"
      :available-columns="board.columns"
      @save-card="handleSaveCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import CardDialog from '@/components/CardDialog.vue'
import { kanbanService } from '@/services/kanbanService'
import type { KanbanBoard, KanbanCard, KanbanColumn as KanbanColumnType } from '@/types/kanban'

const board = reactive<KanbanBoard>({ columns: [] })
const isLoading = ref(false)
const errorMessage = ref('')

const cardDialogDefaultState = {
  show: false,
  isEditMode: false,
  cardData: null as KanbanCard | null,
  targetColumnId: null as string | null,
}
const cardDialog = reactive({ ...cardDialogDefaultState })

onMounted(() => {
  loadBoard()
})

async function loadBoard() {
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

const findCardAndColumn = (
  cardId: string,
): { card: KanbanCard; column: KanbanColumnType } | null => {
  for (const column of board.columns) {
    const card = column.cards?.find((c) => c.id === cardId)
    if (card) {
      return { card, column }
    }
  }
  return null
}

const openAddCardDialog = (columnId: string | null) => {
  Object.assign(cardDialog, {
    ...cardDialogDefaultState,
    show: true,
    isEditMode: false,
    targetColumnId: columnId || (board.columns.length > 0 ? board.columns[0].id : null),
  })
}

const openEditCardDialog = (cardId: string) => {
  const result = findCardAndColumn(cardId)
  if (result) {
    Object.assign(cardDialog, {
      show: true,
      isEditMode: true,
      cardData: { ...result.card },
      targetColumnId: result.column.id,
    })
  }
}

const closeCardDialog = () => {
  cardDialog.show = false
}

const handleSaveCard = async (payload: {
  card: Partial<KanbanCard> & { title: string; description: string }
  targetColumnId: string
  originalCardId?: string
}) => {
  isLoading.value = true

  try {
    if (payload.originalCardId) {
      const result = findCardAndColumn(payload.originalCardId)

      if (result) {
        await kanbanService.updateCard(payload.originalCardId, {
          id: payload.originalCardId,
          title: payload.card.title,
          description: payload.card.description,
          column_id: payload.targetColumnId,
        })

        if (result.column.id !== payload.targetColumnId) {
          const targetColumn = board.columns.find((col) => col.id === payload.targetColumnId)
          const position = targetColumn?.cards?.length
            ? Math.max(...targetColumn.cards.map((c) => c.position)) + 1
            : 0

          await kanbanService.moveCard(payload.originalCardId, payload.targetColumnId, position)

          const cardIndex = result.column.cards?.findIndex((c) => c.id === payload.originalCardId)
          if (cardIndex !== undefined && cardIndex !== -1) {
            const [movedCard] = result.column.cards?.splice(cardIndex, 1) || []

            const targetColumn = board.columns.find((col) => col.id === payload.targetColumnId)
            if (targetColumn && movedCard) {
              if (!targetColumn.cards) targetColumn.cards = []
              targetColumn.cards.push({
                ...movedCard,
                title: payload.card.title,
                description: payload.card.description,
                column_id: payload.targetColumnId,
              })
            }
          }
        } else {
          if (result.card) {
            result.card.title = payload.card.title
            result.card.description = payload.card.description
          }
        }
      }
    } else {
      const targetColumn = board.columns.find((col) => col.id === payload.targetColumnId)

      if (targetColumn) {
        const position = targetColumn.cards?.length
          ? Math.max(...targetColumn.cards.map((c) => c.position)) + 1
          : 0

        const newCard = await kanbanService.createCard({
          title: payload.card.title,
          description: payload.card.description,
          column_id: payload.targetColumnId,
          position,
        })

        if (!targetColumn.cards) targetColumn.cards = []
        targetColumn.cards.push(newCard)
      }
    }
  } catch (error) {
    console.error('Error saving card:', error)
    errorMessage.value = 'Failed to save card. Please try again.'
  } finally {
    isLoading.value = false
    closeCardDialog()
  }
}

const handleDeleteCard = async (cardId: string) => {
  isLoading.value = true

  try {
    await kanbanService.deleteCard(cardId)

    const result = findCardAndColumn(cardId)
    if (result?.column?.cards) {
      result.column.cards = result.column.cards.filter((c) => c.id !== cardId)
    }
  } catch (error) {
    console.error('Error deleting card:', error)
    errorMessage.value = 'Failed to delete card. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleCardMoved = async (payload: {
  cardId: string
  fromColumnId: string
  toColumnId: string
}) => {
  isLoading.value = true

  try {
    const fromColumn = board.columns.find((col) => col.id === payload.fromColumnId)
    const toColumn = board.columns.find((col) => col.id === payload.toColumnId)

    if (fromColumn && toColumn) {
      const cardIndex = fromColumn.cards?.findIndex((c) => c.id === payload.cardId) ?? -1

      if (cardIndex > -1 && fromColumn.cards) {
        const newPosition = toColumn.cards?.length
          ? Math.max(...toColumn.cards.map((c) => c.position)) + 1
          : 0

        await kanbanService.moveCard(payload.cardId, payload.toColumnId, newPosition)

        const [cardToMove] = fromColumn.cards.splice(cardIndex, 1)
        if (!toColumn.cards) toColumn.cards = []
        toColumn.cards.push({
          ...cardToMove,
          column_id: payload.toColumnId,
          position: newPosition,
        })
      }
    }
  } catch (error) {
    console.error('Error moving card:', error)
    errorMessage.value = 'Failed to move card. Please try again.'
    loadBoard()
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.kanban-board {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
.kanban-board-columns {
  align-items: flex-start;
  gap: 0.5rem;
  padding-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
