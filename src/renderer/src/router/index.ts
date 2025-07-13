import { createRouter, createWebHashHistory } from 'vue-router'
import InitializationPage from '../views/InitializationPage.vue'
import MainApp from '../views/MainApp.vue'

const routes = [
  {
    path: '/',
    name: 'initialization',
    component: InitializationPage
  },
  {
    path: '/main',
    name: 'main',
    component: MainApp
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
