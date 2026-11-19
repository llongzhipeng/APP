<template>
  <svg viewBox="0 0 260 360" class="daisy-svg" :class="{ mini, wilted }">
    <defs>
      <radialGradient :id="'petalG-'+uid" cx="50%" cy="35%" r="70%">
        <stop offset="0%"  stop-color="#ffffff"/>
        <stop offset="55%" stop-color="#fbe6f1"/>
        <stop offset="100%" stop-color="#f472b6"/>
      </radialGradient>
      <radialGradient :id="'coreG-'+uid" cx="45%" cy="40%" r="65%">
        <stop offset="0%"  stop-color="#fff7c2"/>
        <stop offset="55%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#8a5a05"/>
      </radialGradient>
      <linearGradient :id="'stem-'+uid" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#264a1a"/>
        <stop offset="50%" stop-color="#4a8534"/>
        <stop offset="100%" stop-color="#1a3010"/>
      </linearGradient>
      <radialGradient :id="'leafG-'+uid" cx="30%" cy="30%" r="80%">
        <stop offset="0%"  stop-color="#9ed26f"/>
        <stop offset="60%" stop-color="#3d7a2f"/>
        <stop offset="100%" stop-color="#1c3612"/>
      </radialGradient>
    </defs>
    <!-- Ground shadow -->
    <ellipse cx="130" cy="348" rx="85" ry="9" fill="rgba(0,0,0,.45)"/>
    <!-- Small grass tufts around the base (game only) -->
    <g v-if="!hideGrass" stroke="#3a7a3a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M78 348 Q80 332 76 318"/>
      <path d="M92 350 Q94 336 96 322"/>
      <path d="M170 350 Q168 336 172 322"/>
      <path d="M188 348 Q190 334 186 318"/>
      <path d="M108 352 Q110 342 108 332"/>
      <path d="M152 352 Q150 342 152 332"/>
    </g>
    <!-- Stem -->
    <path class="stem" d="M130 348 Q124 260 132 200 Q136 178 130 160"
          :stroke="`url(#stem-${uid})`" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Leaves -->
    <g class="leaf leaf-left">
      <path d="M128 280 Q84 264 56 280 Q72 306 108 300 Q124 296 128 288 Z"
            :fill="`url(#leafG-${uid})`" stroke="#1c3612" stroke-width="1.2"/>
      <path d="M128 280 Q104 286 76 282" stroke="#1c3612" stroke-width=".9" fill="none" opacity=".7"/>
      <path d="M78 274 L84 282 M90 270 L96 280 M104 272 L108 282" stroke="#1c3612" stroke-width=".7" fill="none" opacity=".55"/>
    </g>
    <g class="leaf leaf-right">
      <path d="M132 240 Q176 224 206 240 Q192 268 154 260 Q136 256 132 248 Z"
            :fill="`url(#leafG-${uid})`" stroke="#1c3612" stroke-width="1.2"/>
      <path d="M132 240 Q158 246 190 244" stroke="#1c3612" stroke-width=".9" fill="none" opacity=".7"/>
      <path d="M182 234 L176 244 M168 232 L162 244 M154 234 L150 244" stroke="#1c3612" stroke-width=".7" fill="none" opacity=".55"/>
    </g>
    <!-- Bloom -->
    <g class="bloom"><g transform="translate(130 138)">
      <g>
        <g v-for="k in 8" :key="'pb'+k" :transform="`rotate(${(k-1)*45 + 22.5})`">
          <ellipse cx="0" cy="-58" rx="14" ry="30" :fill="`url(#petalG-${uid})`" stroke="#c74e94" stroke-width="1.2" opacity=".95"/>
        </g>
      </g>
      <g>
        <g v-for="k in 8" :key="'pf'+k" :transform="`rotate(${(k-1)*45})`">
          <ellipse cx="0" cy="-52" rx="16" ry="34" :fill="`url(#petalG-${uid})`" stroke="#be3a86" stroke-width="1.3"/>
          <path d="M0 -80 Q0 -60 0 -30" stroke="#f9a8d4" stroke-width="1" fill="none" opacity=".8"/>
          <ellipse cx="-4" cy="-72" rx="4" ry="8" fill="#ffffff" opacity=".55"/>
        </g>
      </g>
      <circle r="22" :fill="`url(#coreG-${uid})`" stroke="#7a5008" stroke-width="1.6"/>
      <g fill="#7a5008">
        <circle cx="-8" cy="-8" r="1.8"/><circle cx="0" cy="-10" r="1.6"/><circle cx="8" cy="-6" r="1.8"/>
        <circle cx="-10" cy="2" r="1.8"/><circle cx="-2" cy="0" r="1.6"/><circle cx="8" cy="4" r="1.8"/>
        <circle cx="-6" cy="10" r="1.6"/><circle cx="4" cy="12" r="1.6"/><circle cx="10" cy="8" r="1.4"/>
        <circle cx="-12" cy="-2" r="1.4"/><circle cx="12" cy="-2" r="1.4"/>
      </g>
      <ellipse cx="-6" cy="-8" rx="9" ry="5" fill="#fff8c4" opacity=".65"/>
    </g></g>
  </svg>
</template>

<script>
let n = 0
export default {
  props: {
    mini: { type: Boolean, default: false },
    hideGrass: { type: Boolean, default: false },
    wilted: { type: Boolean, default: false }
  },
  data () { return { uid: 'd' + (++n) } }
}
</script>

<style scoped>
.daisy-svg { width: 100%; height: 100%; display: block; }
.daisy-svg .leaf, .daisy-svg .bloom, .daisy-svg .stem {
  transition: transform 1.1s cubic-bezier(.36,.07,.19,.97);
}
.daisy-svg .leaf-left { transform-origin: 128px 282px; }
.daisy-svg .leaf-right { transform-origin: 132px 242px; }
.daisy-svg .bloom { transform-origin: 130px 160px; }
.daisy-svg .stem { transform-origin: 130px 348px; }
.daisy-svg.wilted .leaf-left { transform: rotate(58deg) translate(-6px, 4px); }
.daisy-svg.wilted .leaf-right { transform: rotate(-52deg) translate(6px, 6px); }
.daisy-svg.wilted .bloom { transform: rotate(-38deg) translate(-8px, 18px); }
.daisy-svg.wilted .stem { transform: rotate(-6deg); }
</style>
