import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResizeObserver from 'resize-observer-polyfill'
import AppFooter from '../../AppFooter.vue'

const vuetify = createVuetify({ components, directives })
global.ResizeObserver = ResizeObserver

describe('AppFooter.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof AppFooter>>

  beforeEach(() => {
    const parentWrapper = mount(
      {
        template: '<v-layout><v-app><AppFooter /></v-app></v-layout>',
        components: {
          AppFooter,
        },
      },
      {
        global: {
          plugins: [vuetify],
        },
      },
    )
    wrapper = parentWrapper.findComponent(AppFooter)
  })

  it('renders with copyright and current year', () => {
    const currentYear = new Date().getFullYear().toString()

    expect(wrapper.text()).toContain(currentYear)
    expect(wrapper.text()).toContain('Kanban Board')
  })

  it('renders social media links', () => {
    const githubLink = wrapper.find('a[href*="github"]')
    const linkedinLink = wrapper.find('a[href*="linkedin"]')

    expect(githubLink.exists()).toBe(true)
    expect(linkedinLink.exists()).toBe(true)
  })
})
