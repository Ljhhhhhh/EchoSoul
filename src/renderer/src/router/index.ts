import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import InitializationPage from '../views/InitializationPage.vue'
import MainApp from '../views/MainApp.vue'

// Lazy load page components for better performance
const Dashboard = () => import('../views/Dashboard.vue')
const ReportCenter = () => import('../views/ReportCenter.vue')
const ReportDetail = () => import('../views/ReportDetail.vue')
const CustomReport = () => import('../views/CustomReport.vue')
const ReportHistory = () => import('../views/ReportHistory.vue')
const Settings = () => import('../views/Settings.vue')

// Settings sub-pages
const AISettings = () => import('../views/settings/AISettings.vue')
const ReportSettings = () => import('../views/settings/ReportSettings.vue')
const DataSettings = () => import('../views/settings/DataSettings.vue')
const SystemSettings = () => import('../views/settings/SystemSettings.vue')

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
        path: 'create',
        name: 'custom-report',
        component: CustomReport,
        meta: { title: '生成自定义报告' }
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
        meta: { title: '设置' },
        children: [
          {
            path: 'ai',
            name: 'ai-settings',
            component: AISettings,
            meta: { title: 'AI服务配置' }
          },
          {
            path: 'reports',
            name: 'report-settings',
            component: ReportSettings,
            meta: { title: '报告偏好' }
          },
          {
            path: 'data',
            name: 'data-settings',
            component: DataSettings,
            meta: { title: '数据管理' }
          },
          {
            path: 'system',
            name: 'system-settings',
            component: SystemSettings,
            meta: { title: '系统设置' }
          }
        ]
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
router.beforeEach(async (to, from, next) => {
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
