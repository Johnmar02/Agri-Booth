import { createRouter, createWebHistory } from 'vue-router';
import { useAdminController } from '@/controllers/useAdminController';
import BoothView from '@/views/BoothView.vue';
import AdminLoginView from '@/views/AdminLoginView.vue';
import AdminRouteView from '@/views/AdminRouteView.vue';

const routes = [
  {
    path: '/',
    name: 'Booth',
    component: BoothView
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminRouteView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const admin = useAdminController();

  if (to.meta.requiresAuth && !admin.isAuthenticated.value) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    return;
  }

  if (to.name === 'AdminLogin' && admin.isAuthenticated.value) {
    next({ name: 'AdminDashboard' });
    return;
  }

  next();
});

export default router;
