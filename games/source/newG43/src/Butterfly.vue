<template>
  <svg class="butterfly-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient :id="'wg1-'+uid" cx="30%" cy="35%" r="70%">
        <stop offset="0%" :stop-color="lightColor" />
        <stop offset="55%" :stop-color="color" />
        <stop offset="100%" :stop-color="darkColor" />
      </radialGradient>
      <radialGradient :id="'wg2-'+uid" cx="30%" cy="65%" r="70%">
        <stop offset="0%" :stop-color="lightColor" />
        <stop offset="55%" :stop-color="color" />
        <stop offset="100%" :stop-color="darkColor" />
      </radialGradient>
      <filter :id="'shadow-'+uid" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" />
      </filter>
    </defs>

    <!-- Left wings -->
    <g class="wing wing-left">
      <!-- upper wing -->
      <path
        d="M100,95 C60,40 20,45 15,80 C10,110 40,120 100,105 Z"
        :fill="`url(#wg1-${uid})`"
        :stroke="darkColor" stroke-width="1.5"
      />
      <!-- lower wing -->
      <path
        d="M100,105 C65,150 30,160 25,135 C22,115 55,105 100,110 Z"
        :fill="`url(#wg2-${uid})`"
        :stroke="darkColor" stroke-width="1.5"
      />
      <!-- eye spots -->
      <circle cx="45" cy="75" r="9" :fill="darkColor" opacity="0.85" />
      <circle cx="45" cy="75" r="4" fill="#fff" opacity="0.9" />
      <circle cx="55" cy="130" r="6" :fill="darkColor" opacity="0.7" />
      <!-- veins -->
      <path d="M100,100 Q70,70 30,80" fill="none" :stroke="darkColor" stroke-width="0.8" opacity="0.6"/>
      <path d="M100,105 Q65,130 35,140" fill="none" :stroke="darkColor" stroke-width="0.8" opacity="0.6"/>
    </g>

    <!-- Right wings (mirror) -->
    <g class="wing wing-right">
      <path
        d="M100,95 C140,40 180,45 185,80 C190,110 160,120 100,105 Z"
        :fill="`url(#wg1-${uid})`"
        :stroke="darkColor" stroke-width="1.5"
      />
      <path
        d="M100,105 C135,150 170,160 175,135 C178,115 145,105 100,110 Z"
        :fill="`url(#wg2-${uid})`"
        :stroke="darkColor" stroke-width="1.5"
      />
      <circle cx="155" cy="75" r="9" :fill="darkColor" opacity="0.85" />
      <circle cx="155" cy="75" r="4" fill="#fff" opacity="0.9" />
      <circle cx="145" cy="130" r="6" :fill="darkColor" opacity="0.7" />
      <path d="M100,100 Q130,70 170,80" fill="none" :stroke="darkColor" stroke-width="0.8" opacity="0.6"/>
      <path d="M100,105 Q135,130 165,140" fill="none" :stroke="darkColor" stroke-width="0.8" opacity="0.6"/>
    </g>

    <!-- Body -->
    <ellipse cx="100" cy="105" rx="5" ry="35" fill="#2a1a10" />
    <ellipse cx="100" cy="78" rx="6" ry="8" fill="#1a0f08" />
    <!-- Antennae -->
    <path d="M97,72 C92,60 88,50 82,45" stroke="#1a0f08" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M103,72 C108,60 112,50 118,45" stroke="#1a0f08" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="45" r="1.8" fill="#1a0f08"/>
    <circle cx="118" cy="45" r="1.8" fill="#1a0f08"/>
  </svg>
</template>

<script>
let counter = 0
export default {
  name: 'Butterfly',
  props: {
    color: { type: String, default: '#ff7043' }
  },
  data() {
    return { uid: ++counter }
  },
  computed: {
    lightColor() { return this.mix(this.color, '#ffffff', 0.5) },
    darkColor() { return this.mix(this.color, '#000000', 0.55) }
  },
  methods: {
    mix(hex, other, ratio) {
      const p = (h) => {
        const s = h.replace('#','')
        return [parseInt(s.substr(0,2),16), parseInt(s.substr(2,2),16), parseInt(s.substr(4,2),16)]
      }
      const [r1,g1,b1] = p(hex), [r2,g2,b2] = p(other)
      const mix1 = (a,b) => Math.round(a*(1-ratio) + b*ratio)
      const toHex = (n) => n.toString(16).padStart(2,'0')
      return '#' + toHex(mix1(r1,r2)) + toHex(mix1(g1,g2)) + toHex(mix1(b1,b2))
    }
  }
}
</script>

<style scoped>
.butterfly-svg {
  width: 100%; height: 100%;
  display: block;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
}
.wing {
  transform-origin: 100px 100px;
  animation: flap 0.35s ease-in-out infinite alternate;
}
.wing-left { animation-name: flapL; }
.wing-right { animation-name: flapR; }
@keyframes flapL {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(55deg); }
}
@keyframes flapR {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(-55deg); }
}
</style>
