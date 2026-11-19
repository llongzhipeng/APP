<template>
  <div class="metronome" :class="[side, {active: recentTick, glow: glow}]">
    <!-- Body -->
    <svg class="mn-svg" viewBox="0 0 200 320" preserveAspectRatio="xMidYMid meet">
      <!-- Base -->
      <defs>
        <linearGradient :id="'wood-'+side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="woodTop" />
          <stop offset="100%" :stop-color="woodBot" />
        </linearGradient>
        <linearGradient :id="'panel-'+side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b2247" />
          <stop offset="100%" stop-color="#0f1530" />
        </linearGradient>
        <radialGradient :id="'bulb-'+side" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" :stop-color="accent" stop-opacity="1" />
          <stop offset="60%" :stop-color="accent" stop-opacity=".55" />
          <stop offset="100%" :stop-color="accent" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Trapezoid body -->
      <path
        d="M40 300 L160 300 L135 40 L65 40 Z"
        :fill="`url(#wood-${side})`"
        stroke="rgba(0,0,0,.35)" stroke-width="1.5" />
      <!-- Inner panel -->
      <path
        d="M55 285 L145 285 L128 60 L72 60 Z"
        :fill="`url(#panel-${side})`" />

      <!-- Scale marks -->
      <g stroke="rgba(255,255,255,.25)" stroke-width="1">
        <line v-for="i in 9" :key="i"
              :x1="98 - i*2" :x2="102 + i*2"
              :y1="80 + i*22" :y2="80 + i*22" />
      </g>

      <!-- Pivot -->
      <circle cx="100" cy="270" r="6" fill="#111" stroke="rgba(255,255,255,.3)" />

      <!-- Pendulum -->
      <g :transform="`rotate(${angle} 100 270)`" style="transition: none;">
        <line x1="100" y1="270" x2="100" y2="80"
              stroke="#d7dcf5" stroke-width="3.5" stroke-linecap="round" />
        <!-- Sliding weight -->
        <rect x="90" y="130" width="20" height="26" rx="3"
              fill="#e8ecff" stroke="#333" stroke-width="1" />
        <rect x="92" y="133" width="16" height="4" fill="rgba(0,0,0,.25)" />
        <!-- Bob -->
        <circle cx="100" cy="80" r="12"
                :fill="accent" stroke="rgba(0,0,0,.35)" stroke-width="1.5" />
        <circle cx="100" cy="80" r="5" fill="rgba(255,255,255,.55)" />
      </g>

      <!-- Bulb / indicator -->
      <circle cx="100" cy="45" :r="recentTick ? 16 : 10"
              :fill="`url(#bulb-${side})`"
              style="transition: r .12s ease;" />
      <circle cx="100" cy="45" r="6" :fill="accent" />

      <!-- Nameplate：与按键 A / L 一致 -->
      <rect x="70" y="240" width="60" height="26" rx="4"
            fill="#0b0f22" stroke="rgba(255,255,255,.15)" />
      <text x="100" y="258" text-anchor="middle"
            font-size="14" font-weight="700" font-family="Georgia, serif"
            :fill="accent">{{ side === 'left' ? 'A' : 'L' }}</text>
    </svg>

    <!-- Hint chip -->
    <div class="mn-chip" :style="{ borderColor: accent, color: accent }">
      {{ hintText }}
    </div>

    <!-- Beat pulse ring -->
    <div class="mn-pulse" v-if="recentTick" :style="{ borderColor: accent }"></div>
  </div>
</template>

<script>
import { playTick } from '../audio.js'
export default {
  name: 'Metronome',
  props: {
    side: { type: String, default: 'left' },       // 'left' | 'right'
    bpm: { type: Number, default: 60 },             // beats per minute for THIS side
    running: { type: Boolean, default: true },
    hintText: { type: String, default: '' },
    glow: { type: Boolean, default: false },
    // If true, the component plays its own tick sound on the beat.
    autoPlay: { type: Boolean, default: false }
  },
  data() {
    return {
      angle: 0,        // deg
      recentTick: false,
      raf: null,
      start: 0,
      lastBeatIdx: -1
    }
  },
  computed: {
    accent() { return this.side === 'left' ? '#4fc3f7' : '#ff8a80' },
    woodTop() { return this.side === 'left' ? '#3b2a1c' : '#3d2418' },
    woodBot() { return this.side === 'left' ? '#1e140a' : '#1e0f08' },
    // Amplitude of swing (deg)
    amp() { return Math.min(28, 14 + (this.bpm / 200) * 18) },
    period() { return 60 / Math.max(1, this.bpm) * 2 } // full cycle = 2 beats (there+back)
  },
  watch: {
    running(v) { v ? this.startLoop() : this.stopLoop() },
    bpm() { /* period recalculated automatically */ }
  },
  mounted() { if (this.running) this.startLoop() },
  beforeDestroy() { this.stopLoop() },
  methods: {
    startLoop() {
      this.start = performance.now()
      this.lastBeatIdx = -1
      const tick = (now) => {
        const t = (now - this.start) / 1000
        const period = this.period
        const phase = (t % period) / period      // 0..1
        // cosine swing: -amp .. +amp .. -amp
        this.angle = -Math.cos(phase * Math.PI * 2) * this.amp
        // Beat happens each half-period (extremes of swing)
        const beatIdx = Math.floor(t / (period / 2))
        if (beatIdx !== this.lastBeatIdx) {
          this.lastBeatIdx = beatIdx
          this.pulseBeat()
        }
        this.raf = requestAnimationFrame(tick)
      }
      this.raf = requestAnimationFrame(tick)
    },
    stopLoop() {
      if (this.raf) cancelAnimationFrame(this.raf)
      this.raf = null
    },
    pulseBeat() {
      this.recentTick = true
      this.$emit('beat')
      if (this.autoPlay) { playTick(this.side) }
      setTimeout(() => { this.recentTick = false }, 140)
    }
  }
}
</script>

<style scoped>
.metronome {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,.4));
  transition: transform .2s ease, filter .2s ease;
}
.metronome.active { transform: scale(1.02); }
.metronome.glow {
  filter: drop-shadow(0 20px 40px rgba(0,0,0,.4))
          drop-shadow(0 0 24px currentColor);
}
.mn-svg {
  width: 100%;
  height: 100%;
  max-height: 100%;
}
.mn-chip {
  position: absolute;
  bottom: 6%;
  left: 50%;
  transform: translateX(-50%);
  padding: .4em 1em;
  border: 1.5px solid;
  border-radius: 999px;
  background: rgba(0,0,0,.35);
  backdrop-filter: blur(6px);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: .05em;
  white-space: nowrap;
}
.mn-pulse {
  position: absolute;
  top: 8%;
  left: 50%;
  width: 30%;
  aspect-ratio: 1 / 1;
  border: 3px solid;
  border-radius: 50%;
  transform: translate(-50%, 0);
  pointer-events: none;
  animation: mnPulse .5s ease-out forwards;
}
@keyframes mnPulse {
  0%   { transform: translate(-50%,0) scale(.6); opacity: .85; }
  100% { transform: translate(-50%,0) scale(1.6); opacity: 0; }
}
</style>
