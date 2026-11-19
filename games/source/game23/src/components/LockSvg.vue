<template>
  <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;overflow:visible" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient :id="gradBodyId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d24a26"/>
        <stop offset="0.5" stop-color="#a8341a"/>
        <stop offset="1" stop-color="#6b1d0c"/>
      </linearGradient>
      <linearGradient :id="gradShackleId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e8e8ec"/>
        <stop offset="0.45" stop-color="#a8a8b0"/>
        <stop offset="1" stop-color="#5c5c66"/>
      </linearGradient>
      <radialGradient :id="gradHoleId" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stop-color="#1a0a05"/>
        <stop offset="1" stop-color="#000"/>
      </radialGradient>
      <mask :id="maskId">
        <rect :x="bodyX" :y="bodyY" :width="bodyW" :height="bodyH" :rx="bodyR" :ry="bodyR" fill="white"/>
        <g v-if="!hidden">
          <g v-for="(shape, i) in parts" :key="i" fill="black">
            <circle  v-if="shape === 'circle'"   :cx="W/2" :cy="slotY(i)" :r="slotR"/>
            <rect    v-else-if="shape === 'square'"
              :x="W/2 - slotR" :y="slotY(i) - slotR" :width="slotR * 2" :height="slotR * 2" rx="3"/>
            <rect    v-else-if="shape === 'rect'"
              :x="W/2 - slotR * 1.15" :y="slotY(i) - slotR * 0.65"
              :width="slotR * 2.3" :height="slotR * 1.3" rx="3"/>
            <polygon v-else-if="shape === 'triangle'" :points="poly(i,'triangle')"/>
            <polygon v-else-if="shape === 'quad'"     :points="poly(i,'quad')"/>
            <polygon v-else-if="shape === 'diamond'"  :points="poly(i,'diamond')"/>
            <polygon v-else-if="shape === 'star'"     :points="poly(i,'star')"/>
            <polygon v-else-if="shape === 'hex'"      :points="poly(i,'hex')"/>
            <polygon v-else-if="shape === 'oct'"      :points="poly(i,'oct')"/>
          </g>
        </g>
        <!-- Question mark when hidden -->
        <text v-else
          :x="W/2" :y="bodyY + bodyH/2 + bodyH * 0.18"
          text-anchor="middle"
          :font-size="bodyH * 0.7"
          font-family="'Arial Black', sans-serif"
          font-weight="900"
          fill="black">?</text>
      </mask>
    </defs>

    <g class="shackle" :transform="shackleTransform">
      <path :d="shacklePath" fill="none" :stroke="`url(#${gradShackleId})`" :stroke-width="shackleW" stroke-linecap="round"/>
      <path :d="shacklePath" fill="none" stroke="rgba(255,255,255,0.4)" :stroke-width="shackleW * 0.18" stroke-linecap="round" :stroke-dasharray="`${shackleW * 0.5} ${shackleW * 5}`"/>
    </g>

    <rect :x="bodyX" :y="bodyY" :width="bodyW" :height="bodyH" :rx="bodyR" :ry="bodyR" :fill="`url(#${gradHoleId})`"/>

    <g :mask="`url(#${maskId})`">
      <rect :x="bodyX" :y="bodyY" :width="bodyW" :height="bodyH" :rx="bodyR" :ry="bodyR" :fill="`url(#${gradBodyId})`"/>
      <rect :x="bodyX + 4" :y="bodyY + 4" :width="bodyW - 8" :height="bodyH * 0.25" :rx="bodyR * 0.6" fill="rgba(255,255,255,0.15)"/>
      <rect :x="bodyX" :y="bodyY + bodyH * 0.72" :width="bodyW" :height="bodyH * 0.28" :rx="bodyR * 0.4" fill="rgba(0,0,0,0.25)"/>
    </g>

    <rect :x="bodyX" :y="bodyY" :width="bodyW" :height="bodyH" :rx="bodyR" :ry="bodyR"
      fill="none" stroke="#3a0e04" stroke-width="2"/>

    <circle :cx="bodyX + 6" :cy="bodyY + 6" r="2" fill="#3a0e04"/>
    <circle :cx="bodyX + bodyW - 6" :cy="bodyY + 6" r="2" fill="#3a0e04"/>
    <circle :cx="bodyX + 6" :cy="bodyY + bodyH - 6" r="2" fill="#3a0e04"/>
    <circle :cx="bodyX + bodyW - 6" :cy="bodyY + bodyH - 6" r="2" fill="#3a0e04"/>
  </svg>
