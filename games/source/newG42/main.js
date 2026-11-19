import Vue from 'vue'
import App from './src/App.vue'
import './src/styles/global.css'

Vue.config.productionTip = false

// Track real viewport height on tablet/mobile browsers where 100vh
// includes hidden URL bars. Exposes CSS var --app-h.
function updateAppH() {
  const vv = window.visualViewport
  const h = vv ? vv.height : window.innerHeight
  document.documentElement.style.setProperty('--app-h', h + 'px')
}
updateAppH()
window.addEventListener('resize', updateAppH)
window.addEventListener('orientationchange', updateAppH)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateAppH)
  window.visualViewport.addEventListener('scroll', updateAppH)
}

new Vue({ render: h => h(App) }).$mount('#app')
