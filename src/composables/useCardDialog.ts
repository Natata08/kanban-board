import { reactive } from 'vue'
import type { KanbanCard } from '@/types/kanban'

const state = reactive({
  show: false,
  isEditMode: false,
  cardData: null as KanbanCard | null,
  targetColumnId: null as string | null,
})

export function useCardDialog() {
  const openForCreate = (columnId: string | null) => {
    state.show = true
    state.isEditMode = false
    state.cardData = null
    state.targetColumnId = columnId
  }

  const openForEdit = (card: KanbanCard, columnId: string) => {
    state.show = true
    state.isEditMode = true
    state.cardData = { ...card }
    state.targetColumnId = columnId
  }

  const close = () => {
    state.show = false
    // Reset state for next use
    state.isEditMode = false
    state.cardData = null
    state.targetColumnId = null
  }

  return {
    state,
    openForCreate,
    openForEdit,
    close,
  }
}
