import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResizeObserver from 'resize-observer-polyfill'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'
import KanbanColumn from '../../KanbanColumn.vue'
import KanbanCard from '../../KanbanCard.vue'
import type { KanbanColumn as KanbanColumnType } from '../../../types/kanban'

const vuetify = createVuetify({ components, directives })
global.ResizeObserver = ResizeObserver

describe('KanbanColumn.vue', () => {
  const mockColumn: KanbanColumnType = {
    id: 'col-1',
    title: 'To Do',
    position: 0,
    cards: [
      { id: 'card-1', title: 'Task 1', description: 'Desc 1', column_id: 'col-1', position: 0 },
      { id: 'card-2', title: 'Task 2', description: 'Desc 2', column_id: 'col-1', position: 1 },
    ],
  }

  const wrapper = mount(KanbanColumn, {
    props: {
      column: mockColumn,
    },
    global: {
      plugins: [vuetify],
      stubs: {
        KanbanCard: true,
      },
    },
  })

  it('renders the column title correctly', () => {
    const titleElement = wrapper.find('[data-testid="column-title"]')
    expect(titleElement.text()).toBe(mockColumn.title)
  })

  it('renders the correct number of KanbanCard components', () => {
    const cards = wrapper.findAllComponents(KanbanCard)
    expect(cards).toHaveLength(mockColumn.cards?.length || 0)
  })

  it('emits an "add-card" event with the column ID when the add button is clicked', async () => {
    await wrapper.find('[data-testid="add-card-button"]').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('add-card')
    expect(wrapper.emitted()['add-card'][0]).toEqual([mockColumn.id])
  })
})
