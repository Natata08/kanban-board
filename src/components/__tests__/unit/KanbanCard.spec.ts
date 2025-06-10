import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanCard from '../../KanbanCard.vue'
import type { KanbanCard as KanbanCardType } from '../../../types/kanban'
import ResizeObserver from 'resize-observer-polyfill'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({ components, directives })
global.ResizeObserver = ResizeObserver

describe('KanbanCard.vue', () => {
  const mockCard: KanbanCardType = {
    id: 'card-123',
    title: 'Test Card Title',
    description: 'A description for the test card.',
    column_id: 'col-abc',
    position: 1,
    created_at: new Date().toISOString(),
  }

  const wrapper = mount(KanbanCard, {
    props: {
      card: mockCard,
    },
    global: {
      plugins: [vuetify],
    },
  })

  it('renders card title and description', () => {
    expect(wrapper.text()).toContain(mockCard.title)
    expect(wrapper.text()).toContain(mockCard.description)
  })

  it('emits a "delete" event with the card ID when the delete button is clicked', async () => {
    await wrapper.find('[data-testid="delete-button"]').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('delete')
    expect(wrapper.emitted().delete[0]).toEqual([mockCard.id])
  })

  it('emits an "edit" event with the card ID when the edit button is clicked', async () => {
    await wrapper.find('[data-testid="edit-button"]').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('edit')
    expect(wrapper.emitted().edit[0]).toEqual([mockCard.id])
  })
})
