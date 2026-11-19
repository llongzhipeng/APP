<template>
  <svg :viewBox="`0 0 1600 900`" preserveAspectRatio="xMidYMid meet" class="kitchen-svg">
    <defs>
      <!-- =========== WALL / CEILING =========== -->
      <linearGradient id="ceilG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#efe6d1"/>
        <stop offset="100%" stop-color="#d9cba9"/>
      </linearGradient>
      <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#efe1c3"/>
        <stop offset="55%" stop-color="#e6d3ac"/>
        <stop offset="100%" stop-color="#c8b587"/>
      </linearGradient>
      <radialGradient id="ceilLight" cx="50%" cy="0%" r="60%">
        <stop offset="0%" stop-color="#fff4d6" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#fff4d6" stop-opacity="0"/>
      </radialGradient>

      <!-- =========== FLOOR (parquet planks) =========== -->
      <linearGradient id="plankBase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a37f56"/>
        <stop offset="100%" stop-color="#6c4e30"/>
      </linearGradient>
      <pattern id="woodFloor" x="0" y="0" width="200" height="70" patternUnits="userSpaceOnUse">
        <rect width="200" height="70" fill="url(#plankBase)"/>
        <!-- plank seams -->
        <line x1="0" y1="0" x2="0" y2="70" stroke="#2b1a0c" stroke-width="1" opacity="0.7"/>
        <line x1="100" y1="0" x2="100" y2="70" stroke="#2b1a0c" stroke-width="1" opacity="0.7"/>
        <line x1="0" y1="35" x2="200" y2="35" stroke="#3a2614" stroke-width="0.6" opacity="0.6"/>
        <!-- grain -->
        <path d="M0 12 Q40 8 80 14 T160 12 T200 14" stroke="#5b3d24" stroke-width="0.5" fill="none" opacity="0.55"/>
        <path d="M0 22 Q50 25 100 20 T200 22" stroke="#4a2f1c" stroke-width="0.4" fill="none" opacity="0.5"/>
        <path d="M0 48 Q45 46 90 50 T200 48" stroke="#3a2416" stroke-width="0.5" fill="none" opacity="0.55"/>
        <path d="M0 58 Q35 62 70 58 T200 60" stroke="#4a3020" stroke-width="0.4" fill="none" opacity="0.5"/>
        <!-- knots -->
        <ellipse cx="60" cy="18" rx="4" ry="2" fill="#3a2410" opacity="0.55"/>
        <ellipse cx="150" cy="52" rx="5" ry="2.5" fill="#3a2410" opacity="0.55"/>
      </pattern>
      <linearGradient id="floorHaze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>

      <!-- =========== MARBLE COUNTERTOP =========== -->
      <linearGradient id="marbleBase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f5efe4"/>
        <stop offset="50%" stop-color="#e6dcc7"/>
        <stop offset="100%" stop-color="#c8bda2"/>
      </linearGradient>
      <pattern id="marble" x="0" y="0" width="400" height="180" patternUnits="userSpaceOnUse">
        <rect width="400" height="180" fill="url(#marbleBase)"/>
        <!-- veins -->
        <path d="M0 40 Q80 60 150 30 T290 50 T400 40" stroke="#8c7a5a" stroke-width="1" fill="none" opacity="0.45"/>
        <path d="M0 90 Q120 100 200 80 T400 100" stroke="#7a6a4a" stroke-width="0.7" fill="none" opacity="0.4"/>
        <path d="M20 140 Q100 130 200 150 T400 135" stroke="#9a8768" stroke-width="0.8" fill="none" opacity="0.35"/>
        <path d="M60 10 Q90 40 130 25 Q170 10 210 30" stroke="#6b5a3f" stroke-width="0.5" fill="none" opacity="0.35"/>
        <!-- specks -->
        <circle cx="70" cy="70" r="1.2" fill="#5a4a30" opacity="0.5"/>
        <circle cx="180" cy="110" r="1" fill="#5a4a30" opacity="0.5"/>
        <circle cx="290" cy="30" r="1.4" fill="#5a4a30" opacity="0.5"/>
        <circle cx="330" cy="140" r="1" fill="#5a4a30" opacity="0.5"/>
        <circle cx="380" cy="80" r="1.2" fill="#5a4a30" opacity="0.5"/>
      </pattern>

      <!-- =========== CABINET (raised panel) =========== -->
      <linearGradient id="cabWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e4cea1"/>
        <stop offset="50%" stop-color="#c9ac74"/>
        <stop offset="100%" stop-color="#8f6d3f"/>
      </linearGradient>
      <linearGradient id="cabHi" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f2e0b8"/>
        <stop offset="100%" stop-color="#c8a878"/>
      </linearGradient>

      <!-- =========== STAINLESS STEEL (brushed) =========== -->
      <linearGradient id="steelV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f2f5f9"/>
        <stop offset="30%" stop-color="#b7c0cc"/>
        <stop offset="70%" stop-color="#8892a1"/>
        <stop offset="100%" stop-color="#4b5561"/>
      </linearGradient>
      <linearGradient id="steelH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a8b2be"/>
        <stop offset="50%" stop-color="#eef2f7"/>
        <stop offset="100%" stop-color="#77808d"/>
      </linearGradient>
      <pattern id="brushed" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="url(#steelV)"/>
        <line x1="0" y1="1" x2="4" y2="1" stroke="#ffffff" stroke-width="0.3" opacity="0.25"/>
        <line x1="0" y1="3" x2="4" y2="3" stroke="#000" stroke-width="0.3" opacity="0.15"/>
      </pattern>

      <!-- =========== TILE BACKSPLASH =========== -->
      <linearGradient id="tileFace" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbf6e8"/>
        <stop offset="100%" stop-color="#e8dcbb"/>
      </linearGradient>
      <pattern id="tile" x="0" y="0" width="90" height="46" patternUnits="userSpaceOnUse">
        <rect width="90" height="46" fill="#b09975"/>
        <rect x="1" y="1" width="42" height="20" fill="url(#tileFace)"/>
        <rect x="45" y="1" width="42" height="20" fill="url(#tileFace)"/>
        <rect x="22" y="24" width="42" height="20" fill="url(#tileFace)"/>
        <rect x="-20" y="24" width="42" height="20" fill="url(#tileFace)"/>
        <rect x="66" y="24" width="42" height="20" fill="url(#tileFace)"/>
        <!-- subtle top highlight on each tile -->
        <rect x="1" y="1" width="42" height="3" fill="#fff" opacity="0.4"/>
        <rect x="45" y="1" width="42" height="3" fill="#fff" opacity="0.4"/>
      </pattern>

      <!-- =========== FLAME =========== -->
      <radialGradient id="flame" cx="50%" cy="80%" r="65%">
        <stop offset="0%" stop-color="#fff2a8"/>
        <stop offset="40%" stop-color="#ffb84d"/>
        <stop offset="85%" stop-color="#ff4820"/>
        <stop offset="100%" stop-color="#7a1a00" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="flameCore" cx="50%" cy="90%" r="50%">
        <stop offset="0%" stop-color="#fff9d6"/>
        <stop offset="100%" stop-color="#ffdd85" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="burnerBlue" cx="50%" cy="60%" r="55%">
        <stop offset="0%" stop-color="#e6f2ff"/>
        <stop offset="40%" stop-color="#78c0ff"/>
        <stop offset="80%" stop-color="#3a78d0" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#1a3a80" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="gasGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c7e8ff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#5aa6ff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff7c7"/>
        <stop offset="60%" stop-color="#ffd23a" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#ff7a00" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#bde5ff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#4fa4e0" stop-opacity="0"/>
      </radialGradient>

      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="strongGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="9" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="0" dy="4"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>

      <!-- Flame path (base at 0,0 pointing up: extends into -y). Used via <use/>. -->
      <symbol id="flameShape" overflow="visible">
        <path d="M-22 0 Q-18 -22 -8 -30 Q0 -46 8 -30 Q18 -22 22 0 Q10 -8 0 4 Q-10 -8 -22 0 Z" fill="url(#flame)"/>
        <path d="M-11 -2 Q-8 -14 0 -22 Q8 -14 11 -2 Q6 -6 0 2 Q-6 -6 -11 -2 Z" fill="url(#flameCore)"/>
      </symbol>
    </defs>

    <!-- =========== CEILING & WALL =========== -->
    <rect x="0" y="0" width="1600" height="70" fill="url(#ceilG)"/>
    <rect x="0" y="70" width="1600" height="10" fill="#c9b98d"/>
    <rect x="0" y="80" width="1600" height="500" fill="url(#wallGrad)"/>
    <!-- ambient wall light bloom under ceiling -->
    <rect x="0" y="80" width="1600" height="220" fill="url(#ceilLight)"/>
    <!-- Recessed ceiling lights -->
    <g v-for="i in 5" :key="'cl'+i">
      <circle :cx="200 + (i-1)*300" cy="40" r="14" fill="#0a0a0a"/>
      <circle :cx="200 + (i-1)*300" cy="40" r="10" fill="#fff9d6"/>
      <ellipse :cx="200 + (i-1)*300" cy="90" rx="80" ry="20" fill="#fff9d6" opacity="0.15"/>
    </g>

    <!-- =========== FLOOR =========== -->
    <rect x="0" y="580" width="1600" height="320" fill="url(#woodFloor)"/>
    <rect x="0" y="580" width="1600" height="60" fill="url(#floorHaze)"/>
    <!-- baseboard -->
    <rect x="0" y="580" width="1600" height="8" fill="#3a2614"/>
    <rect x="0" y="588" width="1600" height="4" fill="#5a3c22"/>

    <!-- =========== BACKSPLASH TILE =========== -->
    <rect x="0" y="410" width="1600" height="170" fill="url(#tile)"/>
    <!-- top/bottom edges for depth -->
    <rect x="0" y="408" width="1600" height="4" fill="#8a7554"/>
    <rect x="0" y="576" width="1600" height="4" fill="#5a4830"/>

    <!-- =========== WINDOW =========== -->
    <g filter="url(#dropShadow)">
      <rect x="90" y="130" width="380" height="250" fill="#6b4a2a"/>
      <rect x="102" y="142" width="356" height="226" fill="#d8ebfb"/>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#bfdcf5"/>
        <stop offset="70%" stop-color="#e7f2fb"/>
        <stop offset="100%" stop-color="#f8f2e0"/>
      </linearGradient>
      <rect x="102" y="142" width="356" height="226" fill="url(#skyG)"/>
      <!-- distant hills -->
      <path d="M102 300 Q200 250 290 280 T458 275 L458 368 L102 368 Z" fill="#9dc199" opacity="0.65"/>
      <path d="M102 322 Q220 288 320 310 T458 308 L458 368 L102 368 Z" fill="#6ea068" opacity="0.85"/>
      <!-- clouds -->
      <g opacity="0.9">
        <ellipse cx="210" cy="180" rx="34" ry="9" fill="#fff"/>
        <ellipse cx="240" cy="175" rx="26" ry="8" fill="#fff"/>
        <ellipse cx="360" cy="200" rx="30" ry="8" fill="#fff"/>
      </g>
      <!-- sun -->
      <circle cx="400" cy="180" r="20" fill="#ffe9a0"/>
      <circle cx="400" cy="180" r="30" fill="#ffe9a0" opacity="0.35"/>
      <!-- mullions -->
      <rect x="278" y="142" width="6" height="226" fill="#6b4a2a"/>
      <rect x="102" y="252" width="356" height="6" fill="#6b4a2a"/>
      <!-- frame edges -->
      <rect x="90" y="130" width="380" height="12" fill="#4d3218"/>
      <rect x="90" y="368" width="380" height="12" fill="#4d3218"/>
      <!-- window sill -->
      <rect x="80" y="380" width="400" height="14" fill="#e0d5b8"/>
      <rect x="80" y="394" width="400" height="6" fill="#a89571"/>
    </g>
    <!-- Potted plant on sill -->
    <g transform="translate(140,340)">
      <path d="M-14 40 L14 40 L18 62 L-18 62 Z" fill="#8a5230"/>
      <ellipse cx="0" cy="40" rx="14" ry="4" fill="#5a3418"/>
      <!-- leaves -->
      <path d="M0 40 Q-25 25 -30 -5 Q-15 0 -8 25 Z" fill="#3b7a3f"/>
      <path d="M0 40 Q25 22 32 -8 Q18 -3 8 25 Z" fill="#4a8f4a"/>
      <path d="M0 40 Q-6 5 4 -18 Q10 0 6 30 Z" fill="#57a558"/>
    </g>

    <!-- =========== WALL CLOCK =========== -->
    <g transform="translate(560,180)" filter="url(#dropShadow)">
      <circle r="46" fill="#f7efdc" stroke="#5a3f1e" stroke-width="4"/>
      <circle r="46" fill="none" stroke="#fff" stroke-width="1" opacity="0.6"/>
      <g v-for="n in 12" :key="'c'+n" :transform="`rotate(${n*30})`">
        <rect x="-1.5" y="-44" width="3" height="8" fill="#2a1a08"/>
      </g>
      <line x1="0" y1="0" x2="0" y2="-30" stroke="#2a1a08" stroke-width="3" stroke-linecap="round" transform="rotate(45)"/>
      <line x1="0" y1="0" x2="0" y2="-20" stroke="#2a1a08" stroke-width="4" stroke-linecap="round" transform="rotate(120)"/>
      <circle r="4" fill="#c4402a"/>
    </g>

    <!-- =========== SPICE RACK =========== -->
    <g transform="translate(680,300)">
      <rect x="0" y="0" width="220" height="88" fill="#6b4a2a" filter="url(#dropShadow)"/>
      <rect x="4" y="4" width="212" height="40" fill="#3a2614"/>
      <rect x="4" y="48" width="212" height="36" fill="#3a2614"/>
      <!-- jars -->
      <g v-for="i in 6" :key="'sj1'+i">
        <rect :x="10 + (i-1)*35" y="10" width="24" height="28" rx="3" fill="#e8dcbb"/>
        <rect :x="10 + (i-1)*35" y="10" width="24" height="4" fill="#8a5230"/>
        <rect :x="14 + (i-1)*35" y="18" width="16" height="18" :fill="['#c4402a','#e2b04a','#8a5230','#5a7a3a','#c4402a','#e2b04a'][i-1]"/>
      </g>
      <g v-for="i in 6" :key="'sj2'+i">
        <rect :x="10 + (i-1)*35" y="52" width="24" height="28" rx="3" fill="#e8dcbb"/>
        <rect :x="10 + (i-1)*35" y="52" width="24" height="4" fill="#8a5230"/>
        <rect :x="14 + (i-1)*35" y="60" width="16" height="18" :fill="['#5a7a3a','#c4402a','#e2b04a','#8a5230','#3a2614','#c4402a'][i-1]"/>
      </g>
    </g>

    <!-- =========== RANGE HOOD =========== -->
    <g filter="url(#dropShadow)">
      <!-- trapezoid hood -->
      <path d="M740 90 L1060 90 L1100 240 L700 240 Z" fill="url(#steelV)" stroke="#4a5461" stroke-width="1.5"/>
      <!-- brushed sheen strip -->
      <path d="M760 100 L1040 100 L1070 220 L730 220 Z" fill="url(#brushed)" opacity="0.7"/>
      <!-- specular light -->
      <path d="M780 110 L820 110 L830 210 L790 210 Z" fill="#fff" opacity="0.15"/>
      <!-- lower box -->
      <rect x="720" y="240" width="360" height="46" fill="url(#steelH)" stroke="#4a5461" stroke-width="1.5"/>
      <!-- vents -->
      <g fill="#111" opacity="0.75">
        <rect x="740" y="248" width="70" height="4"/>
        <rect x="740" y="256" width="70" height="4"/>
        <rect x="740" y="264" width="70" height="4"/>
        <rect x="990" y="248" width="70" height="4"/>
        <rect x="990" y="256" width="70" height="4"/>
        <rect x="990" y="264" width="70" height="4"/>
      </g>
      <!-- control panel -->
      <rect x="830" y="252" width="140" height="24" rx="4" fill="#0f1114" stroke="#2a2f36"/>
      <circle cx="848" cy="264" r="4" fill="#7cf58a"/>
      <circle cx="875" cy="264" r="4" fill="#5eaee0"/>
      <circle cx="902" cy="264" r="4" fill="#f2b23a"/>
      <rect x="920" y="258" width="42" height="12" rx="2" fill="#1a1e24"/>
      <text x="941" y="268" text-anchor="middle" font-size="10" fill="#7cf58a" font-family="monospace">II</text>
      <!-- hood light glow onto stove -->
      <ellipse cx="900" cy="500" rx="220" ry="26" fill="#fff2c8" opacity="0.12"/>
    </g>

    <!-- =========== UPPER CABINETS =========== -->
    <g filter="url(#dropShadow)">
      <rect x="1120" y="130" width="440" height="250" fill="url(#cabWood)" stroke="#5a3f1e" stroke-width="2"/>
      <!-- doors: raised panel -->
      <g v-for="i in 2" :key="'ud'+i">
        <rect :x="1128 + (i-1)*216" y="138" width="208" height="234" fill="url(#cabWood)" stroke="#5a3f1e" stroke-width="1.2"/>
        <rect :x="1140 + (i-1)*216" y="150" width="184" height="210" fill="url(#cabHi)" stroke="#7a5a30" stroke-width="1"/>
        <rect :x="1148 + (i-1)*216" y="158" width="168" height="194" fill="url(#cabWood)" stroke="#8b6a3f" stroke-width="0.6"/>
        <!-- handle -->
        <rect :x="1225 + (i-1)*216" y="358" width="14" height="4" rx="1" fill="#2a1a08"/>
      </g>
    </g>

    <!-- =========== BASE COUNTER =========== -->
    <!-- top surface (marble) -->
    <rect x="60" y="580" width="1480" height="22" fill="url(#marble)" stroke="#8a7554" stroke-width="1"/>
    <rect x="60" y="580" width="1480" height="4" fill="#fff" opacity="0.5"/>
    <!-- front face of counter (dark cabinets) -->
    <linearGradient id="baseCab" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a3a3e"/>
      <stop offset="100%" stop-color="#141416"/>
    </linearGradient>
    <rect x="60" y="602" width="1480" height="180" fill="url(#baseCab)"/>
    <!-- Base cabinet doors -->
    <g stroke="#0a0a0a" stroke-width="1">
      <g v-for="i in 8" :key="'bd'+i">
        <rect :x="70 + (i-1)*185" y="612" width="170" height="160" fill="none" stroke="#0a0a0a"/>
        <rect :x="82 + (i-1)*185" y="624" width="146" height="136" fill="none" stroke="#2a2a2c" stroke-width="0.8"/>
        <!-- handle -->
        <rect :x="140 + (i-1)*185" y="626" width="34" height="4" rx="1" fill="#c0c8d2"/>
        <rect :x="140 + (i-1)*185" y="626" width="34" height="1" rx="1" fill="#fff" opacity="0.6"/>
      </g>
    </g>
    <!-- Counter under-shadow -->
    <rect x="60" y="600" width="1480" height="10" fill="#000" opacity="0.35"/>

    <!-- =========== SINK =========== -->
    <g filter="url(#dropShadow)">
      <rect x="230" y="558" width="240" height="60" rx="10" fill="#c9d1da"/>
      <rect x="242" y="566" width="216" height="44" rx="6" fill="#5b6674"/>
      <rect x="248" y="570" width="204" height="36" rx="4" fill="#404a58"/>
      <!-- water shimmer -->
      <ellipse cx="350" cy="586" rx="90" ry="7" fill="#7a8494" opacity="0.6"/>
      <ellipse cx="350" cy="590" rx="60" ry="4" fill="#a4adb9" opacity="0.5"/>
      <!-- drain -->
      <circle cx="350" cy="596" r="6" fill="#1a1e24"/>
      <circle cx="350" cy="596" r="3" fill="#0a0d12"/>
    </g>
    <!-- Faucet -->
    <g transform="translate(350,460)" filter="url(#dropShadow)">
      <rect x="-24" y="98" width="48" height="8" rx="2" fill="#8a94a0"/>
      <rect x="-8" y="10" width="16" height="90" rx="3" fill="url(#steelH)"/>
      <path d="M-8 26 Q-58 26 -58 68 L-46 68 Q-46 36 -8 36 Z" fill="url(#steelH)" stroke="#4a5461" stroke-width="0.5"/>
      <rect x="-66" y="66" width="24" height="12" rx="3" fill="#a2adb9"/>
      <rect x="-66" y="66" width="24" height="2" rx="1" fill="#fff" opacity="0.6"/>
      <!-- handles -->
      <ellipse cx="-30" cy="18" rx="10" ry="4" fill="#c9d1da"/>
      <rect x="-32" y="0" width="4" height="20" fill="#8a94a0"/>
      <ellipse cx="30" cy="18" rx="10" ry="4" fill="#c9d1da"/>
      <rect x="28" y="0" width="4" height="20" fill="#8a94a0"/>
    </g>

    <!-- =========== STOVE (glass-top with grates over) =========== -->
    <g filter="url(#dropShadow)">
      <!-- Control panel strip -->
      <rect x="720" y="582" width="380" height="34" fill="#1a1a1a" stroke="#000"/>
      <rect x="720" y="582" width="380" height="4" fill="#3a3a3a"/>
      <!-- knobs -->
      <g v-for="i in 4" :key="'kn'+i">
        <circle :cx="770 + (i-1)*90" cy="600" r="12" fill="#2a2a2a" stroke="#6a6a6a" stroke-width="1.2"/>
        <circle :cx="770 + (i-1)*90" cy="600" r="8" fill="url(#steelV)"/>
        <rect :x="769 + (i-1)*90" y="588" width="2" height="10" fill="#e0e0e0"/>
        <circle :cx="770 + (i-1)*90" cy="600" r="12" fill="none" stroke="#000" stroke-width="0.6" opacity="0.7"/>
      </g>
      <!-- glass hob body -->
      <rect x="724" y="616" width="372" height="150" rx="6" fill="#0e0e10" stroke="#000"/>
      <rect x="724" y="616" width="372" height="4" fill="#3a3a3a" opacity="0.8"/>
      <!-- burner rings (subtle) -->
      <g stroke="#6a6a6a" stroke-width="1.2" fill="none" opacity="0.6">
        <circle cx="820" cy="690" r="42"/>
        <circle cx="820" cy="690" r="28"/>
        <circle cx="1000" cy="690" r="42"/>
        <circle cx="1000" cy="690" r="28"/>
      </g>
      <!-- cast-iron grates (drawn as top view) -->
      <g fill="#111" stroke="#0a0a0a">
        <!-- left grate -->
        <g transform="translate(820,690)">
          <path d="M-46 0 L-14 -22 L14 -22 L46 0 L14 22 L-14 22 Z" fill="#1a1a1a" stroke="#000" stroke-width="1.2"/>
          <path d="M-46 0 L46 0 M0 -22 L0 22" stroke="#3a3a3a" stroke-width="3"/>
          <path d="M-32 -14 L32 14 M-32 14 L32 -14" stroke="#2a2a2a" stroke-width="2.5"/>
        </g>
        <!-- right grate -->
        <g transform="translate(1000,690)">
          <path d="M-46 0 L-14 -22 L14 -22 L46 0 L14 22 L-14 22 Z" fill="#1a1a1a" stroke="#000" stroke-width="1.2"/>
          <path d="M-46 0 L46 0 M0 -22 L0 22" stroke="#3a3a3a" stroke-width="3"/>
          <path d="M-32 -14 L32 14 M-32 14 L32 -14" stroke="#2a2a2a" stroke-width="2.5"/>
        </g>
      </g>
      <!-- reflection sheen on glass -->
      <path d="M730 622 L1090 622 L1080 632 L740 632 Z" fill="#fff" opacity="0.06"/>
    </g>

    <!-- =========== REFRIGERATOR =========== -->
    <g filter="url(#dropShadow)">
      <rect x="1430" y="360" width="160" height="418" fill="url(#steelV)" stroke="#4a5461" stroke-width="2"/>
      <rect x="1430" y="360" width="160" height="418" fill="url(#brushed)" opacity="0.35"/>
      <!-- door split -->
      <line x1="1430" y1="500" x2="1590" y2="500" stroke="#3a4250" stroke-width="2"/>
      <line x1="1430" y1="504" x2="1590" y2="504" stroke="#fff" stroke-width="0.5" opacity="0.5"/>
      <!-- handles -->
      <rect x="1440" y="388" width="6" height="96" rx="2" fill="#dfe4ea"/>
      <rect x="1440" y="388" width="6" height="4" rx="2" fill="#fff" opacity="0.7"/>
      <rect x="1440" y="518" width="6" height="240" rx="2" fill="#dfe4ea"/>
      <!-- water/ice dispenser -->
      <rect x="1490" y="400" width="80" height="52" rx="4" fill="#0e1116" stroke="#2a2f36"/>
      <rect x="1494" y="404" width="72" height="18" rx="2" fill="#0a0d12"/>
      <text x="1530" y="418" fill="#7cf58a" font-size="12" text-anchor="middle" font-family="monospace">4°C</text>
      <circle cx="1502" cy="436" r="3" fill="#5eaee0"/>
      <circle cx="1520" cy="436" r="3" fill="#7cf58a"/>
      <circle cx="1538" cy="436" r="3" fill="#f2b23a"/>
      <rect x="1502" y="446" width="60" height="4" rx="1" fill="#2a2f36"/>
      <!-- Energy label -->
      <rect x="1500" y="700" width="30" height="40" fill="#f7e08a" opacity="0.85"/>
      <text x="1515" y="720" font-size="10" fill="#3a2410" text-anchor="middle" font-weight="700">A+</text>
      <text x="1515" y="732" font-size="8" fill="#3a2410" text-anchor="middle">ECO</text>
    </g>

    <!-- =========== COFFEE MAKER =========== -->
    <g filter="url(#dropShadow)">
      <!-- base -->
      <rect x="80" y="546" width="110" height="34" rx="4" fill="#1a1a1a"/>
      <!-- body -->
      <rect x="82" y="470" width="106" height="80" rx="6" fill="#1c1c1c"/>
      <rect x="86" y="474" width="98" height="20" rx="2" fill="#2a2a2a"/>
      <rect x="90" y="478" width="90" height="12" rx="1" fill="#0a0a0a"/>
      <text x="135" y="488" text-anchor="middle" fill="#7cf58a" font-family="monospace" font-size="10">92°</text>
      <!-- water tank -->
      <rect x="82" y="498" width="30" height="46" rx="3" fill="#4a5461" opacity="0.6"/>
      <rect x="86" y="504" width="22" height="30" fill="#a4c8e0" opacity="0.5"/>
      <!-- group head -->
      <rect x="120" y="518" width="60" height="24" rx="3" fill="#2a2a2a" stroke="#3a3a3a"/>
      <circle cx="150" cy="530" r="6" fill="#0a0a0a"/>
      <rect x="140" y="542" width="20" height="10" fill="#3a3a3a"/>
      <!-- cup -->
      <rect x="130" y="558" width="40" height="20" rx="3" fill="#e8e2d0"/>
      <rect x="130" y="558" width="40" height="4" fill="#c8bda2"/>
      <ellipse cx="150" cy="562" rx="16" ry="3" fill="#3a2410"/>
      <!-- steam -->
      <path d="M144 556 Q140 548 148 542 Q152 536 146 528" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.5"/>
      <path d="M154 556 Q160 548 152 542 Q148 536 156 528" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.5"/>
    </g>

    <!-- =========== MICROWAVE =========== -->
    <g filter="url(#dropShadow)">
      <rect x="500" y="472" width="200" height="108" rx="6" fill="url(#steelV)" stroke="#4a5461" stroke-width="1.5"/>
      <rect x="500" y="472" width="200" height="108" rx="6" fill="url(#brushed)" opacity="0.35"/>
      <!-- door glass -->
      <rect x="510" y="482" width="130" height="88" rx="3" fill="#0a0d12" stroke="#2a2f36" stroke-width="1.5"/>
      <rect x="516" y="488" width="118" height="76" fill="#101418"/>
      <!-- grill mesh -->
      <g stroke="#3a4250" stroke-width="0.4" opacity="0.7">
        <line v-for="i in 12" :key="'mx'+i" :x1="516" :y1="488 + i*6" :x2="634" :y2="488 + i*6"/>
        <line v-for="i in 20" :key="'my'+i" :x1="516 + i*6" :y1="488" :x2="516 + i*6" :y2="564"/>
      </g>
      <!-- turntable inside -->
      <ellipse cx="575" cy="540" rx="46" ry="6" fill="#22262c" opacity="0.7"/>
      <!-- door handle -->
      <rect x="636" y="490" width="4" height="80" fill="#dfe4ea"/>
      <!-- control panel -->
      <rect x="646" y="482" width="46" height="88" fill="#1a1e24" stroke="#2a2f36"/>
      <rect x="650" y="486" width="38" height="14" rx="1" fill="#0a0d12"/>
      <text x="669" y="497" text-anchor="middle" fill="#7cf58a" font-size="9" font-family="monospace">1:30</text>
      <g fill="#3a3f45">
        <rect x="650" y="506" width="10" height="10" rx="1"/>
        <rect x="662" y="506" width="10" height="10" rx="1"/>
        <rect x="674" y="506" width="10" height="10" rx="1"/>
        <rect x="650" y="518" width="10" height="10" rx="1"/>
        <rect x="662" y="518" width="10" height="10" rx="1"/>
        <rect x="674" y="518" width="10" height="10" rx="1"/>
        <rect x="650" y="530" width="10" height="10" rx="1"/>
        <rect x="662" y="530" width="10" height="10" rx="1"/>
        <rect x="674" y="530" width="10" height="10" rx="1"/>
      </g>
      <rect x="654" y="548" width="30" height="18" rx="2" fill="#c4402a"/>
      <text x="669" y="561" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">START</text>
    </g>

    <!-- =========== TOASTER =========== -->
    <g filter="url(#dropShadow)">
      <rect x="1150" y="500" width="140" height="80" rx="12" fill="url(#steelV)" stroke="#4a5461" stroke-width="1.5"/>
      <rect x="1150" y="500" width="140" height="80" rx="12" fill="url(#brushed)" opacity="0.4"/>
      <!-- specular -->
      <path d="M1156 510 Q1220 500 1284 512 L1284 522 Q1220 512 1156 522 Z" fill="#fff" opacity="0.15"/>
      <!-- slot -->
      <rect x="1164" y="510" width="112" height="14" rx="3" fill="#0f1114"/>
      <rect x="1170" y="514" width="30" height="6" fill="#3a1a08"/>
      <rect x="1204" y="514" width="30" height="6" fill="#3a1a08"/>
      <rect x="1238" y="514" width="30" height="6" fill="#3a1a08"/>
      <!-- lever -->
      <rect x="1270" y="540" width="10" height="30" rx="2" fill="#2a2f36"/>
      <circle cx="1275" cy="572" r="5" fill="#dfe4ea"/>
      <!-- browning dial -->
      <circle cx="1180" cy="558" r="9" fill="#2a2a2a" stroke="#4a5461"/>
      <rect x="1179" y="550" width="2" height="8" fill="#e0e0e0"/>
      <!-- feet -->
      <rect x="1160" y="580" width="10" height="4" fill="#1a1a1a"/>
      <rect x="1270" y="580" width="10" height="4" fill="#1a1a1a"/>
    </g>

    <!-- =========== KNIFE BLOCK (safe base — dangerous knives added only when hazard active) =========== -->
    <g filter="url(#dropShadow)">
      <path d="M1310 500 L1380 500 L1370 580 L1300 580 Z" fill="#7c5730"/>
      <path d="M1310 500 L1380 500 L1378 508 L1312 508 Z" fill="#5c3f20"/>
      <!-- slots (dark, empty by default) -->
      <rect x="1316" y="504" width="4" height="6" fill="#1a0f05"/>
      <rect x="1328" y="504" width="4" height="6" fill="#1a0f05"/>
      <rect x="1340" y="504" width="4" height="6" fill="#1a0f05"/>
      <rect x="1352" y="504" width="4" height="6" fill="#1a0f05"/>
      <rect x="1364" y="504" width="4" height="6" fill="#1a0f05"/>
      <!-- knife handles safely tucked into slots (blades hidden inside block) -->
      <rect x="1315" y="498" width="6" height="8" fill="#2a1a10"/>
      <rect x="1327" y="498" width="6" height="8" fill="#2a1a10"/>
      <rect x="1339" y="498" width="6" height="8" fill="#2a1a10"/>
      <rect x="1351" y="498" width="6" height="8" fill="#2a1a10"/>
      <rect x="1363" y="498" width="6" height="8" fill="#2a1a10"/>
      <linearGradient id="knifeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#cfd8e3"/>
        <stop offset="100%" stop-color="#8b95a1"/>
      </linearGradient>
    </g>

    <!-- =========== OUTLET on backsplash =========== -->
    <g filter="url(#dropShadow)">
      <rect x="1080" y="470" width="36" height="48" rx="4" fill="#faf5e6" stroke="#c4b48f" stroke-width="1"/>
      <rect x="1080" y="470" width="36" height="4" rx="2" fill="#fff" opacity="0.7"/>
      <!-- upper socket -->
      <rect x="1088" y="478" width="4" height="10" rx="1" fill="#22252a"/>
      <rect x="1102" y="478" width="4" height="10" rx="1" fill="#22252a"/>
      <circle cx="1097" cy="494" r="2" fill="#22252a"/>
      <!-- lower socket -->
      <rect x="1088" y="500" width="4" height="10" rx="1" fill="#22252a"/>
      <rect x="1102" y="500" width="4" height="10" rx="1" fill="#22252a"/>
      <circle cx="1097" cy="513" r="1.5" fill="#22252a"/>
      <!-- screw -->
      <circle cx="1098" cy="475" r="1" fill="#c4b48f"/>
    </g>

    <!-- =========== CUTTING BOARD + VEGGIES =========== -->
    <g filter="url(#dropShadow)">
      <rect x="410" y="570" width="200" height="14" rx="2" fill="#c98f5a"/>
      <rect x="410" y="570" width="200" height="4" fill="#e0a878"/>
      <!-- grain -->
      <line x1="410" y1="576" x2="610" y2="576" stroke="#a06a35" stroke-width="0.4"/>
      <line x1="410" y1="580" x2="610" y2="580" stroke="#a06a35" stroke-width="0.4"/>
      <!-- tomato -->
      <circle cx="454" cy="568" r="10" fill="#d94a2a"/>
      <circle cx="452" cy="565" r="3" fill="#f28060" opacity="0.7"/>
      <path d="M450 559 L454 555 L458 559 L456 562 Z" fill="#4a8f4a"/>
      <!-- lime -->
      <circle cx="482" cy="568" r="7" fill="#7ac54a"/>
      <circle cx="480" cy="566" r="2" fill="#a5df75" opacity="0.7"/>
      <!-- lemon -->
      <ellipse cx="514" cy="568" rx="14" ry="7" fill="#f2c94c"/>
      <ellipse cx="512" cy="566" rx="6" ry="2" fill="#fce78a" opacity="0.7"/>
      <!-- pepper -->
      <path d="M548 566 Q564 560 578 572 Q570 574 558 574 Q550 574 548 566 Z" fill="#c4402a"/>
      <path d="M548 566 L544 562 L546 560 L550 564 Z" fill="#4a8f4a"/>
    </g>

    <!-- =========== HANGING PANS =========== -->
    <g>
      <rect x="1240" y="80" width="200" height="4" fill="#5a3f1e"/>
      <g v-for="i in 3" :key="'pn'+i">
        <line :x1="1260 + (i-1)*60" y1="84" :x2="1260 + (i-1)*60" y2="106" stroke="#3a3a3a" stroke-width="1.5"/>
        <ellipse :cx="1260 + (i-1)*60" cy="120" rx="22" ry="6" fill="url(#steelV)" stroke="#4a5461"/>
        <path :d="`M${1238 + (i-1)*60} 120 L${1282 + (i-1)*60} 120 L${1276 + (i-1)*60} 138 L${1244 + (i-1)*60} 138 Z`" fill="url(#steelH)" stroke="#4a5461"/>
      </g>
    </g>

    <!-- =========== PAPER TOWEL ROLL =========== -->
    <g transform="translate(1090,540)" filter="url(#dropShadow)">
      <rect x="-4" y="0" width="8" height="42" fill="#8a94a0"/>
      <rect x="-14" y="42" width="28" height="6" fill="#4a5461"/>
      <ellipse cx="0" cy="14" rx="18" ry="6" fill="#faf5e6"/>
      <rect x="-18" y="14" width="36" height="24" fill="#faf5e6"/>
      <ellipse cx="0" cy="38" rx="18" ry="6" fill="#e8dcbb"/>
    </g>

    <!-- Countertop reflections cast by hood/upper cabs (subtle) -->
    <rect x="60" y="580" width="1480" height="22" fill="#000" opacity="0.06"/>

    <!-- ============================================= -->
    <!-- HAZARD OVERLAYS                                -->
    <!-- ============================================= -->
    <g v-for="hz in activeHazards" :key="hz" class="hazard-group" @click.stop="onHazard(hz)">
      <!-- transparent hit area covering related zone(s) is set via ring, but each ring already has stroke;
           we add invisible boost-rect where useful. -->
      <template v-if="hz === 'gasLeak'">
        <g class="gas-cloud">
          <circle cx="900" cy="500" r="70" fill="url(#gasGlow)"/>
          <circle cx="850" cy="470" r="46" fill="url(#gasGlow)"/>
          <circle cx="950" cy="475" r="52" fill="url(#gasGlow)"/>
          <circle cx="820" cy="510" r="34" fill="url(#gasGlow)"/>
        </g>
        <g class="hz-ring" transform="translate(900,500)">
          <circle r="100" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'stoveOn'">
        <!-- Base at (820, 690) — top of grate. Flame extends up (negative y from base). -->
        <g transform="translate(820,690)">
          <ellipse cx="0" cy="4" rx="28" ry="6" fill="#000" opacity="0.5"/>
          <!-- blue burner glow -->
          <ellipse cx="0" cy="0" rx="30" ry="10" fill="url(#burnerBlue)"/>
          <!-- inner steady flame (flicker in place) -->
          <g class="flame-anim">
            <use href="#flameShape" transform="scale(1.4)"/>
          </g>
        </g>
        <g class="hz-ring" transform="translate(820,660)">
          <circle r="80" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'oilFire'">
        <!-- Pan sits on right grate (1000, 690). Base of flame at top of pan. -->
        <g transform="translate(1000,682)">
          <!-- pan -->
          <ellipse cx="0" cy="0" rx="52" ry="8" fill="#0a0a0a"/>
          <rect x="-50" y="-10" width="100" height="10" fill="#2a2a2a"/>
          <ellipse cx="0" cy="-10" rx="50" ry="7" fill="#c9a76b"/>
          <rect x="50" y="-6" width="34" height="6" rx="2" fill="#3a2a1a"/>
          <rect x="50" y="-6" width="34" height="1.5" rx="1" fill="#5a4830"/>
        </g>
        <!-- flames anchored on pan rim at y=672. All animation is on inner group, no translate override. -->
        <g transform="translate(1000,672)" filter="url(#strongGlow)">
          <g class="flame-anim big">
            <use href="#flameShape" transform="scale(2.4)"/>
          </g>
        </g>
        <g class="hz-ring" transform="translate(1000,640)">
          <circle r="90" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'coffeeFire'">
        <g transform="translate(135,466)" filter="url(#glow)">
          <g class="flame-anim">
            <use href="#flameShape" transform="scale(1.2)"/>
          </g>
        </g>
        <g transform="translate(135,450)"><g class="smoke-anim">
          <ellipse cx="0" cy="0" rx="10" ry="8" fill="#333"/>
          <ellipse cx="-6" cy="-14" rx="8" ry="6" fill="#333"/>
          <ellipse cx="6" cy="-26" rx="7" ry="5" fill="#333"/>
        </g></g>
        <g class="hz-ring" transform="translate(135,510)">
          <rect x="-60" y="-50" width="120" height="100" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'microwaveFire'">
        <g transform="translate(575,540)" filter="url(#glow)">
          <g class="flame-anim wide">
            <ellipse cx="0" cy="-16" rx="42" ry="26" fill="url(#flame)" opacity="0.9"/>
            <ellipse cx="0" cy="-16" rx="26" ry="16" fill="#fff2a8" opacity="0.7"/>
          </g>
        </g>
        <g transform="translate(600,470)"><g class="smoke-anim">
          <ellipse cx="0" cy="0" rx="10" ry="8" fill="#333"/>
          <ellipse cx="10" cy="-14" rx="8" ry="6" fill="#333"/>
        </g></g>
        <g class="hz-ring" transform="translate(600,530)">
          <rect x="-105" y="-60" width="210" height="110" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'toasterFire'">
        <g transform="translate(1220,502)" filter="url(#glow)">
          <g class="flame-anim">
            <use href="#flameShape" transform="scale(1.1)"/>
          </g>
        </g>
        <g transform="translate(1220,486)"><g class="smoke-anim">
          <ellipse cx="0" cy="0" rx="9" ry="7" fill="#333"/>
          <ellipse cx="8" cy="-12" rx="7" ry="5" fill="#333"/>
        </g></g>
        <g class="hz-ring" transform="translate(1220,540)">
          <rect x="-75" y="-46" width="150" height="90" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'hoodFire'">
        <g transform="translate(900,240)" filter="url(#strongGlow)">
          <g class="flame-anim big">
            <use href="#flameShape" transform="scale(3.2)"/>
          </g>
        </g>
        <g class="hz-ring" transform="translate(900,180)">
          <rect x="-190" y="-100" width="380" height="180" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'knives'">
        <!-- blade-up knives protruding from block (dangerous config) -->
        <g>
          <rect x="1316" y="454" width="4" height="50" fill="url(#steelH)" stroke="#4a5461" stroke-width="0.4"/>
          <rect x="1315" y="504" width="6" height="14" fill="#2a1a10"/>
          <rect x="1328" y="464" width="4" height="40" fill="url(#steelH)" stroke="#4a5461" stroke-width="0.4"/>
          <rect x="1327" y="504" width="6" height="14" fill="#2a1a10"/>
          <rect x="1340" y="470" width="4" height="34" fill="url(#steelH)" stroke="#4a5461" stroke-width="0.4"/>
          <rect x="1339" y="504" width="6" height="14" fill="#2a1a10"/>
        </g>
        <!-- loose knife near counter edge -->
        <g transform="translate(1200,588) rotate(-6)">
          <path d="M0 0 L82 0 L96 4 L82 8 L0 8 Z" fill="url(#knifeGrad)" stroke="#5a6472" stroke-width="0.4"/>
          <rect x="-28" y="-2" width="30" height="12" rx="2" fill="#2a1a10"/>
          <rect x="-26" y="0" width="26" height="2" fill="#3a2418"/>
        </g>
        <g class="hz-ring" transform="translate(1290,540)">
          <rect x="-110" y="-60" width="200" height="110" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'faucet'">
        <g transform="translate(350,558)">
          <g class="water-anim">
            <rect x="-3" y="0" width="6" height="42" fill="#7fc6ee"/>
            <rect x="-2" y="0" width="4" height="42" fill="#c5e7fa"/>
          </g>
          <ellipse cx="0" cy="46" rx="12" ry="3" fill="#a8d9f2"/>
        </g>
        <ellipse cx="350" cy="612" rx="130" ry="14" fill="url(#waterGlow)"/>
        <ellipse cx="350" cy="612" rx="90" ry="8" fill="#7fc6ee" opacity="0.55"/>
        <g class="hz-ring" transform="translate(350,560)">
          <circle r="100" fill="transparent"/>
        </g>
      </template>

      <template v-if="hz === 'outletSpark'">
        <g transform="translate(1098,494)">
          <circle r="30" fill="url(#sparkGlow)" class="spark-glow"/>
          <g class="spark-anim">
            <g v-for="i in 8" :key="'sp'+i" :transform="`rotate(${i*45})`">
              <path d="M0 -22 L2.5 -6 L-2.5 -6 Z" fill="#fff7c7"/>
            </g>
          </g>
        </g>
        <g class="hz-ring" transform="translate(1098,494)">
          <rect x="-30" y="-36" width="60" height="72" fill="transparent"/>
        </g>
      </template>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'KitchenScene',
  props: { activeHazards: { type: Array, default: () => [] } },
  methods: {
    onHazard(id) { this.$emit('hazard', id) }
  }
}
</script>

