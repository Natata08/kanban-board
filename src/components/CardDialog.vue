<template>
  <v-dialog :model-value="modelValue" max-width="500px" persistent @update:model-value="emitClose">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditMode ? 'Edit Card' : 'Add New Card' }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="cardFormRef" @submit.prevent="handleFormSubmit">
          <v-text-field
            v-model="formData.title"
            label="Title"
            :rules="[rules.required]"
            required
            class="mb-2"
            autofocus
          ></v-text-field>
          <v-textarea
            v-model="formData.description"
            label="Description"
            :rules="[rules.required]"
            required
            class="mb-2"
          ></v-textarea>
          <v-select
            v-model="formData.targetColumnId"
            :items="availableColumns"
            item-title="title"
            item-value="id"
            label="Column"
            :rules="[rules.required]"
            required
            class="mb-2"
          ></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" text @click="emitClose">Cancel</v-btn>
        <v-btn color="blue-darken-1" :loading="loading" text @click="handleFormSubmit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import type { KanbanCard, KanbanColumn } from '@/types/kanban'

interface FormData {
  title: string
  description: string
  targetColumnId: string | null
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  cardData?: KanbanCard | null
  initialColumnId?: string | null
  availableColumns: KanbanColumn[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'save-card',
    payload: {
      card: Partial<KanbanCard> & { title: string; description: string }
      targetColumnId: string
      originalCardId?: string
    },
  ): void
}>()

const cardFormRef = ref<InstanceType<typeof VForm> | null>(null)
const loading = ref(false)

const formData = reactive<FormData>({
  title: '',
  description: '',
  targetColumnId: null,
})

const rules = {
  required: (value: string) => !!value || 'This field is required.',
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      cardFormRef.value?.resetValidation()
      if (props.isEditMode && props.cardData) {
        formData.title = props.cardData.title
        formData.description = props.cardData.description || ''
        formData.targetColumnId = props.initialColumnId || null
      } else {
        formData.title = ''
        formData.description = ''
        formData.targetColumnId =
          props.initialColumnId ||
          (props.availableColumns.length > 0 ? props.availableColumns[0].id : null)
      }
    } else {
      loading.value = false
    }
  },
  { immediate: true },
)

const emitClose = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = async () => {
  if (!cardFormRef.value) return
  const { valid } = await cardFormRef.value.validate()

  if (valid && formData.targetColumnId) {
    loading.value = true
    const payload: {
      card: Partial<KanbanCard> & { title: string; description: string }
      targetColumnId: string
      originalCardId?: string
    } = {
      card: {
        title: formData.title,
        description: formData.description,
      },
      targetColumnId: formData.targetColumnId,
    }
    if (props.isEditMode && props.cardData) {
      payload.originalCardId = props.cardData.id
    }
    emit('save-card', payload)
  } else {
    console.warn('Form is invalid or target column not selected')
  }
}
</script>
