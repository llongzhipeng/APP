<template>
  <div
    class="planet-wrap"
    :class="{ hoverable: !disabled, correct: state === 'correct', wrong: state === 'wrong', target: highlight }"
    :style="wrapStyle"
    @click="onClick"
  >
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="planet-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <!-- generic fallback gradients -->
        <radialGradient :id="'grad-' + uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" :stop-color="usedTheme.a" stop-opacity="1" />
          <stop offset="55%" :stop-color="usedTheme.a" stop-opacity="0.95" />
          <stop offset="100%" :stop-color="usedTheme.b" stop-opacity="1" />
        </radialGradient>
        <radialGradient :id="'shade-' + uid" cx="65%" cy="65%" r="60%">
          <stop offset="0%" stop-color="#000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.55" />
        </radialGradient>
        <radialGradient :id="'high-' + uid" cx="30%" cy="25%" r="30%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <filter :id="'glow-' + uid" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath :id="'clip-' + uid">
          <circle :cx="CX" :cy="CY" :r="R" />
        </clipPath>

        <!-- Realistic-specific gradients (defined per key when needed) -->
        <radialGradient v-if="realKey==='sun'" :id="'sun-body-'+uid" cx="45%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#fff8c9" />
          <stop offset="40%" stop-color="#ffd83b" />
          <stop offset="80%" stop-color="#ff8a00" />
          <stop offset="100%" stop-color="#c53500" />
        </radialGradient>
        <radialGradient v-if="realKey==='mercury'" :id="'mercury-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#c9c1b5" />
          <stop offset="60%" stop-color="#8e8578" />
          <stop offset="100%" stop-color="#4a423a" />
        </radialGradient>
        <radialGradient v-if="realKey==='venus'" :id="'venus-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#fff0c2" />
          <stop offset="55%" stop-color="#e8b26a" />
          <stop offset="100%" stop-color="#7a4416" />
        </radialGradient>
        <radialGradient v-if="realKey==='earth'" :id="'earth-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#7ec8ff" />
          <stop offset="60%" stop-color="#1a6cc4" />
          <stop offset="100%" stop-color="#08234a" />
        </radialGradient>
        <radialGradient v-if="realKey==='moon'" :id="'moon-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#f0ede5" />
          <stop offset="60%" stop-color="#bcb6a8" />
          <stop offset="100%" stop-color="#5a5449" />
        </radialGradient>
        <radialGradient v-if="realKey==='mars'" :id="'mars-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffb37a" />
          <stop offset="55%" stop-color="#d64a1b" />
          <stop offset="100%" stop-color="#5a1706" />
        </radialGradient>
        <radialGradient v-if="realKey==='jupiter'" :id="'jupiter-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#f6e2c2" />
          <stop offset="60%" stop-color="#c78a4b" />
          <stop offset="100%" stop-color="#5a3216" />
        </radialGradient>
        <radialGradient v-if="realKey==='saturn'" :id="'saturn-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffeec8" />
          <stop offset="60%" stop-color="#d8ac6a" />
          <stop offset="100%" stop-color="#6a4720" />
        </radialGradient>
        <radialGradient v-if="realKey==='uranus'" :id="'uranus-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#cff5f6" />
          <stop offset="60%" stop-color="#8fd4d8" />
          <stop offset="100%" stop-color="#2c6d78" />
        </radialGradient>
        <radialGradient v-if="realKey==='neptune'" :id="'neptune-body-'+uid" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#6fb5ff" />
          <stop offset="55%" stop-color="#2864c7" />
          <stop offset="100%" stop-color="#0a1d5c" />
        </radialGradient>
      </defs>

      <!-- outer aura -->
      <template v-if="realKey==='sun'">
        <!-- Sun's corona is much bigger and animated -->
        <circle :cx="CX" :cy="CY" :r="R * 1.8" fill="#ffd83b" opacity="0.15" class="aura sun-corona-1" />
        <circle :cx="CX" :cy="CY" :r="R * 1.55" fill="#ff8a00" opacity="0.25" class="aura sun-corona-2" />
        <circle :cx="CX" :cy="CY" :r="R * 1.3" fill="#fff8c9" opacity="0.35" class="aura sun-corona-3" />
      </template>
      <template v-else>
        <circle :cx="CX" :cy="CY" :r="R * 1.35" :fill="usedTheme.glow" opacity="0.12" class="aura" />
        <circle :cx="CX" :cy="CY" :r="R * 1.15" :fill="usedTheme.glow" opacity="0.18" class="aura2" />
      </template>

      <!-- Saturn's back ring half (drawn before body) -->
      <g v-if="realKey==='saturn'" :transform="`rotate(-22 ${CX} ${CY})`">
        <ellipse :cx="CX" :cy="CY" :rx="R*1.9" :ry="R*0.45" fill="none" stroke="#e0c99a" stroke-width="4" opacity="0.9" />
        <ellipse :cx="CX" :cy="CY" :rx="R*1.7" :ry="R*0.4"  fill="none" stroke="#c9a76a" stroke-width="8" opacity="0.55" />
        <ellipse :cx="CX" :cy="CY" :rx="R*2.15" :ry="R*0.5" fill="none" stroke="#b18a4a" stroke-width="1.5" opacity="0.55" />
      </g>
      <!-- Uranus faint vertical rings back -->
      <g v-if="realKey==='uranus'" :transform="`rotate(85 ${CX} ${CY})`">
        <ellipse :cx="CX" :cy="CY" :rx="R*1.6" :ry="R*0.28" fill="none" stroke="#a8dfe3" stroke-width="1.5" opacity="0.7" />
      </g>

      <!-- Generic ring (only for non-real random planets) -->
      <g v-if="!realKey && hasRing" :transform="`rotate(${ringTilt} ${CX} ${CY})`">
        <ellipse :cx="CX" :cy="CY" :rx="R * 1.55" :ry="R * 0.42" fill="none" :stroke="usedTheme.ring" stroke-width="3" opacity="0.85" />
        <ellipse :cx="CX" :cy="CY" :rx="R * 1.75" :ry="R * 0.5"  fill="none" :stroke="usedTheme.ring" stroke-width="1.5" opacity="0.5" />
      </g>

      <!-- ============== BODY ============== -->
      <g :filter="highlight ? `url(#glow-${uid})` : null">
        <!-- REALISTIC RENDERERS -->
        <!-- SUN -->
        <g v-if="realKey==='sun'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#sun-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`" opacity="0.6">
            <circle v-for="s in sunSpots" :key="s.k" :cx="CX+s.x" :cy="CY+s.y" :r="s.r" fill="#c53500" opacity="0.55" />
            <path d="" />
          </g>
          <circle :cx="CX" :cy="CY" :r="R" fill="none" stroke="#fff0a8" stroke-width="1" opacity="0.6" />
        </g>

        <!-- MERCURY -->
        <g v-else-if="realKey==='mercury'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#mercury-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`">
            <circle v-for="c in mercuryCraters" :key="c.k" :cx="CX+c.x" :cy="CY+c.y" :r="c.r" fill="#3a342d" opacity="0.55" />
            <circle v-for="c in mercuryCraters" :key="'h'+c.k" :cx="CX+c.x-c.r*0.3" :cy="CY+c.y-c.r*0.3" :r="c.r*0.5" fill="#d9d0c0" opacity="0.35" />
          </g>
        </g>

        <!-- VENUS -->
        <g v-else-if="realKey==='venus'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#venus-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`" opacity="0.55">
            <path v-for="(d, i) in venusBands" :key="i" :d="d" fill="none" stroke="#f8e0a8" stroke-width="3" opacity="0.7" />
          </g>
        </g>

        <!-- EARTH -->
        <g v-else-if="realKey==='earth'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#earth-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`">
            <!-- Continents (stylized silhouettes) -->
            <path :d="earthContinents.africa" fill="#3d8b3d" opacity="0.9" />
            <path :d="earthContinents.americas" fill="#4a9a4a" opacity="0.9" />
            <path :d="earthContinents.asia" fill="#3d8b3d" opacity="0.85" />
            <!-- Polar ice -->
            <ellipse :cx="CX" :cy="CY-R*0.9" :rx="R*0.7" :ry="R*0.15" fill="#f0f6ff" opacity="0.8" />
            <ellipse :cx="CX" :cy="CY+R*0.9" :rx="R*0.5" :ry="R*0.1"  fill="#f0f6ff" opacity="0.7" />
            <!-- Clouds -->
            <g opacity="0.5">
              <ellipse :cx="CX-R*0.3" :cy="CY-R*0.2" :rx="R*0.35" :ry="R*0.1" fill="#fff" transform="rotate(-15)" />
              <ellipse :cx="CX+R*0.2" :cy="CY+R*0.3" :rx="R*0.3" :ry="R*0.08" fill="#fff" transform="rotate(10)" />
            </g>
          </g>
        </g>

        <!-- MOON -->
        <g v-else-if="realKey==='moon'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#moon-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`">
            <!-- Maria (dark patches) -->
            <ellipse :cx="CX-R*0.15" :cy="CY-R*0.25" :rx="R*0.35" :ry="R*0.28" fill="#6d6659" opacity="0.55" />
            <ellipse :cx="CX+R*0.3" :cy="CY-R*0.05" :rx="R*0.22" :ry="R*0.18" fill="#5a5449" opacity="0.5" />
            <ellipse :cx="CX-R*0.1" :cy="CY+R*0.35" :rx="R*0.3" :ry="R*0.15" fill="#6d6659" opacity="0.55" />
            <!-- Craters -->
            <g>
              <circle v-for="c in moonCraters" :key="c.k" :cx="CX+c.x" :cy="CY+c.y" :r="c.r" fill="#4a443a" opacity="0.5" />
              <circle v-for="c in moonCraters" :key="'h'+c.k" :cx="CX+c.x-c.r*0.25" :cy="CY+c.y-c.r*0.25" :r="c.r*0.55" fill="#e8e2d3" opacity="0.5" />
            </g>
          </g>
        </g>

        <!-- MARS -->
        <g v-else-if="realKey==='mars'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#mars-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`">
            <!-- Dark surface regions -->
            <ellipse :cx="CX-R*0.2" :cy="CY+R*0.1" :rx="R*0.45" :ry="R*0.2" fill="#7a2606" opacity="0.55" transform="rotate(-15)" />
            <ellipse :cx="CX+R*0.3" :cy="CY-R*0.15" :rx="R*0.3" :ry="R*0.15" fill="#8a2f08" opacity="0.5" />
            <ellipse :cx="CX+R*0.1" :cy="CY+R*0.4" :rx="R*0.25" :ry="R*0.1" fill="#6a1e04" opacity="0.5" />
            <!-- Polar caps -->
            <ellipse :cx="CX" :cy="CY-R*0.88" :rx="R*0.4" :ry="R*0.12" fill="#fff5ee" opacity="0.9" />
            <ellipse :cx="CX-R*0.1" :cy="CY+R*0.85" :rx="R*0.25" :ry="R*0.08" fill="#fff5ee" opacity="0.75" />
          </g>
        </g>

        <!-- JUPITER -->
        <g v-else-if="realKey==='jupiter'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#jupiter-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`">
            <!-- Horizontal cloud bands -->
            <rect :x="CX-R" :y="CY-R*0.85" :width="R*2" :height="R*0.18" fill="#d8b689" opacity="0.6" />
            <rect :x="CX-R" :y="CY-R*0.55" :width="R*2" :height="R*0.14" fill="#8f5b32" opacity="0.55" />
            <rect :x="CX-R" :y="CY-R*0.3"  :width="R*2" :height="R*0.22" fill="#e8caa0" opacity="0.5" />
            <rect :x="CX-R" :y="CY-R*0.05" :width="R*2" :height="R*0.12" fill="#a06834" opacity="0.55" />
            <rect :x="CX-R" :y="CY+R*0.15" :width="R*2" :height="R*0.2"  fill="#d8b689" opacity="0.5" />
            <rect :x="CX-R" :y="CY+R*0.45" :width="R*2" :height="R*0.14" fill="#7a4c26" opacity="0.55" />
            <rect :x="CX-R" :y="CY+R*0.7"  :width="R*2" :height="R*0.16" fill="#c39866" opacity="0.5" />
            <!-- Great Red Spot -->
            <ellipse :cx="CX+R*0.25" :cy="CY+R*0.22" :rx="R*0.2" :ry="R*0.11" fill="#c14a1a" opacity="0.85" />
            <ellipse :cx="CX+R*0.25" :cy="CY+R*0.22" :rx="R*0.14" :ry="R*0.07" fill="#e07040" opacity="0.7" />
          </g>
        </g>

        <!-- SATURN -->
        <g v-else-if="realKey==='saturn'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#saturn-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`" opacity="0.5">
            <rect :x="CX-R" :y="CY-R*0.6" :width="R*2" :height="R*0.15" fill="#c99c62" />
            <rect :x="CX-R" :y="CY-R*0.2" :width="R*2" :height="R*0.2"  fill="#e6c98e" />
            <rect :x="CX-R" :y="CY+R*0.2" :width="R*2" :height="R*0.18" fill="#b48250" />
            <rect :x="CX-R" :y="CY+R*0.55":width="R*2" :height="R*0.15" fill="#e6c98e" />
          </g>
        </g>

        <!-- URANUS -->
        <g v-else-if="realKey==='uranus'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#uranus-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`" opacity="0.35">
            <ellipse :cx="CX" :cy="CY" :rx="R*0.9" :ry="R*0.35" fill="#5fb0b6" transform="rotate(60)" />
          </g>
        </g>

        <!-- NEPTUNE -->
        <g v-else-if="realKey==='neptune'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#neptune-body-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`">
            <ellipse :cx="CX-R*0.15" :cy="CY-R*0.1" :rx="R*0.22" :ry="R*0.13" fill="#0a1d5c" opacity="0.7" />
            <path :d="`M ${CX-R*0.9} ${CY+R*0.2} Q ${CX} ${CY+R*0.05} ${CX+R*0.9} ${CY+R*0.3}`" fill="none" stroke="#a5d0ff" stroke-width="2" opacity="0.5" />
            <path :d="`M ${CX-R*0.9} ${CY-R*0.3} Q ${CX} ${CY-R*0.45} ${CX+R*0.9} ${CY-R*0.2}`" fill="none" stroke="#a5d0ff" stroke-width="1.5" opacity="0.4" />
          </g>
        </g>

        <!-- GENERIC (fallback for satellites/dwarf planets) -->
        <g v-else>
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#grad-${uid})`" />
          <g :clip-path="`url(#clip-${uid})`" opacity="0.4">
            <g v-if="pattern === 'bands'">
              <ellipse v-for="(b,i) in bands" :key="i" :cx="CX" :cy="CY + b.y" :rx="R" :ry="b.h" :fill="usedTheme.b" :opacity="b.o" />
            </g>
            <g v-else-if="pattern === 'craters'">
              <circle v-for="(c,i) in craters" :key="i" :cx="CX + c.x" :cy="CY + c.y" :r="c.r" :fill="usedTheme.b" :opacity="c.o" />
              <circle v-for="(c,i) in craters" :key="'h'+i" :cx="CX + c.x - c.r*0.3" :cy="CY + c.y - c.r*0.3" :r="c.r * 0.5" fill="#fff" :opacity="c.o * 0.4" />
            </g>
            <g v-else-if="pattern === 'swirl'">
              <path v-for="(s,i) in swirls" :key="i" :d="s" fill="none" :stroke="usedTheme.b" stroke-width="2" opacity="0.6" />
            </g>
          </g>
        </g>

        <!-- shadow & highlight (skip for Sun) -->
        <template v-if="realKey !== 'sun'">
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#shade-${uid})`" />
          <circle :cx="CX" :cy="CY" :r="R" :fill="`url(#high-${uid})`" />
        </template>
      </g>

      <!-- Saturn front ring -->
      <g v-if="realKey==='saturn'" :transform="`rotate(-22 ${CX} ${CY})`">
        <path :d="`M ${CX - R*1.9} ${CY} A ${R*1.9} ${R*0.45} 0 0 0 ${CX + R*1.9} ${CY}`" fill="none" stroke="#f0d9a8" stroke-width="4" opacity="0.95" />
        <path :d="`M ${CX - R*1.7} ${CY} A ${R*1.7} ${R*0.4}  0 0 0 ${CX + R*1.7} ${CY}`" fill="none" stroke="#d0a570" stroke-width="8" opacity="0.6" />
        <path :d="`M ${CX - R*2.15} ${CY} A ${R*2.15} ${R*0.5} 0 0 0 ${CX + R*2.15} ${CY}`" fill="none" stroke="#b18a4a" stroke-width="1.5" opacity="0.55" />
      </g>
      <!-- Uranus front ring -->
      <g v-if="realKey==='uranus'" :transform="`rotate(85 ${CX} ${CY})`">
        <path :d="`M ${CX - R*1.6} ${CY} A ${R*1.6} ${R*0.28} 0 0 0 ${CX + R*1.6} ${CY}`" fill="none" stroke="#c5f0f4" stroke-width="1.5" opacity="0.8" />
      </g>

      <!-- Generic ring front half -->
      <g v-if="!realKey && hasRing" :transform="`rotate(${ringTilt} ${CX} ${CY})`">
        <path :d="`M ${CX - R*1.55} ${CY} A ${R*1.55} ${R*0.42} 0 0 0 ${CX + R*1.55} ${CY}`" fill="none" :stroke="usedTheme.ring" stroke-width="3" opacity="0.9" />
      </g>

      <!-- Sun's flares (drawn on top) -->
      <g v-if="realKey==='sun'" class="sun-flares">
        <g v-for="(a, i) in sunFlares" :key="i" :transform="`rotate(${a} ${CX} ${CY})`">
          <path :d="`M ${CX} ${CY-R*1.02} L ${CX-R*0.06} ${CY-R*1.25} L ${CX+R*0.06} ${CY-R*1.25} Z`" fill="#ffd83b" opacity="0.7" />
        </g>
      </g>
    </svg>
    <div class="planet-name" :class="{ highlight: highlight }">{{ name }}</div>
  </div>
