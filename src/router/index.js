import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: () => import('@/components/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('@/components/Welcome.vue')
      },
      {
        path: '/users',
        component: () => import('@/components/users/Users.vue')
      },
      {
        path: '/rights',
        component: () => import('@/components/power/Rights.vue')
      },
      {
        path: '/roles',
        component: () => import('@/components/power/Roles.vue')
      },
      {
        path: '/categories',
        component: () => import('@/components/goods/Categories.vue')
      },
      {
        path: '/params',
        component: () => import('@/components/goods/Params.vue')
      },
      {
        path: '/goods',
        component: () => import('@/components/goods/Goods.vue')
      },
      {
        path: '/goods/add',
        component: () => import('@/components/goods/Add.vue')
      },
      {
        path: '/orders',
        component: () => import('@/components/orders/Orders.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next 回调函数，表示放行
  //    next() 直接放行    next('/login') 强制跳转
  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
