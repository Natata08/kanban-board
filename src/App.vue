<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
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