</template>

<script>
// Map both zh & en names → realistic key
const REAL_KEYS = {
  '太阳':'sun', 'Sun':'sun',
  '水星':'mercury', 'Mercury':'mercury',
  '金星':'venus', 'Venus':'venus',
  '地球':'earth', 'Earth':'earth',
  '月球':'moon', 'Moon':'moon',
  '火星':'mars', 'Mars':'mars',
  '木星':'jupiter', 'Jupiter':'jupiter',
  '土星':'saturn', 'Saturn':'saturn',
  '天王星':'uranus', 'Uranus':'uranus',
  '海王星':'neptune', 'Neptune':'neptune',
}
// Preset themes for other solar bodies so their generic renders are recognizable
const BODY_THEMES = {
  '冥王星': { a:'#e7c8a3', b:'#7a4a2a', ring:'#f0d3b0', glow:'#e7c8a3' }, 'Pluto': { a:'#e7c8a3', b:'#7a4a2a', ring:'#f0d3b0', glow:'#e7c8a3' },
  '谷神星': { a:'#a89f92', b:'#544d43', ring:'#c5bcb0', glow:'#a89f92' }, 'Ceres': { a:'#a89f92', b:'#544d43', ring:'#c5bcb0', glow:'#a89f92' },
  '阋神星': { a:'#e0e6ee', b:'#7d8898', ring:'#eef3fa', glow:'#e0e6ee' }, 'Eris': { a:'#e0e6ee', b:'#7d8898', ring:'#eef3fa', glow:'#e0e6ee' },
  '鸟神星': { a:'#c9967a', b:'#5a3620', ring:'#dfb695', glow:'#c9967a' }, 'Makemake': { a:'#c9967a', b:'#5a3620', ring:'#dfb695', glow:'#c9967a' },
  '妊神星': { a:'#dcd0b6', b:'#7a6a4e', ring:'#eee2c9', glow:'#dcd0b6' }, 'Haumea': { a:'#dcd0b6', b:'#7a6a4e', ring:'#eee2c9', glow:'#dcd0b6' },
  '木卫一': { a:'#ffe066', b:'#a86e14', ring:'#fff2a8', glow:'#ffe066' }, 'Io': { a:'#ffe066', b:'#a86e14', ring:'#fff2a8', glow:'#ffe066' },
  '木卫二': { a:'#f0e0c8', b:'#8a6a3a', ring:'#f8e8d0', glow:'#f0e0c8' }, 'Europa': { a:'#f0e0c8', b:'#8a6a3a', ring:'#f8e8d0', glow:'#f0e0c8' },
  '木卫三': { a:'#a49080', b:'#443830', ring:'#c0ac9a', glow:'#a49080' }, 'Ganymede': { a:'#a49080', b:'#443830', ring:'#c0ac9a', glow:'#a49080' },
  '土卫六': { a:'#e6a45c', b:'#5a3210', ring:'#f6c48a', glow:'#e6a45c' }, 'Titan': { a:'#e6a45c', b:'#5a3210', ring:'#f6c48a', glow:'#e6a45c' },
  '土卫二': { a:'#eef8ff', b:'#7fa8c8', ring:'#ffffff', glow:'#eef8ff' }, 'Enceladus': { a:'#eef8ff', b:'#7fa8c8', ring:'#ffffff', glow:'#eef8ff' },
  '火卫一': { a:'#8b7a6a', b:'#3d342a', ring:'#a89685', glow:'#8b7a6a' }, 'Phobos': { a:'#8b7a6a', b:'#3d342a', ring:'#a89685', glow:'#8b7a6a' },
  '海卫一': { a:'#cbb8e8', b:'#5a4680', ring:'#e0d0f0', glow:'#cbb8e8' }, 'Triton': { a:'#cbb8e8', b:'#5a4680', ring:'#e0d0f0', glow:'#cbb8e8' },
  '土卫一': { a:'#c2bcb2', b:'#4a4238', ring:'#d8d0c0', glow:'#c2bcb2' }, 'Mimas': { a:'#c2bcb2', b:'#4a4238', ring:'#d8d0c0', glow:'#c2bcb2' },
  '土卫五': { a:'#d0c8b8', b:'#5c5040', ring:'#e0d8c8', glow:'#d0c8b8' }, 'Rhea': { a:'#d0c8b8', b:'#5c5040', ring:'#e0d8c8', glow:'#d0c8b8' },
}

