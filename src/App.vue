<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'

const handleThemeChange = (isDark: boolean) => {
  console.log('Theme changed:', isDark)
}
</script>

<template>
  <v-app>
    <NavBar @theme-change="handleThemeChange" />
    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
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
</style>
