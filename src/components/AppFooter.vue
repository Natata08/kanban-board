<template>
  <v-footer app color="surface" border class="bg-dark text-center d-flex flex-column py-5 ga-2">
    <div class="d-flex justify-center">
      <v-btn
        icon
        size="small"
        variant="text"
        href="https://github.com/Natata08"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub Profile"
      >
        <v-icon>mdi-github</v-icon>
      </v-btn>
      <v-btn
        icon
        size="small"
        variant="text"
        href="https://www.linkedin.com/in/natalia-lapina/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn Profile"
      >
        <v-icon>mdi-linkedin</v-icon>
      </v-btn>
    </div>
    <div class="d-flex justify-center">
      <span>&copy; {{ new Date().getFullYear() }} Kanban Board</span>
    </div>

    <div>
      <span>Built with Vue 3, TypeScript and Vuetify</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts"></script>