</template>

<script setup>
import { computed } from '@vue/composition-api'

const props = defineProps({
  parts: { type: Array, default: () => [] },
  open: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
})

const W = 120
const H = 150
const bodyX = 15
const bodyY = 55
const bodyW = 90
const bodyH = 85
const bodyR = 12

const shackleW = 10
const shackleCx = W / 2
const shackleTop = 18
const shackleR = 26
const shacklePath = `M ${shackleCx - shackleR} ${bodyY + 6}
                     L ${shackleCx - shackleR} ${shackleTop + shackleR}
                     A ${shackleR} ${shackleR} 0 0 1 ${shackleCx + shackleR} ${shackleTop + shackleR}
                     L ${shackleCx + shackleR} ${bodyY + 6}`

const pivotX = shackleCx + shackleR
const pivotY = bodyY + 6
const shackleTransform = computed(() =>
  props.open ? `translate(0 -44) rotate(-50 ${pivotX} ${pivotY})` : `translate(0 0)`
)

const uid = Math.random().toString(36).slice(2, 9)
const gradBodyId = `lkBody-${uid}`
const gradShackleId = `lkShackle-${uid}`
const gradHoleId = `lkHole-${uid}`
const maskId = `lkMask-${uid}`

const n = computed(() => Math.max(props.parts.length, 1))
const slotR = computed(() => {
  if (n.value === 1) return 20
  if (n.value === 2) return 16
  return 13
})
const gap = computed(() => slotR.value * 2)
const centerY = bodyY + bodyH / 2
const startY = computed(() => centerY - ((n.value - 1) * gap.value) / 2)
function slotY(i) { return startY.value + i * gap.value }

function poly(i, kind) {
  const cx = W / 2, cy = slotY(i), r = slotR.value
  return polyPoints(kind, cx, cy, r)
}
function polyPoints(kind, cx, cy, r) {
  if (kind === 'triangle') {
    const R = r * 1.05
    return `${cx},${cy - R} ${cx + R * 0.95},${cy + R * 0.7} ${cx - R * 0.95},${cy + R * 0.7}`
  }
  if (kind === 'quad') {
    // trapezoid
    const R = r * 1.1
    return `${cx - R * 0.55},${cy - R * 0.8} ${cx + R * 0.55},${cy - R * 0.8} ${cx + R},${cy + R * 0.8} ${cx - R},${cy + R * 0.8}`
  }
  if (kind === 'diamond') {
    const R = r * 1.1
    return `${cx},${cy - R} ${cx + R},${cy} ${cx},${cy + R} ${cx - R},${cy}`
  }
  if (kind === 'hex' || kind === 'oct') {
    const sides = kind === 'hex' ? 6 : 8
    const R = r * 1.12
    const rot = kind === 'hex' ? -90 : -90 + 22.5
    const pts = []
    for (let j = 0; j < sides; j++) {
      const a = (rot + j * (360 / sides)) * Math.PI / 180
      pts.push(`${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`)
    }
    return pts.join(' ')
  }
  if (kind === 'star') {
    const outer = r * 1.15
    const inner = outer * 0.45
    const pts = []
    for (let j = 0; j < 10; j++) {
      const rr = j % 2 === 0 ? outer : inner
      const a = (j * 36 - 90) * Math.PI / 180
      pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`)
    }
    return pts.join(' ')
  }
  return ''
}
</script>

<style scoped>
.shackle {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
