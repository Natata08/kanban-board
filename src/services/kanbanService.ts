import { supabase } from './supabase'
import type {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  CardCreationPayload,
  CardUpdatePayload,
} from '@/types/kanban'

export const kanbanService = {
  async fetchColumns(): Promise<KanbanColumn[]> {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching columns:', error)
      throw error
    }

    return data as KanbanColumn[]
  },

  async fetchCards(columnId?: string): Promise<KanbanCard[]> {
    let query = supabase.from('cards').select('*').order('position', { ascending: true })

    if (columnId) {
      query = query.eq('column_id', columnId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cards:', error)
      throw error
    }

    return data as KanbanCard[]
  },

  async fetchCompleteBoard(): Promise<KanbanBoard> {
    const columns = await this.fetchColumns()
    const cards = await this.fetchCards()

    const cardsByColumn: Record<string, KanbanCard[]> = {}

    for (const card of cards) {
      if (!cardsByColumn[card.column_id]) {
        cardsByColumn[card.column_id] = []
      }
      cardsByColumn[card.column_id].push(card)
    }

    const columnsWithCards = columns.map((column) => ({
      ...column,
      cards: cardsByColumn[column.id] || [],
    }))

    return { columns: columnsWithCards }
  },

  async createCard(cardData: CardCreationPayload): Promise<KanbanCard> {
    const { data, error } = await supabase.from('cards').insert([cardData]).select().single()

    if (error) {
      console.error('Error creating card:', error)
      throw error
    }

    return data as KanbanCard
  },

  async updateCard(id: string, updates: CardUpdatePayload): Promise<void> {
    const { error } = await supabase.from('cards').update(updates).eq('id', id)

    if (error) {
      console.error('Error updating card:', error)
      throw error
    }
  },

  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase.from('cards').delete().eq('id', id)

    if (error) {
      console.error('Error deleting card:', error)
      throw error
    }
  },

  async moveCard(cardId: string, toColumnId: string, newPosition: number): Promise<void> {
    const { error: updateError } = await supabase
      .from('cards')
      .update({ column_id: toColumnId, position: newPosition })
      .eq('id', cardId)

    if (updateError) {
      console.error('Error moving card:', updateError)
      throw updateError
    }
  },
}
