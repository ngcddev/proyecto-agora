// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
  routes: [
    // ── Páginas públicas ────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/public/AboutView.vue'),
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/public/NewsView.vue'),
    },
    {
      path: '/try',
      name: 'try',
      component: () => import('@/views/public/TryNowView.vue'),
    },

    // ── Votante ─────────────────────────────────────────
    {
      path: '/votar',
      name: 'votar',
      component: () => import('@/views/voter/VoterView.vue'),
    },

    // ── Admin — login ────────────────────────────────────
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginView.vue'),
      // Si ya está autenticado, redirige al dashboard
      beforeEnter: () => {
        const auth = useAuthStore()
        if (auth.isAuthenticated) return { name: 'dashboard' }
      },
    },

    // ── Admin — dashboard (protegido) ───────────────────
    {
      path: '/admin',
      name: 'dashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { requiresAuth: true },
    },

    // ── 404 ─────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ── Navigation guard global ─────────────────────────────
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
  }
})

export default router