let _uid = 0
export default {
  name: 'Planet',
  props: {
    name: String,
    theme: Object,
    seed: { type: Number, default: 0 },
    highlight: Boolean,
    state: { type: String, default: '' },
    disabled: Boolean,
    scale: { type: Number, default: 1 }
  },
  data() {
    const uid = ++_uid
    const rng = mulberry32(this.seed * 9973 + uid * 131)
    const hasRing = rng() < 0.25
    const ringTilt = -30 + rng() * 60
    const patterns = ['bands', 'craters', 'swirl']
    const pattern = patterns[Math.floor(rng() * patterns.length)]
    const SIZE = 240
    const CX = 120, CY = 120, R = 68
    const bands = []
    for (let i = 0; i < 4; i++) bands.push({ y: -R + rng() * R * 2, h: 3 + rng() * 8, o: 0.3 + rng() * 0.4 })
    const craters = []
    for (let i = 0; i < 6; i++) {
      const ang = rng() * Math.PI * 2
      const rr = rng() * R * 0.75
      craters.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr, r: 3 + rng() * 7, o: 0.4 + rng() * 0.4 })
    }
    const swirls = []
    for (let i = 0; i < 3; i++) {
      const y = -R * 0.6 + i * R * 0.4 + rng() * 6
      const amp = 6 + rng() * 8
      swirls.push(`M ${CX - R * 0.9} ${CY + y} Q ${CX - R * 0.4} ${CY + y - amp}, ${CX} ${CY + y} T ${CX + R * 0.9} ${CY + y}`)
    }
    // Realistic details
    const sunSpots = []
    for (let i = 0; i < 6; i++) {
      const ang = rng() * Math.PI * 2, rr = rng() * R * 0.7
      sunSpots.push({ k: i, x: Math.cos(ang)*rr, y: Math.sin(ang)*rr, r: 3 + rng()*6 })
    }
    const sunFlares = [0, 45, 90, 135, 180, 225, 270, 315]
    const mercuryCraters = []
    for (let i = 0; i < 14; i++) {
      const ang = rng()*Math.PI*2, rr = rng()*R*0.85
      mercuryCraters.push({ k:i, x:Math.cos(ang)*rr, y:Math.sin(ang)*rr, r: 2 + rng()*6 })
    }
    const moonCraters = []
    for (let i = 0; i < 12; i++) {
      const ang = rng()*Math.PI*2, rr = rng()*R*0.85
      moonCraters.push({ k:i, x:Math.cos(ang)*rr, y:Math.sin(ang)*rr, r: 2 + rng()*5 })
    }
    const venusBands = []
    for (let i = 0; i < 5; i++) {
      const y = -R*0.7 + i * R*0.35
      venusBands.push(`M ${CX-R*0.95} ${CY+y} Q ${CX} ${CY+y - 8 + rng()*8} ${CX+R*0.95} ${CY+y+2}`)
    }
    const earthContinents = {
      // Stylized: Africa/Europe left, Asia right-top, Americas
      africa: `M ${CX-R*0.15} ${CY-R*0.3} Q ${CX-R*0.05} ${CY-R*0.05} ${CX-R*0.1} ${CY+R*0.2} Q ${CX-R*0.02} ${CY+R*0.45} ${CX-R*0.2} ${CY+R*0.55} Q ${CX-R*0.35} ${CY+R*0.3} ${CX-R*0.3} ${CY} Q ${CX-R*0.35} ${CY-R*0.25} ${CX-R*0.15} ${CY-R*0.3} Z`,
      americas: `M ${CX-R*0.65} ${CY-R*0.4} Q ${CX-R*0.5} ${CY-R*0.2} ${CX-R*0.55} ${CY+R*0.1} Q ${CX-R*0.4} ${CY+R*0.4} ${CX-R*0.5} ${CY+R*0.65} Q ${CX-R*0.7} ${CY+R*0.5} ${CX-R*0.72} ${CY+R*0.15} Q ${CX-R*0.78} ${CY-R*0.2} ${CX-R*0.65} ${CY-R*0.4} Z`,
      asia: `M ${CX+R*0.05} ${CY-R*0.5} Q ${CX+R*0.4} ${CY-R*0.4} ${CX+R*0.55} ${CY-R*0.15} Q ${CX+R*0.4} ${CY+R*0.05} ${CX+R*0.2} ${CY-R*0.05} Q ${CX+R*0.05} ${CY-R*0.15} ${CX+R*0.05} ${CY-R*0.5} Z`
    }
    return {
      uid, hasRing, ringTilt, pattern, bands, craters, swirls, SIZE, CX, CY, R,
      sunSpots, sunFlares, mercuryCraters, moonCraters, venusBands, earthContinents
    }
  },
  computed: {
    realKey() { return REAL_KEYS[this.name] || null },
    usedTheme() {
      // Prefer name-specific theme so satellites/dwarf planets look distinct.
      const t = BODY_THEMES[this.name]
      if (t) return t
      if (this.theme) return this.theme
      return { a:'#7fb0ff', b:'#2a3e9a', ring:'#a5c8ff', glow:'#7fb0ff' }
    },
    wrapStyle() {
      return {
        '--planet-scale': this.scale,
        '--glow-color': this.realKey === 'sun' ? '#ffd83b' : this.usedTheme.glow
      }
    }
  },
  methods: {
    onClick() { if (!this.disabled) this.$emit('click') }
  }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = a
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Provide themes to other modules if needed
export { BODY_THEMES, REAL_KEYS }
</script>

