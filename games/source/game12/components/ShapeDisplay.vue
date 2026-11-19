<template>
  <div class="shape-wrapper" :class="wrapperClass" :style="wrapperStyle" @click="$emit('click')">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g :transform="`rotate(${rotation}, 100, 100)`">
        <circle
          v-if="shape === 'circle'"
          cx="100" cy="100" :r="sv"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
        />
        <rect
          v-else-if="shape === 'square'"
          :x="100 - sv" :y="100 - sv"
          :width="sv * 2" :height="sv * 2"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
          rx="3"
        />
        <polygon
          v-else-if="shape === 'triangle'"
          :points="triPoints"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
        />
        <polygon
          v-else-if="shape === 'diamond'"
          :points="diaPoints"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
        />
        <polygon
          v-else-if="shape === 'pentagon'"
          :points="penPoints"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
        />
        <polygon
          v-else-if="shape === 'hexagon'"
          :points="hexPoints"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
        />
        <polygon
          v-else-if="shape === 'star'"
          :points="starPoints"
          :fill="fillColor" :stroke="strokeColor" :stroke-width="strokeW"
        />
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'ShapeDisplay',
  props: {
    shape: { type: String, required: true },
    size: { type: Number, required: true },   // 0-100, maps to SVG units
    rotation: { type: Number, default: 0 },
    colorMode: { type: String, default: 'option' }, // 'reference' | 'option' | 'correct' | 'wrong' | 'demo-ref' | 'demo-opt'
    isClickable: { type: Boolean, default: false },
  },
  emits: ['click'],
  computed: {
    // Map size (0-100) → SVG radius (10-88)
    sv() {
      return 10 + (this.size / 100) * 78
    },
    fillColor() {
      const map = {
        reference: '#FF7043',
        option: '#5C6BC0',
        correct: '#43A047',
        wrong: '#E53935',
        'demo-ref': '#FF7043',
        'demo-opt': '#5C6BC0',
      }
      return map[this.colorMode] || '#5C6BC0'
    },
    strokeColor() {
      const map = {
        reference: '#E64A19',
        option: '#3949AB',
        correct: '#2E7D32',
        wrong: '#B71C1C',
        'demo-ref': '#E64A19',
        'demo-opt': '#3949AB',
      }
      return map[this.colorMode] || '#3949AB'
    },
    strokeW() {
      return 2
    },
    wrapperClass() {
      return {
        'clickable': this.isClickable,
        [`mode-${this.colorMode}`]: true,
      }
    },
    wrapperStyle() {
      return {}
    },
    triPoints() {
      const s = this.sv
      return `100,${100 - s} ${100 + s * 0.866},${100 + s * 0.5} ${100 - s * 0.866},${100 + s * 0.5}`
    },
    diaPoints() {
      const s = this.sv
      return `100,${100 - s} ${100 + s},100 100,${100 + s} ${100 - s},100`
    },
    penPoints() {
      const s = this.sv
      const pts = []
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180
        pts.push(`${100 + s * Math.cos(a)},${100 + s * Math.sin(a)}`)
      }
      return pts.join(' ')
    },
    hexPoints() {
      const s = this.sv
      const pts = []
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 - 30) * Math.PI / 180
        pts.push(`${100 + s * Math.cos(a)},${100 + s * Math.sin(a)}`)
      }
      return pts.join(' ')
    },
    starPoints() {
      const outer = this.sv
      const inner = outer * 0.42
      const pts = []
      for (let i = 0; i < 10; i++) {
        const a = (i * 36 - 90) * Math.PI / 180
        const r = i % 2 === 0 ? outer : inner
        pts.push(`${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`)
      }
      return pts.join(' ')
    },
  },
}
</script>

<style scoped>
.shape-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  user-select: none;
}
.shape-wrapper.clickable {
  cursor: pointer;
}
.shape-wrapper.clickable:hover {
  transform: scale(1.06);
}
</style>
