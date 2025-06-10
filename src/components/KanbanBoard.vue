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

        <div v-if="store.isLoading.value" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="store.errorMessage.value" class="d-flex justify-center my-8">
          <v-alert type="error" class="ma-0">
            {{ store.errorMessage.value }}
            <v-btn class="ms-2" variant="text" @click="store.loadBoard">Retry</v-btn>
          </v-alert>
        </div>

        <div v-else class="kanban-board-columns d-flex">
          <KanbanColumn
            v-for="column in store.board.columns"
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
      v-model="dialog.state.show"
      :is-edit-mode="dialog.state.isEditMode"
      :card-data="dialog.state.cardData"
      :initial-column-id="dialog.state.targetColumnId"
      :available-columns="store.board.columns"
      @save-card="handleSaveCard"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import CardDialog from '@/components/CardDialog.vue'
import { useKanbanStore } from '@/composables/useKanbanStore'
import { useCardDialog } from '@/composables/useCardDialog'
import type { KanbanCard } from '@/types/kanban'

const store = useKanbanStore()
const dialog = useCardDialog()

onMounted(() => {
  store.loadBoard()
})

const openAddCardDialog = (columnId: string | null) => {
  const firstColumnId = store.board.columns.length > 0 ? store.board.columns[0].id : null
  dialog.openForCreate(columnId || firstColumnId)
}

const openEditCardDialog = (cardId: string) => {
  const result = store.findCardAndColumn(cardId)
  if (result) {
    dialog.openForEdit(result.card, result.column.id)
  }
}

const handleSaveCard = async (payload: {
  card: Partial<KanbanCard> & { title: string; description: string }
  targetColumnId: string
  originalCardId?: string
}) => {
  if (payload.originalCardId) {
    await store.updateCard({
      id: payload.originalCardId,
      title: payload.card.title,
      description: payload.card.description,
      columnId: payload.targetColumnId,
    })
  } else {
    await store.createCard({
      title: payload.card.title,
      description: payload.card.description,
      columnId: payload.targetColumnId,
    })
  }
  dialog.close()
}

const handleDeleteCard = async (cardId: string) => {
  await store.deleteCard(cardId)
}

const handleCardMoved = async (payload: {
  cardId: string
  fromColumnId: string
  toColumnId: string
}) => {
  await store.moveCard(payload)
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
