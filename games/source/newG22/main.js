import Vue from 'vue'
import App from './src/App.vue'

Vue.config.productionTip = false
Vue.config.devtools = false

// Surface runtime errors on old browsers where devtools aren't available.
// Long-press the badge to copy the message; tap to dismiss.
if (typeof window !== 'undefined') {
  const showErr = (msg) => {
    let box = document.getElementById('__err_badge__')
    if (!box) {
      box = document.createElement('div')
      box.id = '__err_badge__'
      box.style.cssText = 'position:fixed;left:8px;bottom:8px;max-width:90vw;z-index:99999;background:#dc2626;color:#fff;font:12px/1.4 monospace;padding:8px 10px;border-radius:6px;box-shadow:0 6px 20px rgba(0,0,0,.4);white-space:pre-wrap;word-break:break-all;'
      box.onclick = () => box.remove()
      document.body.appendChild(box)
    }
    box.textContent = String(msg).slice(0, 500)
  }
  window.addEventListener('error', (e) => showErr(`[Err] ${e.message} @ ${e.filename}:${e.lineno}`))
  window.addEventListener('unhandledrejection', (e) => showErr(`[Promise] ${e.reason && e.reason.message || e.reason}`))
}

new Vue({ render: h => h(App) }).$mount('#app')

