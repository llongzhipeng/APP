<template>
  <div class="clock-wrap" ref="wrap">
    <svg :viewBox="`0 0 ${S} ${S}`" class="clock" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointerleave="onUp">
      <defs>
        <radialGradient id="face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="70%" stop-color="#f4f1ea" />
          <stop offset="100%" stop-color="#e0d9c8" />
        </radialGradient>
        <linearGradient id="bezelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f0e2b8" />
          <stop offset="50%" stop-color="#c69a48" />
          <stop offset="100%" stop-color="#8b6524" />
        </linearGradient>
        <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
          <feOffset dx="0" dy="2" result="off" />
          <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <circle :cx="C" :cy="C" :r="C - 4" fill="url(#bezelGrad)" />
      <circle :cx="C" :cy="C" :r="C - 18" fill="#1a1410" />
      <circle :cx="C" :cy="C" :r="C - 22" fill="url(#face)" />

      <g>
        <line v-for="i in 60" :key="'t'+i"
              :x1="C + (C - 36) * Math.sin(i * Math.PI / 30)"
              :y1="C - (C - 36) * Math.cos(i * Math.PI / 30)"
              :x2="C + (C - (i % 5 === 0 ? 56 : 46)) * Math.sin(i * Math.PI / 30)"
              :y2="C - (C - (i % 5 === 0 ? 56 : 46)) * Math.cos(i * Math.PI / 30)"
              :stroke="i % 5 === 0 ? '#1a1410' : '#a89975'"
              :stroke-width="i % 5 === 0 ? 4 : 1.4"
              stroke-linecap="round" />
      </g>

      <g text-anchor="middle" dominant-baseline="central" fill="#1a1410" font-family="'Inter','PingFang SC',sans-serif" font-weight="600">
        <text v-for="(n, i) in numerals" :key="'n'+i"
              :x="C + (C - 82) * Math.sin((i + 1) * Math.PI / 6)"
              :y="C - (C - 82) * Math.cos((i + 1) * Math.PI / 6)"
              :font-size="S * 0.075">{{ n }}</text>
      </g>

      <g :transform="`rotate(${displayHour} ${C} ${C})`" filter="url(#handShadow)" class="hand" :class="{active: dragging==='hour'}">
        <rect :x="C - S*0.014" :y="C - S*0.28" :width="S*0.028" :height="S*0.32" rx="4" fill="#1a1410" />
      </g>
      <g :transform="`rotate(${displayMinute} ${C} ${C})`" filter="url(#handShadow)" class="hand" :class="{active: dragging==='minute'}">
        <rect :x="C - S*0.010" :y="C - S*0.42" :width="S*0.020" :height="S*0.46" rx="3" fill="#1a1410" />
      </g>
      <g v-if="showSecond" :transform="`rotate(${displaySecond} ${C} ${C})`" class="hand" :class="{active: dragging==='second'}">
        <rect :x="C - S*0.004" :y="C - S*0.44" :width="S*0.008" :height="S*0.52" rx="2" fill="#c53030" />
        <circle :cx="C" :cy="C - S*0.44" :r="S*0.014" fill="#c53030" />
      </g>

      <circle :cx="C" :cy="C" :r="S * 0.032" fill="#c69a48" />
      <circle :cx="C" :cy="C" :r="S * 0.020" fill="#1a1410" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Clock',
  props: {
    hourDeg: { type: Number, default: 0 },
    minuteDeg: { type: Number, default: 0 },
    secondDeg: { type: Number, default: 0 },
    showSecond: { type: Boolean, default: false },
    interactive: { type: Boolean, default: true },
    snapMinute: { type: Number, default: 1 }
  },
  data() { return { S: 520, dragging: null, Math } },
  computed: {
    C() { return this.S / 2 },
    numerals() { return ['1','2','3','4','5','6','7','8','9','10','11','12'] },
    displayHour() { return this.hourDeg },
    displayMinute() { return this.minuteDeg },
    displaySecond() { return this.secondDeg }
  },
  methods: {
    pointerAngle(ev) {
      const svg = this.$el.querySelector('svg')
      const rect = svg.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let a = Math.atan2(ev.clientX - cx, -(ev.clientY - cy)) * 180 / Math.PI
      if (a < 0) a += 360
      const dx = ev.clientX - cx
      const dy = ev.clientY - cy
      const dist = Math.hypot(dx, dy) / (rect.width / 2) // 0..1 (of face radius)
      return { a, dist }
    },
    // Snap-to-nearest-hand: on any pointerdown inside the face, pick the hand whose
    // current angle is closest to the pointer's angle. Removes the need for pixel-precise clicks.
    onDown(ev) {
      if (!this.interactive) return
      const { a, dist } = this.pointerAngle(ev)
      if (dist > 1.05) return // outside the bezel
      const delta = (x, y) => {
        let d = Math.abs(((x - y) % 360 + 360) % 360)
        if (d > 180) d = 360 - d
        return d
      }
      const cands = [
        { hand: 'hour', d: delta(a, this.hourDeg) },
        { hand: 'minute', d: delta(a, this.minuteDeg) }
      ]
      if (this.showSecond) cands.push({ hand: 'second', d: delta(a, this.secondDeg) })
      cands.sort((x, y) => x.d - y.d)
      this.dragging = cands[0].hand
      try {
        if (ev.currentTarget && typeof ev.currentTarget.setPointerCapture === 'function') {
          ev.currentTarget.setPointerCapture(ev.pointerId)
        }
      } catch(_) {}
      ev.preventDefault()
      this.applyAngle(a)
    },
    onMove(ev) {
      if (!this.dragging) return
      const { a } = this.pointerAngle(ev)
      this.applyAngle(a)
    },
    onUp(ev) {
      if (!this.dragging) return
      try {
        if (ev && ev.currentTarget && typeof ev.currentTarget.releasePointerCapture === 'function') {
          ev.currentTarget.releasePointerCapture(ev.pointerId)
        }
      } catch(_) {}
      this.dragging = null
    },
    applyAngle(a) {
      // Hands are independent: dragging one hand never moves the others.
      if (this.dragging === 'minute') {
        const step = this.snapMinute
        a = ((Math.round(a / step) * step) % 360 + 360) % 360
        this.$emit('update', { hourDeg: this.hourDeg, minuteDeg: a, secondDeg: this.secondDeg })
      } else if (this.dragging === 'hour') {
        // Snap the hour hand to whole hour positions.
        const newHour = ((Math.round(a / 30) * 30) % 360 + 360) % 360
        this.$emit('update', { hourDeg: newHour, minuteDeg: this.minuteDeg, secondDeg: this.secondDeg })
      } else if (this.dragging === 'second') {
        a = Math.round(a) % 360
        this.$emit('update', { hourDeg: this.hourDeg, minuteDeg: this.minuteDeg, secondDeg: a })
      }
    }
  }
}
</script>

<style scoped>
.clock-wrap {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  user-select: none; touch-action: none;
}
.clock {
  width: 100%; height: 100%;
  filter: drop-shadow(0 1.5em 3em rgba(0,0,0,0.55));
}
.hand { cursor: grab; pointer-events: none; }
.hand.active { cursor: grabbing; }
.clock { cursor: grab; }
</style>
