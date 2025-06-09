import { createRouter, createWebHistory } from 'vue-router'
import KanbanBoardView from '../views/KanbanBoardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'kanban',
      component: KanbanBoardView,
    },
  ],
})

export default router
