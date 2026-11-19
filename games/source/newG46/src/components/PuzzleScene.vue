<template>
  <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" class="scene">
    <defs>
      <filter :id="`glow-${uid}`" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Base image -->
    <rect :width="width" :height="height" fill="#0f172a"/>
    <image :href="imageUrl" :xlink:href="imageUrl" :width="width" :height="height"
           preserveAspectRatio="xMidYMid slice"/>

    <!-- Correct markers -->
    <g v-for="mark in foundMarkers" :key="mark.id + 'mk'">
      <circle :cx="mark.x" :cy="mark.y" :r="mark.r * 0.9" fill="none" stroke="#22e07a" stroke-width="5" opacity="0.95" :filter="`url(#glow-${uid})`"/>
      <path :d="`M ${mark.x - mark.r*0.3} ${mark.y} l ${mark.r*0.25} ${mark.r*0.25} l ${mark.r*0.45} -${mark.r*0.55}`"
            stroke="#22e07a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Wrong flash -->
    <g v-if="wrong">
      <circle :cx="wrong.x" :cy="wrong.y" r="34" fill="none" stroke="#ff4757" stroke-width="4" class="wrong-flash"/>
      <line :x1="wrong.x-16" :y1="wrong.y-16" :x2="wrong.x+16" :y2="wrong.y+16" stroke="#ff4757" stroke-width="5" stroke-linecap="round"/>
      <line :x1="wrong.x+16" :y1="wrong.y-16" :x2="wrong.x-16" :y2="wrong.y+16" stroke="#ff4757" stroke-width="5" stroke-linecap="round"/>
    </g>

    <!-- Reveal missed -->
    <g v-for="d in reveal" :key="d.id + 'rv'">
      <circle :cx="d.x" :cy="d.y" :r="d.r * 0.95" fill="none" stroke="#ffcc00" stroke-width="4" stroke-dasharray="7 5" class="reveal-pulse"/>
    </g>

    <!-- Click layer -->
    <rect :width="width" :height="height" fill="transparent" @click="onClick" style="cursor: crosshair"/>
  </svg>
</template>

<script>
export default {
  name: 'PuzzleScene',
  props: {
    imageUrl: String,
    width: { type: Number, default: 1024 },
    height: { type: Number, default: 768 },
    side: String,
    foundMarkers: { type: Array, default: () => [] },
    wrong: Object,
    reveal: { type: Array, default: () => [] },
  },
  data() {
    return {
      uid: Math.random().toString(36).slice(2, 8),
    }
  },
  methods: {
    onClick(e) {
      const svg = e.currentTarget.ownerSVGElement
      const pt = svg.createSVGPoint()
      pt.x = e.clientX; pt.y = e.clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const p = pt.matrixTransform(ctm.inverse())
      this.$emit('scene-click', { x: p.x, y: p.y, side: this.side })
    },
  },
}
</script>

<style scoped>
.scene { width: 100%; height: 100%; display: block; user-select: none; }
.wrong-flash { animation: wf 0.5s ease-out; }
@keyframes wf { from { r: 12; opacity: 1; } to { r: 55; opacity: 0; } }
.reveal-pulse { animation: rp 1.2s ease-in-out infinite; }
@keyframes rp { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
</style>
