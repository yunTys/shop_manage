import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 引入全局样式
import './assets/css/global.css'

// 引入字体图标
import './assets/fonts/iconfont.css'

// 引入 vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置 axios 请求拦截器添加 token，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须返回 config
  return config
})

Vue.prototype.$axios = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
