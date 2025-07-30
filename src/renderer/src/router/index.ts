import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import InitializationPage from '../views/InitializationPage.vue'
import MainApp from '../views/MainApp.vue'

// Lazy load page components for better performance
const Dashboard = () => import('../views/Dashboard.vue')
const ReportCenter = () => import('../views/ReportCenter.vue')
const ReportDetail = () => import('../views/ReportDetail.vue')
const ReportHistory = () => import('../views/ReportHistory.vue')
const Settings = () => import('../views/Settings.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'initialization',
    component: InitializationPage,
    meta: {
      title: 'EchoSoul 初始化',
      requiresAuth: false
    }
  },

  {
    path: '/main',
    name: 'main',
    component: MainApp,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: { title: '仪表板' }
      },
      {
        path: 'reports',
        name: 'report-center',
        component: ReportCenter,
        meta: { title: '报告中心' }
      },
      {
        path: 'report/:id',
        name: 'report-detail',
        component: ReportDetail,
        meta: { title: '报告详情' },
        props: true
      },
      {
        path: 'history',
        name: 'report-history',
        component: ReportHistory,
        meta: { title: '历史报告' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
        meta: { title: '设置' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/main'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation guard for initialization check
router.beforeEach(async (_to, _from, next) => {
  // TODO: Implement initialization status check
  // const isInitialized = await checkInitializationStatus()

  // if (!isInitialized && to.path !== '/') {
  //   next('/')
  //   return
  // }

  // if (isInitialized && to.path === '/') {
  //   next('/main')
  //   return
  // }

  next()
})

export default router
