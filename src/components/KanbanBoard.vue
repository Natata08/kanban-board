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
import { reactive } from 'vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import CardDialog from '@/components/CardDialog.vue'
import type { KanbanBoard, KanbanCard, KanbanColumn as KanbanColumnType } from '@/types/kanban'

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const board = reactive<KanbanBoard>({
  columns: [
    {
      id: generateId(),
      title: 'To Do',
      cards: [
        {
          id: generateId(),
          title: 'Task 1',
          description: 'Description for task 1',
          createdAt: new Date(),
        },
        {
          id: generateId(),
          title: 'Task 2',
          description: 'Description for task 2',
          createdAt: new Date(),
        },
      ],
    },
    {
      id: generateId(),
      title: 'In Progress',
      cards: [],
    },
    {
      id: generateId(),
      title: 'Review',
      cards: [
        {
          id: generateId(),
          title: 'Task 3',
          description: 'Description for task 3',
          createdAt: new Date(),
        },
      ],
    },
    {
      id: generateId(),
      title: 'Done',
      cards: [],
    },
  ],
})

const cardDialogDefaultState = {
  show: false,
  isEditMode: false,
  cardData: null as KanbanCard | null,
  targetColumnId: null as string | null,
}
const cardDialog = reactive({ ...cardDialogDefaultState })

const findCardAndColumn = (
  cardId: string,
): { card: KanbanCard; column: KanbanColumnType } | null => {
  for (const column of board.columns) {
    const card = column.cards.find((c) => c.id === cardId)
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

const handleSaveCard = (payload: {
  card: Partial<KanbanCard> & { title: string; description: string }
  targetColumnId: string
  originalCardId?: string
}) => {
  if (payload.originalCardId) {
    const result = findCardAndColumn(payload.originalCardId)
    if (result) {
      result.card.title = payload.card.title
      result.card.description = payload.card.description
      result.card.updatedAt = new Date()

      if (result.column.id !== payload.targetColumnId) {
        const cardIndex = result.column.cards.findIndex((c) => c.id === payload.originalCardId)
        if (cardIndex !== -1) {
          const [movedCard] = result.column.cards.splice(cardIndex, 1)

          const targetColumn = board.columns.find((col) => col.id === payload.targetColumnId)
          if (targetColumn) {
            targetColumn.cards.push(movedCard)
          }
        }
      }
    }
  } else {
    const targetColumn = board.columns.find((col) => col.id === payload.targetColumnId)
    if (targetColumn) {
      const newCard: KanbanCard = {
        id: generateId(),
        title: payload.card.title,
        description: payload.card.description,
        createdAt: new Date(),
      }
      targetColumn.cards.push(newCard)
    }
  }
  closeCardDialog()
}

const handleDeleteCard = (cardId: string) => {
  const result = findCardAndColumn(cardId)
  if (result) {
    result.column.cards = result.column.cards.filter((c) => c.id !== cardId)
  }
}

const handleCardMoved = (payload: { cardId: string; fromColumnId: string; toColumnId: string }) => {
  const fromColumn = board.columns.find((col) => col.id === payload.fromColumnId)
  const toColumn = board.columns.find((col) => col.id === payload.toColumnId)

  if (fromColumn && toColumn) {
    const cardIndex = fromColumn.cards.findIndex((c) => c.id === payload.cardId)
    if (cardIndex > -1) {
      const [cardToMove] = fromColumn.cards.splice(cardIndex, 1)
      toColumn.cards.push(cardToMove)
    }
  }
}
</script>

<style scoped>
.kanban-board {
  height: 100%;
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
