import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Páginas públicas
    { path: '/', name: 'home', component: () => import('../views/public/HomeView.vue') },
    { path: '/news', name: 'news', component: () => import('../views/public/NewsView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/public/AboutView.vue') },
    { path: '/try', name: 'try', component: () => import('../views/public/TryNowView.vue') },

    // Votante
    {
      path: '/votar',
      name: 'votar',
      component: () => import('../views/voter/VoterView.vue'),
    },

    // Admin — protegidas (guard se agrega en siguiente fase)
    {
      path: '/admin',
      name: 'dashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAuth: true },
    },

    // 404
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

// Navigation guard — protege rutas admin
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('admin_token')) {
    return { name: 'home' };
  }
});

export default router;