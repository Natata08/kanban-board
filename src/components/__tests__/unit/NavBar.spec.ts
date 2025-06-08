import { mount } from '@vue/test-utils'
import { expect, describe, it } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResizeObserver from 'resize-observer-polyfill'
import NavBar from '../../NavBar.vue'

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = ResizeObserver

describe('NavBar.vue', () => {
  it('renders with correct title', () => {
    const wrapper = mount(
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

    expect(wrapper.text()).toContain('Kanban Board')
  })

  it('emits theme-change event when toggle theme button is clicked', async () => {
    const wrapper = mount(
      {
        template: '<v-layout><v-app><NavBar @theme-change="themeChanged" /></v-app></v-layout>',
        components: {
          NavBar,
        },
        methods: {
          themeChanged() {
            this.$emit('theme-change-triggered')
          },
        },
      },
      {
        global: {
          plugins: [vuetify],
        },
      },
    )

    const themeButton = wrapper.find('[aria-label="Toggle theme"]')
    await themeButton.trigger('click')

    expect(wrapper.findComponent(NavBar).emitted('theme-change')).toBeTruthy()
  })
})
