<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title>About Kanban Board</v-card-title>
      <v-card-text>
        <p>This is a simple kanban board application built with Vue 3, TypeScript, and Vuetify.</p>
        <p class="mt-2">Features:</p>
        <v-list density="compact" class="bg-transparent">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary" icon="mdi-check" />
            </template>
            Create and manage tasks in columns
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary" icon="mdi-check" />
            </template>
            Drag and drop cards between columns
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary" icon="mdi-check" />
            </template>
            Light and dark theme support
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => {
  emit('update:modelValue', false)
}
</script>
