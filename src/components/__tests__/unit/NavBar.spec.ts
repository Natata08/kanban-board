import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResizeObserver from 'resize-observer-polyfill'
import NavBar from '../../NavBar.vue'

const vuetify = createVuetify({ components, directives })
global.ResizeObserver = ResizeObserver

describe('NavBar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NavBar>>

  beforeEach(() => {
    const parentWrapper = mount(
      {
        template: '<v-layout><v-app><NavBar /></v-app></v-layout>',
        components: {
          NavBar,
        },
      },
      {
        global: {
          plugins: [vuetify],
        },
      },
    )
    wrapper = parentWrapper.findComponent(NavBar)
  })

  it('renders with correct title', () => {
    expect(wrapper.text()).toContain('Kanban Board')
  })

  it('emits theme-change event when toggle theme button is clicked', async () => {
    const themeButton = wrapper.find('[aria-label="Toggle theme"]')

    await themeButton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('theme-change')
    expect(wrapper.emitted('theme-change')).toHaveLength(1)
  })
})