<style scoped>
.kitchen-svg { width: 100%; height: 100%; display: block; }
.hazard-group { cursor: pointer; }

/* Invisible hit areas — capture clicks but leave no visible mark */
.hz-ring circle, .hz-ring rect {
  pointer-events: all;
}

/* -------- FLAME: no translate, so origin 0,0 = base at parent translate point.
   We scale about (0,0) which keeps the flame anchored (its base is at y=0). ---- */
.flame-anim {
  transform-origin: 0 0;
  transform-box: fill-box;
  animation: flameFlick 220ms steps(2, end) infinite;
  will-change: transform;
}
.flame-anim.big { animation-duration: 260ms; }
.flame-anim.wide { animation-duration: 300ms; }
@keyframes flameFlick {
  0%   { transform: scale(1, 1); }
  50%  { transform: scale(0.96, 1.06); }
  100% { transform: scale(1.04, 0.94); }
}

/* smoke rises inside its own group without affecting parent translate */
.smoke-anim {
  transform-origin: 0 0;
  animation: smoke 2.6s ease-out infinite;
  opacity: 0.55;
}
@keyframes smoke {
  0%   { transform: translateY(0) scale(0.7); opacity: 0.6; }
  100% { transform: translateY(-42px) scale(1.4); opacity: 0; }
}

/* gas cloud drifts subtly */
.gas-cloud { animation: gasPulse 2.4s ease-in-out infinite; transform-origin: 900px 500px; }
@keyframes gasPulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.95; }
}

/* water */
.water-anim { animation: waterFlow 0.25s linear infinite; transform-origin: 0 0; }
@keyframes waterFlow {
  0%,100% { opacity: 0.75; }
  50%     { opacity: 1; }
}

/* sparks: rotate around origin (which is the parent translate point) */
.spark-anim { transform-origin: 0 0; animation: sparkSpin 0.5s linear infinite; }
@keyframes sparkSpin {
  0%   { transform: rotate(0deg) scale(0.9); opacity: 0.9; }
  50%  { transform: rotate(22deg) scale(1.15); opacity: 1; }
  100% { transform: rotate(45deg) scale(0.9); opacity: 0.9; }
}
.spark-glow { transform-origin: 0 0; animation: sparkGlowPulse 0.5s ease-in-out infinite alternate; }
@keyframes sparkGlowPulse {
  0%   { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