<style scoped>
.planet-wrap {
  position: absolute;
  transform: translate(-50%, -50%) scale(var(--planet-scale, 1));
  transform-origin: center;
  cursor: pointer;
  user-select: none;
  transition: filter .25s ease, transform .3s cubic-bezier(.34,1.56,.64,1);
  z-index: 2;
}
.planet-wrap.hoverable:hover {
  transform: translate(-50%, -50%) scale(calc(var(--planet-scale, 1) * 1.08));
  filter: brightness(1.15);
}
.planet-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
  animation: floaty 6s ease-in-out infinite;
}
.planet-wrap:nth-child(2n) .planet-svg { animation-duration: 7.5s; animation-delay: -1s; }
.planet-wrap:nth-child(3n) .planet-svg { animation-duration: 8.5s; animation-delay: -3s; }
@keyframes floaty {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.aura { animation: pulse 3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
.aura2 { animation: pulse 3.5s ease-in-out infinite reverse; transform-origin: center; transform-box: fill-box; }
@keyframes pulse {
  0%,100% { opacity: 0.1; }
  50% { opacity: 0.28; }
}
.sun-corona-1 { animation: coronaPulse 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
.sun-corona-2 { animation: coronaPulse 3s ease-in-out infinite reverse; transform-origin: center; transform-box: fill-box; }
.sun-corona-3 { animation: coronaPulse 2.2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
@keyframes coronaPulse {
  0%,100% { opacity: 0.15; }
  50% { opacity: 0.4; }
}
.sun-flares { animation: sunSpin 20s linear infinite; transform-origin: center; transform-box: fill-box; }
@keyframes sunSpin { to { transform: rotate(360deg); } }

.planet-name {
  position: absolute;
  left: 50%;
  bottom: -0.2em;
  transform: translateX(-50%);
  color: #f4f8ff;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 1.05em;
  letter-spacing: 0.06em;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(10, 15, 40, 0.75);
  border: 1.5px solid rgba(140, 180, 255, 0.5);
  backdrop-filter: blur(6px);
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(120, 180, 255, 0.7);
  transition: all .3s;
}
.planet-name.highlight {
  color: #fff;
  background: rgba(255, 220, 120, 0.2);
  border-color: rgba(255, 220, 120, 0.8);
  text-shadow: 0 0 14px rgba(255, 220, 120, 0.95);
}

.planet-wrap.target .planet-svg {
  filter: drop-shadow(0 0 22px var(--glow-color, #ffd43b));
}
.planet-wrap.correct .planet-svg {
  animation: correctPop .55s cubic-bezier(.34,1.56,.64,1);
  filter: drop-shadow(0 0 30px #51cf66);
}
.planet-wrap.wrong .planet-svg {
  animation: wrongShake .5s;
  filter: drop-shadow(0 0 30px #ff6b6b);
}
@keyframes correctPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@keyframes wrongShake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
</style>
