<template>
  <v-app-bar :elevation="1">
    <v-app-bar-title class="text-h6 text-md-h5">
      <div class="d-flex align-center">
        <IconKanban class="me-2" :width="24" :height="24" aria-hidden="true" />
        <span>Kanban Board</span>
      </div>
    </v-app-bar-title>

    <v-spacer />

    <div class="d-none d-md-flex">
      <v-btn
        :icon="themeIcon"
        variant="text"
        @click="toggleThemeWithEmit"
        aria-label="Toggle theme"
      />
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        @click="showInfo = true"
        aria-label="Information"
      />
    </div>

    <v-menu v-model="menu">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="d-md-none">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item :prepend-icon="themeIcon" @click="toggleThemeWithEmit" title="Toggle Theme" />
        <v-list-item
          prepend-icon="mdi-information-outline"
          @click="showInfo = true"
          title="About"
        />
      </v-list>
    </v-menu>

    <AboutDialog v-model="showInfo" />
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeManager } from '../composables/useTheme'
import IconKanban from './icons/IconKanban.vue'
import AboutDialog from './AboutDialog.vue'

const menu = ref(false)
const showInfo = ref(false)

const { toggleTheme, isDark } = useThemeManager()

const themeIcon = computed(() => (isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'))

const emit = defineEmits<{
  (e: 'theme-change', value: boolean): void
}>()

function toggleThemeWithEmit() {
  toggleTheme()
  emit('theme-change', isDark.value)
}
</script>
