import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfirmationDialog } from '../useConfirmationDialog'

describe('useConfirmationDialog', () => {
  beforeEach(() => {
    const { close, show: showRef } = useConfirmationDialog()
    if (showRef.value) {
      close()
    }
  })

  it('initializes with correct default state', () => {
    const { show, title, message } = useConfirmationDialog()
    expect(show.value).toBe(false)
    expect(title.value).toBe('')
    expect(message.value).toBe('')
  })

  it('open sets state correctly and stores callback', () => {
    const { show, title, message, open } = useConfirmationDialog()
    const mockOnConfirm = vi.fn()
    const testTitle = 'Test Title'
    const testMessage = 'Test Message'

    open(testTitle, testMessage, mockOnConfirm)

    expect(show.value).toBe(true)
    expect(title.value).toBe(testTitle)
    expect(message.value).toBe(testMessage)
  })

  it('close resets state correctly', () => {
    const { show, title, message, open, close: closeDialog } = useConfirmationDialog()
    const mockOnConfirm = vi.fn()
    open('Test', 'Msg', mockOnConfirm)

    closeDialog()

    expect(show.value).toBe(false)
    expect(title.value).toBe('')
    expect(message.value).toBe('')
  })

  it('confirm executes callback and closes dialog', () => {
    const { show, title, message, open, confirm } = useConfirmationDialog()
    const mockOnConfirm = vi.fn()
    const testTitle = 'Confirm Title'
    const testMessage = 'Confirm Message'

    open(testTitle, testMessage, mockOnConfirm)
    confirm()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(show.value).toBe(false)
    expect(title.value).toBe('')
    expect(message.value).toBe('')
  })

  it('confirm does not throw if callback is null and closes dialog', () => {
    const { open, close: closeDialog } = useConfirmationDialog()
    open('Test', 'Msg', vi.fn())
    closeDialog()

    const { confirm: confirmAgain, show: showAgain } = useConfirmationDialog()
    showAgain.value = true

    expect(() => confirmAgain()).not.toThrow()
    expect(showAgain.value).toBe(false)
  })
})
