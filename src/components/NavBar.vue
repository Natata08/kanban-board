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
        icon="mdi-brightness-6"
        variant="text"
        @click="toggleTheme"
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
        <v-list-item prepend-icon="mdi-brightness-6" @click="toggleTheme" title="Toggle Theme" />
        <v-list-item
          prepend-icon="mdi-information-outline"
          @click="showInfo = true"
          title="About"
        />
      </v-list>
    </v-menu>

    <v-dialog v-model="showInfo" max-width="500">
      <v-card>
        <v-card-title>About Kanban Board</v-card-title>
        <v-card-text>
          <p>
            This is a simple kanban board application built with Vue 3, TypeScript, and Vuetify.
          </p>
          <p class="mt-2">Features:</p>
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-pencil" size="small" class="me-2" color="primary" />
              </template>
              Create, edit, and delete cards
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-drag" size="small" class="me-2" color="primary" />
              </template>
              Drag and drop cards between columns
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-database" size="small" class="me-2" color="primary" />
              </template>
              Data persistence using localStorage
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-responsive" size="small" class="me-2" color="primary" />
              </template>
              Responsive design for all screen sizes
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="showInfo = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'theme-change', isDark: boolean): void
}>()

const showInfo = ref(false)
const menu = ref(false)

const toggleTheme = () => {
  emit('theme-change', true)
  menu.value = false
}
</script>

<style scoped></style>
