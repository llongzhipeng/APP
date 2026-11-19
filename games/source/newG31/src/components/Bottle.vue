<template>
  <div
    class="bottle-wrap"
    :class="{ active: active, disabled: disabled, hint: hint }"
    @click="onClick"
  >
    <svg viewBox="0 0 100 200" class="bottle-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient :id="'glass'+_uid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="rgba(255,255,255,0.55)"/>
          <stop offset="0.4" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="0.7" stop-color="rgba(255,255,255,0.15)"/>
          <stop offset="1" stop-color="rgba(255,255,255,0.4)"/>
        </linearGradient>
        <linearGradient :id="'water'+_uid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="lighten(color, 0.25)"/>
          <stop offset="1" :stop-color="color"/>
        </linearGradient>
        <clipPath :id="'clip'+_uid">
          <path d="M30 25 Q30 20 35 20 L65 20 Q70 20 70 25 L70 45 Q70 55 78 62 Q90 72 90 95 L90 175 Q90 185 80 185 L20 185 Q10 185 10 175 L10 95 Q10 72 22 62 Q30 55 30 45 Z" />
        </clipPath>
      </defs>

      <!-- Water fill (clipped to bottle shape) -->
      <g :clip-path="`url(#clip${_uid})`">
        <rect x="0" :y="waterY" width="100" :height="200 - waterY" :fill="`url(#water${_uid})`" />
        <!-- Water surface wave -->
        <ellipse cx="50" :cy="waterY" rx="42" ry="3" :fill="lighten(color, 0.35)" opacity="0.8"/>
        <!-- Bubbles -->
        <circle cx="35" :cy="waterY + 25" r="2" fill="rgba(255,255,255,0.6)"/>
        <circle cx="62" :cy="waterY + 55" r="1.5" fill="rgba(255,255,255,0.5)"/>
        <circle cx="45" :cy="waterY + 90" r="2.5" fill="rgba(255,255,255,0.5)"/>
      </g>

      <!-- Glass outline -->
      <path
        d="M30 25 Q30 20 35 20 L65 20 Q70 20 70 25 L70 45 Q70 55 78 62 Q90 72 90 95 L90 175 Q90 185 80 185 L20 185 Q10 185 10 175 L10 95 Q10 72 22 62 Q30 55 30 45 Z"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.85)"
        stroke-width="2.2"
      />
      <!-- Glass highlight -->
      <path
        d="M22 70 Q18 80 18 95 L18 170"
        stroke="rgba(255,255,255,0.75)"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <!-- Cork/rim -->
      <rect x="32" y="14" width="36" height="8" rx="2" fill="#8b5a2b" stroke="#5c3a1a" stroke-width="1"/>

      <!-- Note label -->
      <text x="50" y="200" text-anchor="middle" class="note-label" :fill="color">{{ note }}</text>
    </svg>

    <!-- Ripple ring on tap -->
    <div v-if="ripple" class="ripple" :style="{ borderColor: color }"></div>
  </div>
</template>

<script>
let uidSeed = 0
export default {
  name: 'Bottle',
  props: {
    note: { type: String, required: true },
    color: { type: String, default: '#4dabf7' },
    waterLevel: { type: Number, default: 0.5 }, // 0..1
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    hint: { type: Boolean, default: false }
  },
  data() {
    return { _uid: ++uidSeed, ripple: false }
  },
  computed: {
    waterY() {
      // water occupies (waterLevel) of the interior; interior top ~ y=20, bottom ~ y=185
      const top = 20, bottom = 185
      return bottom - (bottom - top) * this.waterLevel
    }
  },
  watch: {
    active(v) {
      if (v) {
        this.ripple = false
        this.$nextTick(() => { this.ripple = true })
        setTimeout(() => { this.ripple = false }, 700)
      }
    }
  },
  methods: {
    onClick() {
      if (this.disabled) return
      this.$emit('tap')
    },
    lighten(hex, amt) {
      const c = hex.replace('#', '')
      const num = parseInt(c, 16)
      let r = (num >> 16) + Math.round(255 * amt)
      let g = ((num >> 8) & 0xff) + Math.round(255 * amt)
      let b = (num & 0xff) + Math.round(255 * amt)
      r = Math.min(255, r); g = Math.min(255, g); b = Math.min(255, b)
      return `rgb(${r},${g},${b})`
    }
  }
}
</script>

<style scoped>
.bottle-wrap {
  position: relative;
  width: 110px;
  height: 240px;
  cursor: pointer;
  transition: transform 0.15s ease-out;
  filter: drop-shadow(0 8px 14px rgba(0, 20, 60, 0.35));
}
.bottle-wrap:hover:not(.disabled) {
  transform: translateY(-6px) scale(1.03);
}
.bottle-wrap.disabled {
  cursor: not-allowed;
  opacity: 0.85;
}
.bottle-wrap.active {
  animation: shake 0.45s ease-out;
}
.bottle-wrap.hint {
  animation: pulse 0.9s ease-in-out infinite;
}
.bottle-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.note-label {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Georgia', serif;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.ripple {
  position: absolute;
  left: 50%; top: 40%;
  width: 30px; height: 30px;
  border: 3px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 0.7s ease-out forwards;
  pointer-events: none;
}
@keyframes ripple {
  0%   { width: 20px; height: 20px; opacity: 0.9; }
  100% { width: 180px; height: 180px; opacity: 0; }
}
@keyframes shake {
  0%,100% { transform: rotate(0); }
  20% { transform: rotate(-4deg) translateY(-4px); }
  40% { transform: rotate(3deg); }
  60% { transform: rotate(-2deg); }
  80% { transform: rotate(1deg); }
}
@keyframes pulse {
  0%,100% { transform: scale(1); filter: drop-shadow(0 8px 14px rgba(0, 20, 60, 0.35)); }
  50% { transform: scale(1.05); filter: drop-shadow(0 12px 22px rgba(255, 220, 100, 0.6)); }
}
</style>
