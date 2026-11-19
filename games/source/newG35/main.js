import Vue from 'vue'
import App from './src/App.vue'
import './src/i18n.js'   // 导出 i18nMixin；嵌入路由时由各组件局部挂载

Vue.config.productionTip = false
new Vue({ render: h => h(App) }).$mount('#app')
