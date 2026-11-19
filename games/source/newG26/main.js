import Vue from 'vue'
import App from './src/App.vue'
import i18nPlugin from './src/i18n.js'
import './src/styles/global.css'

Vue.config.productionTip = false
Vue.use(i18nPlugin)

new Vue({ render: h => h(App) }).$mount('#app')
