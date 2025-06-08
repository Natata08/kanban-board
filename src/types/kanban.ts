export interface KanbanCard {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt?: Date
}
export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
}
export interface KanbanBoard {
  columns: KanbanColumn[]
}
