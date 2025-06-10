<template>
  <v-container fluid class="kanban-board-view pa-4">
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary">
        <v-icon left>mdi-plus</v-icon>
        Add new task
      </v-btn>
    </div>

    <div class="kanban-board-columns d-flex">
      <KanbanColumn
        v-for="column in board.columns"
        :key="column.id"
        :column="column"
        @delete-card="handleDeleteCard"
        @card-moved="handleCardMoved"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
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
      title: 'Review',
      cards: [],
    },
    {
      id: generateId(),
      title: 'Done',
      cards: [],
    },
  ],
})

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
.kanban-board-view {
  height: 100%;
}
.kanban-board-columns {
  align-items: flex-start;
  gap: 0.5rem;
  padding-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
