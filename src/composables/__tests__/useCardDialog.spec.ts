import { describe, it, expect, beforeEach } from 'vitest'
import { useCardDialog } from '../useCardDialog'
import type { KanbanCard } from '@/types/kanban'

describe('useCardDialog', () => {
  beforeEach(() => {
    const { close, state } = useCardDialog()
    if (state.show) {
      close()
    }
  })

  it('initializes with correct default state', () => {
    const { state } = useCardDialog()
    expect(state.show).toBe(false)
    expect(state.isEditMode).toBe(false)
    expect(state.cardData).toBeNull()
    expect(state.targetColumnId).toBeNull()
  })

  it('openForCreate sets state correctly', () => {
    const { state, openForCreate } = useCardDialog()
    const testColumnId = 'col1'
    openForCreate(testColumnId)

    expect(state.show).toBe(true)
    expect(state.isEditMode).toBe(false)
    expect(state.cardData).toBeNull()
    expect(state.targetColumnId).toBe(testColumnId)
  })

  it('openForEdit sets state correctly and copies card data', () => {
    const { state, openForEdit } = useCardDialog()
    const mockCard: KanbanCard = {
      id: 'card1',
      title: 'Test Card',
      description: 'Test Desc',
      position: 0,
      column_id: 'col1',
    }
    const testColumnId = 'col1'
    openForEdit(mockCard, testColumnId)

    expect(state.show).toBe(true)
    expect(state.isEditMode).toBe(true)
    expect(state.cardData).toEqual(mockCard)
    expect(state.cardData).not.toBe(mockCard)
    expect(state.targetColumnId).toBe(testColumnId)
  })

  it('close resets state correctly after openForCreate', () => {
    const { state, openForCreate, close } = useCardDialog()
    openForCreate('col1')
    close()

    expect(state.show).toBe(false)
    expect(state.isEditMode).toBe(false)
    expect(state.cardData).toBeNull()
    expect(state.targetColumnId).toBeNull()
  })

  it('close resets state correctly after openForEdit', () => {
    const { state, openForEdit, close } = useCardDialog()
    const mockCard: KanbanCard = {
      id: 'card1',
      title: 'Test Card',
      description: 'Test Desc',
      position: 0,
      column_id: 'col1',
    }
    openForEdit(mockCard, 'col1')
    close()

    expect(state.show).toBe(false)
    expect(state.isEditMode).toBe(false)
    expect(state.cardData).toBeNull()
    expect(state.targetColumnId).toBeNull()
  })
})
