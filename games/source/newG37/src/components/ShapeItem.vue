<template>
  <svg :viewBox="'0 0 100 100'" class="shape-svg" :style="{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.25))' }">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   :stop-color="light"/>
        <stop offset="100%" :stop-color="dark"/>
      </linearGradient>
      <linearGradient :id="gid+'-hl'" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="rgba(255,255,255,.55)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <g v-if="shape==='circle'"><circle cx="50" cy="50" r="42" :fill="`url(#${gid})`"/><ellipse cx="50" cy="34" rx="28" ry="12" :fill="`url(#${gid}-hl)`"/></g>
    <g v-else-if="shape==='square'"><rect x="10" y="10" width="80" height="80" rx="12" :fill="`url(#${gid})`"/><rect x="14" y="14" width="72" height="30" rx="8" :fill="`url(#${gid}-hl)`"/></g>
    <g v-else-if="shape==='triangle'"><polygon points="50,8 92,88 8,88" :fill="`url(#${gid})`"/><polygon points="50,20 78,72 22,72" fill="rgba(255,255,255,.18)"/></g>
    <g v-else-if="shape==='diamond'"><polygon points="50,6 94,50 50,94 6,50" :fill="`url(#${gid})`"/><polygon points="50,14 84,50 50,52 16,50" fill="rgba(255,255,255,.22)"/></g>
    <g v-else-if="shape==='star'"><polygon points="50,6 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38" :fill="`url(#${gid})`"/></g>
    <g v-else-if="shape==='hexagon'"><polygon points="50,6 90,28 90,72 50,94 10,72 10,28" :fill="`url(#${gid})`"/><polygon points="50,14 82,32 82,52 50,52 18,52 18,32" fill="rgba(255,255,255,.2)"/></g>
  </svg>
</template>

<script>
let uid = 0
export default {
  name: 'ShapeItem',
  props: {
    shape: { type: String, default: 'circle' },
    color: { type: String, default: '#1890ff' }
  },
  data() { return { gid: 'g' + (++uid) } },
  computed: {
    light() { return this.lighten(this.color, 0.25) },
    dark()  { return this.darken(this.color, 0.25) }
  },
  methods: {
    hex2rgb(hex) {
      const s = hex.replace('#','')
      const v = s.length === 3 ? s.split('').map(c=>c+c).join('') : s
      const n = parseInt(v, 16)
      return [ (n>>16)&255, (n>>8)&255, n&255 ]
    },
    rgb2hex(r,g,b) { return '#' + [r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('') },
    lighten(hex, k) { const [r,g,b] = this.hex2rgb(hex); return this.rgb2hex(r+(255-r)*k, g+(255-g)*k, b+(255-b)*k) },
    darken(hex, k)  { const [r,g,b] = this.hex2rgb(hex); return this.rgb2hex(r*(1-k), g*(1-k), b*(1-k)) }
  }
}
</script>

<style scoped>
.shape-svg { width: 100%; height: 100%; display: block; }
</style>
