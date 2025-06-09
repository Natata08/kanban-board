<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <v-app>
    <NavBar />
    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style>
html,
body {
  overflow-y: auto;
}

.v-application {
  font-family: 'Roboto', sans-serif;
}

.v-application {
  transition: background-color 0.3s ease;
}

.theme--dark .v-application {
  background-color: var(--v-background-base);
}

.theme--light .v-application {
  background-color: var(--v-background-base);
}
</style>
