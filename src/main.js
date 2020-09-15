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

// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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

// 注册富文本编辑器为全局可用组件
Vue.use(VueQuillEditor)

// 全局事件过滤器
Vue.filter('dateFormat', function(time) {
  var date = new Date(time * 1000)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')

  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
