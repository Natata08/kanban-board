<template>
  <v-card class="kanban-card" :elevation="1" :color="cardColor" :border="true">
    <v-card-item>
      <v-card-title>{{ card.title }}</v-card-title>

      <template v-slot:append>
        <div class="d-flex">
          <v-btn
            icon="mdi-pencil-outline"
            size="x-small"
            variant="text"
            :aria-label="`Edit card: ${card.title}`"
            @click="$emit('edit', card.id)"
          />
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            :aria-label="`Delete card: ${card.title}`"
            @click="$emit('delete', card.id)"
          />
        </div>
      </template>
    </v-card-item>
    <v-divider class="mx-3 align-self-center" thickness="2"></v-divider>

    <v-card-text>
      <p v-if="card.description" class="mb-2">{{ card.description }}</p>

      <div class="text-caption text-medium-emphasis">Created: {{ formattedDate }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KanbanCard } from '../types/kanban'
import { useTheme } from 'vuetify'

const props = defineProps<{
  card: KanbanCard
}>()
defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
}>()

const formattedDate = computed(() => {
  return new Date(props.card.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const theme = useTheme()

const cardColor = computed(() => {
  if (theme.global.name.value === 'dark') {
    return 'grey-darken-3'
  }
  return 'grey-lighten-5'
})
</script>

<style scoped>
.kanban-card {
  transition: transform 0.2s ease;
  cursor: grab;
}

.kanban-card:hover {
  transform: translateY(-2px);
}

.kanban-card:active {
  cursor: grabbing;
}
</style>
