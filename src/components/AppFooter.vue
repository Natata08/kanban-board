<template>
  <v-footer app color="surface" border class="bg-dark text-center">
    <v-container class="pa-0">
      <div class="d-flex justify-center">
        <v-btn
          icon
          size="small"
          variant="text"
          href="https://github.com/Natata08"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          class="mx-1"
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
          class="mx-1"
        >
          <v-icon>mdi-linkedin</v-icon>
        </v-btn>
      </div>

      <div class="text-caption mt-1">
        <span>&copy; {{ new Date().getFullYear() }} Kanban Board</span>
      </div>

      <div class="text-caption pb-1 mt-1">
        <span>Built with Vue 3, TypeScript and Vuetify</span>
      </div>
    </v-container>
  </v-footer>
</template>
