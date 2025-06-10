<template>
  <v-card class="kanban-column" :elevation="1" :border="true">
    <v-card-title class="column-title d-flex justify-space-between align-center">
      <span class="text-primary">{{ column.title }}</span>
      <v-chip size="small">{{ column.cards?.length || 0 }}</v-chip>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="column-content">
      <div class="cards-container" @dragover.prevent @drop.prevent="handleDrop">
        <KanbanCard
          v-for="card in column.cards || []"
          :key="card.id"
          :card="card"
          draggable="true"
          @dragstart="handleDragStart($event, card.id, column.id)"
          @edit="emitEdit"
          @delete="emitDelete"
          class="mb-3"
        />
        <div
          v-if="!(column.cards && column.cards.length)"
          class="empty-column-message text-center text-disabled pa-4"
        >
          No cards in this column.
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { KanbanColumn } from '../types/kanban'
import KanbanCard from './KanbanCard.vue'

const props = defineProps<{
  column: KanbanColumn
}>()

const emit = defineEmits<{
  (e: 'edit-card', cardId: string): void
  (e: 'delete-card', cardId: string): void
  (e: 'card-moved', payload: { cardId: string; fromColumnId: string; toColumnId: string }): void
  (e: 'add-card', columnId: string): void
}>()

const emitEdit = (cardId: string) => {
  emit('edit-card', cardId)
}

const emitDelete = (cardId: string) => {
  emit('delete-card', cardId)
}

const handleDragStart = (event: DragEvent, cardId: string, fromColumnId: string) => {
  event.dataTransfer?.setData('text/plain', JSON.stringify({ cardId, fromColumnId }))
}

const handleDrop = (event: DragEvent) => {
  const data = event.dataTransfer?.getData('text/plain')
  if (data) {
    const { cardId, fromColumnId } = JSON.parse(data)
    const toColumnId = props.column.id
    if (fromColumnId !== toColumnId) {
      emit('card-moved', { cardId, fromColumnId, toColumnId })
    }
  }
}
</script>

<style scoped>
.kanban-column {
  width: 100%;
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 9.375rem);
  flex-grow: 1;
  flex-shrink: 0;
  min-width: 0;
}

@media (min-width: 600px) {
  .kanban-column {
    width: 18rem;
    min-width: 18rem;
    margin: 0 0.5rem;
    flex-grow: 0;
  }
}

.column-title {
  padding: 1rem;
}

.column-content {
  padding: 0.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.cards-container {
  min-height: 6.25rem;
}

.empty-column-message {
  font-style: italic;
}
</style>
