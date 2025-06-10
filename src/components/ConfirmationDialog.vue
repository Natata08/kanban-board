<template>
  <v-dialog :model-value="show" max-width="500px" @update:model-value="close">
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
        <v-btn color="red-darken-1" variant="text" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useConfirmationDialog } from '@/composables/useConfirmationDialog'

const { show, title, message, close, confirm } = useConfirmationDialog()
</script>
