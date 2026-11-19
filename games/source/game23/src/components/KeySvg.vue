<template>
  <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient :id="goldId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0"    stop-color="#fde68a"/>
        <stop offset="0.4"  stop-color="#f4b942"/>
        <stop offset="0.75" stop-color="#c98a1a"/>
        <stop offset="1"    stop-color="#7a4d0a"/>
      </linearGradient>
      <radialGradient :id="holeId" cx="0.5" cy="0.45" r="0.6">
        <stop offset="0" stop-color="#2a1808"/>
        <stop offset="1" stop-color="#000"/>
      </radialGradient>

      <mask :id="bowMaskId">
        <ellipse :cx="bowCx" :cy="bowCy" :rx="bowRx" :ry="bowRy" fill="white"/>
        <circle :cx="bowCx" :cy="bowCy" :r="bowHoleR" fill="black"/>
      </mask>

      <mask :id="bitMaskId">
        <rect :x="bitX" :y="bitY" :width="bitW" :height="bitH" :rx="bitR" :ry="bitR" fill="white"/>
        <g v-for="(shape, i) in shapes" :key="i" fill="black">
          <circle  v-if="shape === 'circle'" :cx="bitCx" :cy="slotY(i)" :r="slotR"/>
          <rect    v-else-if="shape === 'square'"
            :x="bitCx - slotR" :y="slotY(i) - slotR" :width="slotR * 2" :height="slotR * 2" rx="2"/>
          <rect    v-else-if="shape === 'rect'"
            :x="bitCx - slotR * 0.95" :y="slotY(i) - slotR * 0.6"
            :width="slotR * 1.9" :height="slotR * 1.2" rx="2"/>
          <polygon v-else-if="shape === 'triangle'" :points="poly(i,'triangle')"/>
          <polygon v-else-if="shape === 'quad'"     :points="poly(i,'quad')"/>
          <polygon v-else-if="shape === 'diamond'"  :points="poly(i,'diamond')"/>
          <polygon v-else-if="shape === 'star'"     :points="poly(i,'star')"/>
          <polygon v-else-if="shape === 'hex'"      :points="poly(i,'hex')"/>
          <polygon v-else-if="shape === 'oct'"      :points="poly(i,'oct')"/>
        </g>
      </mask>
    </defs>

    <circle :cx="bowCx" :cy="bowCy" :r="bowHoleR" :fill="`url(#${holeId})`"/>
    <g :mask="`url(#${bowMaskId})`">
      <ellipse :cx="bowCx" :cy="bowCy" :rx="bowRx" :ry="bowRy" :fill="`url(#${goldId})`"/>
      <ellipse :cx="bowCx - bowRx * 0.3" :cy="bowCy - bowRy * 0.4" :rx="bowRx * 0.4" :ry="bowRy * 0.22" fill="rgba(255,255,255,0.45)"/>
    </g>
    <ellipse :cx="bowCx" :cy="bowCy" :rx="bowRx" :ry="bowRy" fill="none" stroke="#3d2206" stroke-width="1.5"/>

    <rect :x="W/2 - collarW/2" :y="collarY" :width="collarW" :height="collarH" :fill="`url(#${goldId})`" rx="1"/>
    <rect :x="W/2 - collarW/2" :y="collarY" :width="collarW" :height="collarH" fill="none" stroke="#3d2206" stroke-width="1" rx="1"/>

    <rect :x="shaftX" :y="shaftY" :width="shaftW" :height="shaftH" :fill="`url(#${goldId})`"/>
    <rect :x="shaftX" :y="shaftY" :width="shaftW" :height="shaftH" fill="none" stroke="#3d2206" stroke-width="1"/>
    <rect :x="shaftX + 1.5" :y="shaftY + 2" width="2" :height="shaftH - 4" fill="rgba(255,255,255,0.55)"/>

    <rect :x="bitX" :y="bitY" :width="bitW" :height="bitH" :rx="bitR" :ry="bitR" :fill="`url(#${holeId})`"/>

    <g :mask="`url(#${bitMaskId})`">
      <rect :x="bitX" :y="bitY" :width="bitW" :height="bitH" :rx="bitR" :ry="bitR" :fill="`url(#${goldId})`"/>
      <rect :x="bitX + 2" :y="bitY + 2" width="3" :height="bitH - 4" fill="rgba(255,255,255,0.4)"/>
    </g>
    <rect :x="bitX" :y="bitY" :width="bitW" :height="bitH" :rx="bitR" :ry="bitR"
      fill="none" stroke="#3d2206" stroke-width="1.5"/>

    <rect :x="shaftX" :y="tipY" :width="shaftW" :height="6" :fill="`url(#${goldId})`" stroke="#3d2206" stroke-width="1"/>
  </svg>
</template>

<script setup>
import { computed } from '@vue/composition-api'

const props = defineProps({
  shapes: { type: Array, default: () => [] },
  highlight: { type: Boolean, default: false },
})

const W = 100
const H = 250

const bowCx = W / 2
const bowCy = 32
const bowRx = 26
const bowRy = 22
const bowHoleR = 8

const collarY = bowCy + bowRy + 2
const collarW = 26
const collarH = 6

const shaftX = W / 2 - 4.5
const shaftW = 9
const shaftY = collarY + collarH

const n = computed(() => Math.max(props.shapes.length, 1))
const slotR = computed(() => n.value === 1 ? 14 : n.value === 2 ? 11 : 9)
const slotGap = computed(() => slotR.value * 2)
const bitH = computed(() => n.value * slotR.value * 2 + 24)
const bitX = computed(() => shaftX - 2)
const bitY = computed(() => shaftY + 50)
const bitW = 42
const bitR = 4
const bitCx = computed(() => bitX.value + 4 + slotR.value + 6)
const shaftH = computed(() => bitY.value + bitH.value - shaftY)
const tipY = computed(() => bitY.value + bitH.value)

const centerY = computed(() => bitY.value + bitH.value / 2)
const startY = computed(() => centerY.value - ((n.value - 1) * slotGap.value) / 2)
function slotY(i) { return startY.value + i * slotGap.value }

const uid = Math.random().toString(36).slice(2, 9)
const goldId = `kG-${uid}`
const holeId = `kH-${uid}`
const bowMaskId = `kBM-${uid}`
const bitMaskId = `kBitM-${uid}`

function poly(i, kind) {
  const cx = bitCx.value, cy = slotY(i), r = slotR.value
  if (kind === 'triangle') {
    const R = r * 1.05
    return `${cx},${cy - R} ${cx + R * 0.95},${cy + R * 0.7} ${cx - R * 0.95},${cy + R * 0.7}`
  }
  if (kind === 'quad') {
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
