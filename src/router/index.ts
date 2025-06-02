import { createRouter, createWebHistory } from 'vue-router'
import StockAnalysis from '@/pages/StockAnalysis.vue'
import LangChainTest from '@/pages/LangChainTest.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: StockAnalysis
    },
    {
      path: '/langchain',
      name: 'langchain',
      component: LangChainTest
    }
  ]
})

export default router 