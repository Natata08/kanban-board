// Database types
export interface KanbanColumn {
  id: string
  title: string
  position: number
  cards?: KanbanCard[]
  created_at?: string
  updated_at?: string
}

export interface KanbanCard {
  id: string
  title: string
  description: string
  column_id: string
  position: number
  created_at?: string
  updated_at?: string
}

// Local types used during data manipulation
export interface KanbanBoard {
  columns: KanbanColumn[]
}

export interface CardCreationPayload {
  title: string
  description: string
  column_id: string
  position: number
}

export interface CardUpdatePayload {
  id: string
  title?: string
  description?: string
  column_id?: string
  position?: number
}

export interface DragDropPayload {
  cardId: string
  fromColumnId: string
  toColumnId: string
  newPosition?: number
}
