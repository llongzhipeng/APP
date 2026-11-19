import Vue from 'vue'
import App from './src/App.vue'
import './src/styles/main.css'

Vue.config.productionTip = false
new Vue({ render: h => h(App) }).$mount('#app')
