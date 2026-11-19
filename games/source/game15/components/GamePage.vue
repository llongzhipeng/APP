<template>
  <div class="game-page">
    <!-- SVG Forest Background -->
    <svg viewBox="0 0 1600 900" class="forest-bg-svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <!-- Sky -->
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3A7BD5" />
          <stop offset="30%" stop-color="#6DB3F2" />
          <stop offset="55%" stop-color="#A8DCE8" />
          <stop offset="75%" stop-color="#C5E8C0" />
          <stop offset="100%" stop-color="#4A8B38" />
        </linearGradient>
        <!-- Trunk bark -->
        <linearGradient id="bark1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3E2310" />
          <stop offset="25%" stop-color="#5C3A1E" />
          <stop offset="50%" stop-color="#6B4528" />
          <stop offset="75%" stop-color="#4E3018" />
          <stop offset="100%" stop-color="#3A2010" />
        </linearGradient>
        <linearGradient id="bark2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#4A2E15" />
          <stop offset="30%" stop-color="#6E4A2A" />
          <stop offset="60%" stop-color="#7A5535" />
          <stop offset="100%" stop-color="#4A2E15" />
        </linearGradient>
        <linearGradient id="barkHighlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="transparent" />
          <stop offset="40%" stop-color="rgba(180,150,110,0.2)" />
          <stop offset="60%" stop-color="rgba(180,150,110,0.15)" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <!-- Rich foliage gradients -->
        <radialGradient id="fol1" cx="0.35" cy="0.3" r="0.65">
          <stop offset="0%" stop-color="#7ACC5A" />
          <stop offset="40%" stop-color="#4DA832" />
          <stop offset="100%" stop-color="#1E6B10" />
        </radialGradient>
        <radialGradient id="fol2" cx="0.4" cy="0.25" r="0.7">
          <stop offset="0%" stop-color="#5FBB42" />
          <stop offset="45%" stop-color="#3A9425" />
          <stop offset="100%" stop-color="#165A08" />
        </radialGradient>
        <radialGradient id="fol3" cx="0.3" cy="0.35" r="0.65">
          <stop offset="0%" stop-color="#8AD468" />
          <stop offset="40%" stop-color="#5AAF3A" />
          <stop offset="100%" stop-color="#2A7518" />
        </radialGradient>
        <radialGradient id="fol4" cx="0.45" cy="0.3" r="0.6">
          <stop offset="0%" stop-color="#60C040" />
          <stop offset="50%" stop-color="#358A20" />
          <stop offset="100%" stop-color="#0F4A05" />
        </radialGradient>
        <radialGradient id="folDark" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stop-color="#2D7A18" />
          <stop offset="100%" stop-color="#0A3A02" />
        </radialGradient>
        <radialGradient id="folLight" cx="0.3" cy="0.2" r="0.7">
          <stop offset="0%" stop-color="#A0E880" />
          <stop offset="50%" stop-color="#6BBF4A" />
          <stop offset="100%" stop-color="#3A8820" />
        </radialGradient>
        <!-- Soil -->
        <radialGradient id="soil" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0%" stop-color="#A07830" />
          <stop offset="30%" stop-color="#8B6A20" />
          <stop offset="65%" stop-color="#7A5C18" />
          <stop offset="100%" stop-color="#5A4210" />
        </radialGradient>
        <radialGradient id="soilInner" cx="0.5" cy="0.4" r="0.4">
          <stop offset="0%" stop-color="#B08838" />
          <stop offset="100%" stop-color="#907020" />
        </radialGradient>
        <!-- Sun glow -->
        <radialGradient id="sunG" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#FFF8E0" />
          <stop offset="40%" stop-color="#FFE066" />
          <stop offset="100%" stop-color="#FFD030" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.25" />
        </filter>
      </defs>

      <!-- SKY -->
      <rect width="1600" height="900" fill="url(#sky)" />

      <!-- Sun -->
      <circle cx="1320" cy="110" r="55" fill="url(#sunG)" filter="url(#glow)" />
      <circle cx="1320" cy="110" r="85" fill="rgba(255,230,100,0.12)" />
      <circle cx="1320" cy="110" r="140" fill="rgba(255,230,100,0.05)" />

      <!-- Clouds - fluffy layered -->
      <g opacity="0.9">
        <ellipse cx="280" cy="95" rx="90" ry="30" fill="#fff" />
        <ellipse cx="340" cy="82" rx="65" ry="28" fill="#fff" />
        <ellipse cx="230" cy="88" rx="55" ry="22" fill="#fff" />
        <ellipse cx="310" cy="100" rx="50" ry="18" fill="#f8f8ff" />
      </g>
      <g opacity="0.65">
        <ellipse cx="880" cy="120" rx="75" ry="25" fill="#fff" />
        <ellipse cx="935" cy="110" rx="55" ry="22" fill="#fff" />
        <ellipse cx="840" cy="115" rx="40" ry="18" fill="#f8f8ff" />
      </g>
      <g opacity="0.45">
        <ellipse cx="580" cy="60" rx="60" ry="20" fill="#fff" />
        <ellipse cx="630" cy="55" rx="42" ry="16" fill="#fff" />
      </g>

      <!-- FAR BACKGROUND TREE LINE (misty, atmospheric) -->
      <g opacity="0.3">
        <g v-for="(x, i) in [50, 130, 220, 310, 400, 490, 580, 680, 770, 860, 960, 1060, 1150, 1240, 1340, 1440, 1540]" :key="`bg-${i}`">
          <path :d="`M${x},${420} c0,0 ${(40 + (i % 3) * 12) * 0.15},-${(90 + (i % 4) * 25) * 0.3} ${(40 + (i % 3) * 12) * 0.08},-${(90 + (i % 4) * 25) * 0.8} c${(40 + (i % 3) * 12) * 0.02},-${(90 + (i % 4) * 25) * 0.15} -${(40 + (i % 3) * 12) * 0.18},-${(90 + (i % 4) * 25) * 0.15} -${(40 + (i % 3) * 12) * 0.16},0 c-${(40 + (i % 3) * 12) * 0.07},${(90 + (i % 4) * 25) * 0.5} ${(40 + (i % 3) * 12) * 0.06},${(90 + (i % 4) * 25) * 0.8} ${(40 + (i % 3) * 12) * 0.08},${(90 + (i % 4) * 25) * 0.8}`"
            :fill="i % 2 === 0 ? '#2A6818' : '#1F5512'" />
          <ellipse :cx="x" :cy="420 - (90 + (i % 4) * 25) + 20" :rx="(40 + (i % 3) * 12) * 0.5" :ry="(90 + (i % 4) * 25) * 0.35" :fill="i % 3 === 0 ? '#2D7A1A' : '#226E15'" />
          <ellipse :cx="x - (40 + (i % 3) * 12) * 0.12" :cy="420 - (90 + (i % 4) * 25) + 10" :rx="(40 + (i % 3) * 12) * 0.35" :ry="(90 + (i % 4) * 25) * 0.25" fill="#3A8825" opacity="0.6" />
        </g>
      </g>

      <!-- GREEN FOREST FLOOR -->
      <path d="M0,450 Q400,380 800,400 Q1200,380 1600,450 L1600,900 L0,900 Z" fill="#3D8530" />
      <path d="M0,480 Q400,420 800,440 Q1200,420 1600,480 L1600,900 L0,900 Z" fill="#357A28" />

      <!-- CENTRAL SOIL AREA -->
      <ellipse cx="800" cy="580" rx="420" ry="230" fill="#5A4210" />
      <ellipse cx="800" cy="575" rx="400" ry="215" fill="url(#soil)" />
      <ellipse cx="800" cy="565" rx="370" ry="195" fill="url(#soilInner)" opacity="0.6" />
      <!-- Soil texture -->
      <ellipse cx="650" cy="520" rx="35" ry="10" fill="#7A5A15" opacity="0.35" />
      <ellipse cx="950" cy="540" rx="28" ry="9" fill="#6B4E12" opacity="0.35" />
      <ellipse cx="800" cy="620" rx="40" ry="12" fill="#6B4E12" opacity="0.3" />
      <ellipse cx="720" cy="580" rx="22" ry="7" fill="#9A7828" opacity="0.25" />
      <ellipse cx="880" cy="500" rx="18" ry="6" fill="#8A6820" opacity="0.25" />
      <!-- Soil edge - grass fringe -->
      <g v-for="(x, i) in [380, 420, 460, 500, 1100, 1140, 1180, 1220]" :key="`gf-${i}`" opacity="0.7">
        <path :d="`M${x},${510 + (i % 3) * 25} q2,-20 4,0`" fill="#5DAA3F" />
        <path :d="`M${x + 6},${515 + (i % 3) * 25} q1.5,-16 3,0`" fill="#72C050" />
        <path :d="`M${x - 4},${513 + (i % 3) * 25} q2,-14 4,0`" fill="#4A9A32" />
      </g>

      <!-- LEFT TREES -->
      <!-- TREE L1 — Giant ancient tree, far left -->
      <g filter="url(#softShadow)">
        <!-- Roots -->
        <path d="M-10,720 Q20,680 50,650 Q60,620 55,580" fill="none" stroke="url(#bark1)" stroke-width="22" stroke-linecap="round" />
        <path d="M70,730 Q80,690 75,650 Q70,620 65,590" fill="none" stroke="url(#bark1)" stroke-width="18" stroke-linecap="round" />
        <path d="M130,740 Q110,700 90,660 Q80,630 75,600" fill="none" stroke="url(#bark1)" stroke-width="15" stroke-linecap="round" />
        <!-- Main trunk -->
        <path d="M30,700 Q25,600 35,500 Q40,400 30,300 Q25,250 40,200 Q50,160 55,120"
          fill="none" stroke="url(#bark1)" stroke-width="60" stroke-linecap="round" />
        <path d="M40,680 Q38,580 45,480 Q48,380 40,300"
          fill="none" stroke="url(#barkHighlight)" stroke-width="25" stroke-linecap="round" />
        <!-- Bark knots -->
        <ellipse cx="42" cy="450" rx="12" ry="18" fill="#3A2010" opacity="0.4" />
        <ellipse cx="50" cy="350" rx="8" ry="12" fill="#3A2010" opacity="0.3" />
        <!-- Bark lines -->
        <path d="M25,600 q3,-40 -2,-80" fill="none" stroke="#2E1A0A" stroke-width="2" opacity="0.3" />
        <path d="M55,550 q-2,-35 1,-70" fill="none" stroke="#2E1A0A" stroke-width="1.5" opacity="0.25" />
        <!-- Major branches -->
        <path d="M40,250 Q-10,210 -60,180 Q-100,165 -130,175" fill="none" stroke="url(#bark2)" stroke-width="22" stroke-linecap="round" />
        <path d="M45,200 Q80,160 130,140 Q170,130 200,140" fill="none" stroke="url(#bark2)" stroke-width="18" stroke-linecap="round" />
        <path d="M35,300 Q-20,270 -70,280" fill="none" stroke="url(#bark2)" stroke-width="14" stroke-linecap="round" />
        <path d="M50,170 Q40,120 20,80 Q10,50 -10,30" fill="none" stroke="url(#bark2)" stroke-width="16" stroke-linecap="round" />
        <!-- Sub-branches -->
        <path d="M-60,180 Q-90,160 -120,165" fill="none" stroke="#5C3A1E" stroke-width="8" stroke-linecap="round" />
        <path d="M130,140 Q160,125 180,130" fill="none" stroke="#5C3A1E" stroke-width="7" stroke-linecap="round" />
        <path d="M20,80 Q-10,50 -30,55" fill="none" stroke="#5C3A1E" stroke-width="6" stroke-linecap="round" />
      </g>
      <!-- L1 Foliage -->
      <ellipse cx="-80" cy="190" rx="90" ry="65" fill="url(#folDark)" />
      <ellipse cx="30" cy="100" rx="100" ry="80" fill="url(#fol2)" />
      <ellipse cx="-40" cy="140" rx="110" ry="75" fill="url(#fol1)" />
      <ellipse cx="120" cy="130" rx="85" ry="60" fill="url(#fol4)" />
      <ellipse cx="50" cy="60" rx="95" ry="70" fill="url(#fol3)" />
      <ellipse cx="-20" cy="80" rx="75" ry="55" fill="url(#folLight)" opacity="0.5" />
      <ellipse cx="170" cy="150" rx="65" ry="50" fill="url(#fol2)" opacity="0.8" />
      <ellipse cx="80" cy="40" rx="70" ry="50" fill="url(#folLight)" opacity="0.4" />
      <ellipse cx="10" cy="70" rx="30" ry="20" fill="rgba(180,240,140,0.2)" />
      <ellipse cx="100" cy="110" rx="22" ry="15" fill="rgba(180,240,140,0.15)" />

      <!-- TREE L2 — Medium tree -->
      <g filter="url(#softShadow)">
        <path d="M220,710 Q210,600 225,500 Q235,420 220,340 Q215,300 225,260"
          fill="none" stroke="url(#bark1)" stroke-width="42" stroke-linecap="round" />
        <path d="M230,690 Q225,590 232,490 Q238,420 230,360"
          fill="none" stroke="url(#barkHighlight)" stroke-width="18" stroke-linecap="round" />
        <!-- Roots -->
        <path d="M195,720 Q170,700 150,710" fill="none" stroke="url(#bark1)" stroke-width="14" stroke-linecap="round" />
        <path d="M250,720 Q270,705 290,715" fill="none" stroke="url(#bark1)" stroke-width="12" stroke-linecap="round" />
        <!-- Branches -->
        <path d="M225,300 Q180,260 140,250 Q110,245 90,255" fill="none" stroke="url(#bark2)" stroke-width="14" stroke-linecap="round" />
        <path d="M225,280 Q270,240 310,230 Q340,225 360,235" fill="none" stroke="url(#bark2)" stroke-width="12" stroke-linecap="round" />
        <path d="M222,340 Q190,310 165,315" fill="none" stroke="url(#bark2)" stroke-width="10" stroke-linecap="round" />
        <ellipse cx="228" cy="400" rx="8" ry="14" fill="#3A2010" opacity="0.3" />
      </g>
      <!-- L2 Foliage -->
      <ellipse cx="130" cy="260" rx="75" ry="55" fill="url(#folDark)" />
      <ellipse cx="225" cy="230" rx="95" ry="75" fill="url(#fol1)" />
      <ellipse cx="320" cy="240" rx="70" ry="55" fill="url(#fol4)" />
      <ellipse cx="180" cy="220" rx="80" ry="60" fill="url(#fol3)" />
      <ellipse cx="270" cy="210" rx="75" ry="55" fill="url(#folLight)" opacity="0.45" />
      <ellipse cx="220" cy="195" rx="60" ry="45" fill="url(#fol2)" opacity="0.7" />

      <!-- TREE L3 — Smaller foreground tree -->
      <g filter="url(#softShadow)">
        <path d="M340,730 Q335,650 345,570 Q350,510 342,450 Q338,420 345,380"
          fill="none" stroke="url(#bark2)" stroke-width="30" stroke-linecap="round" />
        <path d="M348,710 Q345,640 350,560 Q353,510 348,460"
          fill="none" stroke="url(#barkHighlight)" stroke-width="12" stroke-linecap="round" />
        <path d="M345,420 Q310,390 280,395" fill="none" stroke="url(#bark2)" stroke-width="10" stroke-linecap="round" />
        <path d="M345,400 Q375,365 400,370" fill="none" stroke="url(#bark2)" stroke-width="9" stroke-linecap="round" />
      </g>
      <ellipse cx="290" cy="390" rx="60" ry="45" fill="url(#folDark)" />
      <ellipse cx="345" cy="350" rx="80" ry="65" fill="url(#fol4)" />
      <ellipse cx="400" cy="370" rx="55" ry="42" fill="url(#fol1)" />
      <ellipse cx="340" cy="330" rx="65" ry="48" fill="url(#folLight)" opacity="0.4" />

      <!-- RIGHT TREES -->
      <!-- TREE R1 — Giant ancient tree, far right -->
      <g filter="url(#softShadow)">
        <path d="M1610,720 Q1600,610 1585,500 Q1575,400 1590,300 Q1598,240 1580,180 Q1570,140 1560,100"
          fill="none" stroke="url(#bark1)" stroke-width="58" stroke-linecap="round" />
        <path d="M1598,690 Q1592,580 1580,480 Q1575,400 1585,310"
          fill="none" stroke="url(#barkHighlight)" stroke-width="24" stroke-linecap="round" />
        <!-- Roots -->
        <path d="M1630,730 Q1650,700 1660,720" fill="none" stroke="url(#bark1)" stroke-width="20" stroke-linecap="round" />
        <path d="M1560,730 Q1540,695 1520,710" fill="none" stroke="url(#bark1)" stroke-width="16" stroke-linecap="round" />
        <path d="M1500,740 Q1530,700 1555,670" fill="none" stroke="url(#bark1)" stroke-width="13" stroke-linecap="round" />
        <ellipse cx="1585" cy="430" rx="11" ry="16" fill="#3A2010" opacity="0.35" />
        <!-- Branches -->
        <path d="M1585,260 Q1630,220 1680,210 Q1720,205 1750,215" fill="none" stroke="url(#bark2)" stroke-width="20" stroke-linecap="round" />
        <path d="M1578,220 Q1540,180 1500,165 Q1460,155 1430,165" fill="none" stroke="url(#bark2)" stroke-width="18" stroke-linecap="round" />
        <path d="M1570,170 Q1580,120 1600,80 Q1615,50 1630,30" fill="none" stroke="url(#bark2)" stroke-width="15" stroke-linecap="round" />
        <path d="M1590,300 Q1640,280 1680,290" fill="none" stroke="url(#bark2)" stroke-width="12" stroke-linecap="round" />
      </g>
      <!-- R1 Foliage -->
      <ellipse cx="1700" cy="200" rx="85" ry="60" fill="url(#folDark)" />
      <ellipse cx="1580" cy="110" rx="100" ry="80" fill="url(#fol1)" />
      <ellipse cx="1660" cy="150" rx="105" ry="72" fill="url(#fol2)" />
      <ellipse cx="1470" cy="170" rx="80" ry="60" fill="url(#fol4)" />
      <ellipse cx="1560" cy="60" rx="90" ry="65" fill="url(#fol3)" />
      <ellipse cx="1630" cy="80" rx="70" ry="50" fill="url(#folLight)" opacity="0.45" />
      <ellipse cx="1500" cy="130" rx="65" ry="48" fill="url(#fol2)" opacity="0.7" />
      <ellipse cx="1620" cy="40" rx="65" ry="48" fill="url(#folLight)" opacity="0.35" />

      <!-- TREE R2 — Medium tree -->
      <g filter="url(#softShadow)">
        <path d="M1380,720 Q1390,620 1385,530 Q1380,450 1390,370 Q1395,330 1388,280"
          fill="none" stroke="url(#bark1)" stroke-width="40" stroke-linecap="round" />
        <path d="M1392,700 Q1395,610 1390,520 Q1388,460 1393,380"
          fill="none" stroke="url(#barkHighlight)" stroke-width="16" stroke-linecap="round" />
        <path d="M1388,320 Q1430,285 1470,280" fill="none" stroke="url(#bark2)" stroke-width="13" stroke-linecap="round" />
        <path d="M1388,300 Q1350,260 1310,255 Q1280,250 1260,260" fill="none" stroke="url(#bark2)" stroke-width="12" stroke-linecap="round" />
        <path d="M1390,350 Q1420,325 1445,330" fill="none" stroke="url(#bark2)" stroke-width="9" stroke-linecap="round" />
      </g>
      <ellipse cx="1460" cy="270" rx="65" ry="50" fill="url(#folDark)" />
      <ellipse cx="1388" cy="250" rx="90" ry="72" fill="url(#fol3)" />
      <ellipse cx="1290" cy="260" rx="65" ry="50" fill="url(#fol1)" />
      <ellipse cx="1380" cy="225" rx="72" ry="55" fill="url(#folLight)" opacity="0.45" />
      <ellipse cx="1440" cy="240" rx="55" ry="42" fill="url(#fol4)" opacity="0.7" />

      <!-- TREE R3 — Smaller foreground -->
      <g filter="url(#softShadow)">
        <path d="M1260,740 Q1265,660 1258,580 Q1252,520 1260,460 Q1264,430 1258,390"
          fill="none" stroke="url(#bark2)" stroke-width="28" stroke-linecap="round" />
        <path d="M1258,430 Q1225,400 1200,405" fill="none" stroke="url(#bark2)" stroke-width="9" stroke-linecap="round" />
        <path d="M1260,410 Q1290,380 1310,385" fill="none" stroke="url(#bark2)" stroke-width="8" stroke-linecap="round" />
      </g>
      <ellipse cx="1210" cy="395" rx="55" ry="42" fill="url(#folDark)" />
      <ellipse cx="1260" cy="360" rx="75" ry="60" fill="url(#fol2)" />
      <ellipse cx="1310" cy="380" rx="50" ry="38" fill="url(#fol3)" />
      <ellipse cx="1255" cy="340" rx="58" ry="44" fill="url(#folLight)" opacity="0.38" />

      <!-- TOP CANOPY TREES (overhead) -->
      <!-- Top tree 1 -->
      <g filter="url(#softShadow)">
        <path d="M520,-30 Q515,60 525,140 Q530,200 520,260"
          fill="none" stroke="url(#bark1)" stroke-width="32" stroke-linecap="round" />
        <path d="M520,180 Q480,210 450,220" fill="none" stroke="url(#bark2)" stroke-width="10" stroke-linecap="round" />
        <path d="M525,160 Q560,190 590,195" fill="none" stroke="url(#bark2)" stroke-width="9" stroke-linecap="round" />
      </g>
      <ellipse cx="460" cy="200" rx="60" ry="45" fill="url(#folDark)" />
      <ellipse cx="520" cy="140" rx="85" ry="70" fill="url(#fol1)" />
      <ellipse cx="580" cy="180" rx="55" ry="42" fill="url(#fol4)" />
      <ellipse cx="520" cy="100" rx="70" ry="55" fill="url(#fol3)" />
      <ellipse cx="490" cy="60" rx="80" ry="60" fill="url(#fol2)" />
      <ellipse cx="545" cy="50" rx="55" ry="40" fill="url(#folLight)" opacity="0.35" />

      <!-- Top tree 2 -->
      <g filter="url(#softShadow)">
        <path d="M800,-50 Q795,40 805,120 Q810,180 800,240"
          fill="none" stroke="url(#bark2)" stroke-width="28" stroke-linecap="round" />
        <path d="M800,160 Q760,185 735,190" fill="none" stroke="url(#bark2)" stroke-width="8" stroke-linecap="round" />
        <path d="M805,140 Q840,170 865,175" fill="none" stroke="url(#bark2)" stroke-width="7" stroke-linecap="round" />
      </g>
      <ellipse cx="745" cy="175" rx="50" ry="38" fill="url(#folDark)" />
      <ellipse cx="800" cy="120" rx="80" ry="65" fill="url(#fol4)" />
      <ellipse cx="860" cy="160" rx="48" ry="36" fill="url(#fol1)" />
      <ellipse cx="800" cy="80" rx="65" ry="50" fill="url(#fol2)" />
      <ellipse cx="780" cy="40" rx="70" ry="52" fill="url(#fol3)" />
      <ellipse cx="830" cy="30" rx="48" ry="35" fill="url(#folLight)" opacity="0.3" />

      <!-- Top tree 3 -->
      <g filter="url(#softShadow)">
        <path d="M1080,-20 Q1075,50 1085,130 Q1090,190 1080,250"
          fill="none" stroke="url(#bark1)" stroke-width="30" stroke-linecap="round" />
        <path d="M1080,170 Q1045,200 1020,208" fill="none" stroke="url(#bark2)" stroke-width="9" stroke-linecap="round" />
        <path d="M1085,155 Q1115,180 1140,188" fill="none" stroke="url(#bark2)" stroke-width="8" stroke-linecap="round" />
      </g>
      <ellipse cx="1030" cy="195" rx="55" ry="42" fill="url(#folDark)" />
      <ellipse cx="1080" cy="130" rx="82" ry="68" fill="url(#fol2)" />
      <ellipse cx="1135" cy="175" rx="50" ry="38" fill="url(#fol1)" />
      <ellipse cx="1080" cy="90" rx="68" ry="52" fill="url(#fol4)" />
      <ellipse cx="1060" cy="50" rx="75" ry="55" fill="url(#fol3)" />
      <ellipse cx="1100" cy="40" rx="50" ry="38" fill="url(#folLight)" opacity="0.35" />

      <!-- BOTTOM EDGE TREES -->
      <g filter="url(#softShadow)">
        <path d="M300,900 Q295,820 305,740 Q310,700 302,660"
          fill="none" stroke="url(#bark1)" stroke-width="30" stroke-linecap="round" />
        <path d="M302,690 Q270,665 250,670" fill="none" stroke="url(#bark2)" stroke-width="9" stroke-linecap="round" />
        <path d="M305,680 Q335,655 355,660" fill="none" stroke="url(#bark2)" stroke-width="8" stroke-linecap="round" />
      </g>
      <ellipse cx="260" cy="660" rx="55" ry="42" fill="url(#folDark)" />
      <ellipse cx="302" cy="630" rx="75" ry="58" fill="url(#fol1)" />
      <ellipse cx="350" cy="650" rx="48" ry="36" fill="url(#fol4)" />
      <ellipse cx="300" cy="610" rx="58" ry="44" fill="url(#folLight)" opacity="0.4" />

      <g filter="url(#softShadow)">
        <path d="M1300,900 Q1305,825 1298,745 Q1292,705 1300,665"
          fill="none" stroke="url(#bark1)" stroke-width="28" stroke-linecap="round" />
        <path d="M1298,695 Q1270,670 1252,675" fill="none" stroke="url(#bark2)" stroke-width="8" stroke-linecap="round" />
        <path d="M1302,680 Q1328,658 1345,663" fill="none" stroke="url(#bark2)" stroke-width="7" stroke-linecap="round" />
      </g>
      <ellipse cx="1260" cy="668" rx="50" ry="38" fill="url(#folDark)" />
      <ellipse cx="1300" cy="638" rx="70" ry="55" fill="url(#fol3)" />
      <ellipse cx="1340" cy="656" rx="45" ry="34" fill="url(#fol2)" />
      <ellipse cx="1298" cy="618" rx="55" ry="42" fill="url(#folLight)" opacity="0.38" />

      <!-- VINES hanging from canopy -->
      <path d="M470,180 q-8,35 3,70 q8,28 -4,55 q-6,20 2,40" stroke="#3D8A28" stroke-width="3" fill="none" opacity="0.45" />
      <path d="M555,170 q5,25 -2,50 q-5,22 2,42" stroke="#2D7520" stroke-width="2.5" fill="none" opacity="0.4" />
      <path d="M760,165 q-6,30 2,60 q5,20 -3,38" stroke="#3D8A28" stroke-width="2.5" fill="none" opacity="0.38" />
      <path d="M850,155 q4,28 -1,55 q-4,18 2,35" stroke="#2D7520" stroke-width="2" fill="none" opacity="0.35" />
      <path d="M1040,185 q-5,30 3,58 q5,22 -2,40" stroke="#3D8A28" stroke-width="2.5" fill="none" opacity="0.4" />
      <path d="M1120,170 q4,25 -2,48 q-5,18 1,35" stroke="#2D7520" stroke-width="2" fill="none" opacity="0.35" />
      <!-- Vine leaves -->
      <g v-for="(p, i) in [{x:468,y:230},{x:555,y:210},{x:762,y:220},{x:1042,y:238}]" :key="`vl-${i}`" opacity="0.5">
        <ellipse :cx="p.x" :cy="p.y" rx="5" ry="3.5" fill="#4CAF50" :transform="`rotate(${-20 + i * 15}, ${p.x}, ${p.y})`" />
        <ellipse :cx="p.x + 3" :cy="p.y + 12" rx="4.5" ry="3" fill="#5BBF42" :transform="`rotate(${15 + i * 10}, ${p.x + 3}, ${p.y + 12})`" />
      </g>

      <!-- DECORATIVE ELEMENTS -->
      <!-- Scattered rocks on soil -->
      <g>
        <ellipse cx="560" cy="570" rx="16" ry="9" fill="#706860" />
        <ellipse cx="560" cy="567" rx="14" ry="7" fill="#8A8278" />
        <ellipse cx="556" cy="565" rx="6" ry="3.5" fill="#A09890" opacity="0.5" />
      </g>
      <g>
        <ellipse cx="1020" cy="550" rx="14" ry="7.5" fill="#686260" />
        <ellipse cx="1020" cy="548" rx="12" ry="5.5" fill="#858078" />
        <ellipse cx="1017" cy="546" rx="5" ry="3" fill="#989290" opacity="0.5" />
      </g>
      <g>
        <ellipse cx="700" cy="640" rx="18" ry="10" fill="#706860" />
        <ellipse cx="700" cy="637" rx="15" ry="8" fill="#908880" />
        <ellipse cx="696" cy="635" rx="7" ry="4" fill="#AAA298" opacity="0.45" />
      </g>
      <g>
        <ellipse cx="910" cy="610" rx="12" ry="6.5" fill="#686058" />
        <ellipse cx="910" cy="608" rx="10" ry="5" fill="#807870" />
      </g>
      <!-- Pebbles -->
      <circle cx="620" cy="510" r="4.5" fill="#888078" />
      <circle cx="780" cy="650" r="3.5" fill="#7A7570" />
      <circle cx="980" cy="490" r="4" fill="#908880" />
      <circle cx="850" cy="625" r="3" fill="#686260" />
      <circle cx="720" cy="490" r="3.5" fill="#908880" />

      <!-- Mushrooms — near tree bases -->
      <g transform="translate(140, 688)">
        <rect x="-2.5" y="-10" width="5" height="12" fill="#F5E8D0" rx="2" />
        <ellipse cx="0" cy="-12" rx="10" ry="7" fill="#D32F2F" />
        <ellipse cx="0" cy="-14" rx="8" ry="4" fill="#E53935" opacity="0.6" />
        <circle cx="-4" cy="-13" r="1.8" fill="white" opacity="0.9" />
        <circle cx="3" cy="-11" r="1.3" fill="white" opacity="0.9" />
        <circle cx="0" cy="-15" r="1" fill="white" opacity="0.7" />
      </g>
      <g transform="translate(155, 695)">
        <rect x="-1.8" y="-7" width="3.6" height="9" fill="#F5E8D0" rx="1.5" />
        <ellipse cx="0" cy="-9" rx="7" ry="5" fill="#D32F2F" />
        <circle cx="-2.5" cy="-10" r="1.2" fill="white" opacity="0.85" />
        <circle cx="2" cy="-8.5" r="0.9" fill="white" opacity="0.85" />
      </g>
      <g transform="translate(1420, 695)">
        <rect x="-2" y="-8" width="4" height="10" fill="#F5E8D0" rx="1.5" />
        <ellipse cx="0" cy="-10" rx="8" ry="6" fill="#D32F2F" />
        <ellipse cx="0" cy="-12" rx="6" ry="3" fill="#E53935" opacity="0.5" />
        <circle cx="-3" cy="-11" r="1.5" fill="white" opacity="0.9" />
        <circle cx="2.5" cy="-9.5" r="1" fill="white" opacity="0.85" />
      </g>

      <!-- Light rays through canopy -->
      <polygon points="500,0 560,350 480,350" fill="rgba(255,245,180,0.06)" />
      <polygon points="780,0 830,320 750,320" fill="rgba(255,245,180,0.05)" />
      <polygon points="1060,0 1110,340 1030,340" fill="rgba(255,245,180,0.055)" />
      <polygon points="650,0 680,280 630,280" fill="rgba(255,245,180,0.03)" />
      <polygon points="920,0 950,300 900,300" fill="rgba(255,245,180,0.03)" />

      <!-- Fireflies / particles -->
      <circle cx="460" cy="380" r="3" fill="#FFEB3B" opacity="0.6" />
      <circle cx="1100" cy="360" r="2.5" fill="#FFEB3B" opacity="0.5" />
      <circle cx="780" cy="330" r="2" fill="#FFF176" opacity="0.4" />
      <circle cx="650" cy="290" r="2.5" fill="#FFEB3B" opacity="0.35" />
      <circle cx="950" cy="310" r="2" fill="#FFF59D" opacity="0.3" />
      <circle cx="550" cy="310" r="1.8" fill="#FFF176" opacity="0.35" />

      <!-- Soil dig marks -->
      <path d="M700,515 l12,4 l-4,12 l8,2" stroke="#5A4210" stroke-width="1.5" fill="none" opacity="0.35" />
      <path d="M900,545 l-8,6 l6,10" stroke="#5A4210" stroke-width="1.5" fill="none" opacity="0.3" />
      <path d="M810,490 l4,8 l-6,4 l5,6" stroke="#5A4210" stroke-width="1.5" fill="none" opacity="0.25" />
    </svg>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-label">{{ t.level }}</span>
          <span class="hud-value level-badge">{{ difficulty }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.score }}</span>
          <span class="hud-value score-value">{{ score }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{{ t.timeLeft }}</span>
          <span class="hud-value" :class="{ 'time-urgent': gameTimeLeft <= 10 }">
            {{ formatTime(gameTimeLeft) }}
          </span>
        </div>
      </div>
      <div class="hud-center">
        <span class="task-msg">{{ phase === 'showing' ? t.rememberMsg : t.hitMsg }}</span>
      </div>
      <div class="hud-right">
        <button v-if="showBatchSkip" class="back-btn skip-btn" @click="onBatchSkip">⏭ {{ t.skipGame }}</button>
        <button class="back-btn" @click="onBackClick">{{ t.backBtn }}</button>
      </div>
    </div>

    <!-- Stone count bubble (upper-right of soil area) -->
    <div class="stone-count-bubble">
      <div class="bubble-label">{{ t.stoneInfo || '石头信息' }}</div>
      <div class="bubble-content">
        <div class="bubble-row">
          <span class="bubble-text">{{ t.totalStones || '总数' }}: <strong>{{ levelConfig.totalStones }}</strong></span>
        </div>
        <div class="bubble-row">
          <span class="bubble-text">{{ t.fossilsToFind || '需找' }}: <strong>{{ levelConfig.fossils }}</strong></span>
        </div>
      </div>
    </div>

    <!-- Grid area -->
    <div class="grid-wrapper" ref="gridWrapper">
      <div class="stone-container" :class="{ 'show-shovel': phase === 'answering' }">
        <!-- Grid container -->
        <div
          class="game-grid"
          :style="{
            gridTemplateColumns: `repeat(${levelConfig.cols}, 1fr)`,
            gridTemplateRows: `repeat(${levelConfig.rows}, 1fr)`
          }"
        >
          <div
            v-for="cell in cells"
            :key="`${roundKey}-${cell.id}`"
            class="grid-cell"
            :class="cellClass(cell)"
            @click="onCellClick(cell)"
          >
            <!-- Paramecium Fossil SVG: only show for fossil cells, hide during answering -->
            <svg
              v-if="cell.isFossil && cell.state !== 'correct' && cell.state !== 'wrong'"
              viewBox="0 0 100 100"
              class="stone-svg"
              :style="{ opacity: phase === 'answering' && !cell.clicked ? 0 : 1 }"
            >
            <!-- Main body - slipper shape -->
            <ellipse cx="50" cy="50" rx="32" ry="42" fill="#C4B5A0" stroke="#7A6B56" stroke-width="3" />
            <!-- Inner body -->
            <ellipse cx="50" cy="50" rx="26" ry="36" fill="#E0D4C0" />
            <!-- Large nucleus (macronucleus) -->
            <ellipse cx="50" cy="42" rx="10" ry="14" fill="#8B7A65" opacity="0.7" />
            <!-- Small nucleus (micronucleus) -->
            <circle cx="50" cy="58" r="4" fill="#8B7A65" opacity="0.6" />
            <!-- Oral groove (口沟) -->
            <path d="M 35 35 Q 40 45 35 55" stroke="#7A6B56" stroke-width="2" fill="none" opacity="0.6" />
            <!-- Cilia on left side (纤毛) -->
            <line x1="18" y1="25" x2="10" y2="20" stroke="#7A6B56" stroke-width="2" />
            <line x1="18" y1="32" x2="8" y2="30" stroke="#7A6B56" stroke-width="2" />
            <line x1="18" y1="40" x2="6" y2="40" stroke="#7A6B56" stroke-width="2" />
            <line x1="18" y1="48" x2="8" y2="50" stroke="#7A6B56" stroke-width="2" />
            <line x1="18" y1="56" x2="6" y2="60" stroke="#7A6B56" stroke-width="2" />
            <line x1="18" y1="64" x2="8" y2="68" stroke="#7A6B56" stroke-width="2" />
            <line x1="20" y1="72" x2="12" y2="78" stroke="#7A6B56" stroke-width="2" />
            <!-- Cilia on right side -->
            <line x1="82" y1="25" x2="90" y2="20" stroke="#7A6B56" stroke-width="2" />
            <line x1="82" y1="32" x2="92" y2="30" stroke="#7A6B56" stroke-width="2" />
            <line x1="82" y1="40" x2="94" y2="40" stroke="#7A6B56" stroke-width="2" />
            <line x1="82" y1="48" x2="92" y2="50" stroke="#7A6B56" stroke-width="2" />
            <line x1="82" y1="56" x2="94" y2="60" stroke="#7A6B56" stroke-width="2" />
            <line x1="82" y1="64" x2="92" y2="68" stroke="#7A6B56" stroke-width="2" />
            <line x1="80" y1="72" x2="88" y2="78" stroke="#7A6B56" stroke-width="2" />
            <!-- Cilia on top -->
            <line x1="35" y1="8" x2="32" y2="2" stroke="#7A6B56" stroke-width="2" />
            <line x1="43" y1="8" x2="43" y2="1" stroke="#7A6B56" stroke-width="2" />
            <line x1="50" y1="8" x2="50" y2="1" stroke="#7A6B56" stroke-width="2" />
            <line x1="57" y1="8" x2="57" y2="1" stroke="#7A6B56" stroke-width="2" />
            <line x1="65" y1="8" x2="68" y2="2" stroke="#7A6B56" stroke-width="2" />
            <!-- Cilia on bottom -->
            <line x1="38" y1="92" x2="35" y2="98" stroke="#7A6B56" stroke-width="2" />
            <line x1="46" y1="92" x2="46" y2="99" stroke="#7A6B56" stroke-width="2" />
            <line x1="54" y1="92" x2="54" y2="99" stroke="#7A6B56" stroke-width="2" />
            <line x1="62" y1="92" x2="65" y2="98" stroke="#7A6B56" stroke-width="2" />
          </svg>
          <!-- Result emoji -->
          <span v-if="cell.state === 'correct'" class="result-emoji">✓</span>
          <span v-if="cell.state === 'wrong'" class="result-emoji">✗</span>
        </div>
      </div>
    </div>

      <!-- Answer timer bar -->
      <div v-if="phase === 'answering'" class="answer-timer-wrap">
        <div
          class="answer-timer-bar"
          :style="{ width: (answerTimeLeft / levelConfig.answerTime * 100) + '%' }"
          :class="{ urgent: answerTimeLeft <= 3 }"
        ></div>
      </div>

      <!-- Click feedback notification -->
      <transition name="click-feedback">
        <div v-if="clickFeedback" class="click-feedback-overlay">
          <div class="click-feedback-msg" :class="clickFeedback">
            <div class="feedback-icon">{{ clickFeedback === 'correct' ? '✓' : '✗' }}</div>
            <div class="feedback-text">{{ clickFeedback === 'correct' ? t.correct : t.wrong }}</div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Phase overlay messages -->
    <transition name="fade-msg">
      <div v-if="phase === 'feedback'" class="feedback-overlay">
        <div class="feedback-msg" :class="lastRoundCorrect ? 'msg-correct' : 'msg-wrong'">
          {{ lastRoundCorrect ? t.correct : t.wrong }}
        </div>
      </div>
    </transition>

    <!-- Confirm back dialog -->
    <div v-if="showBackConfirm" class="confirm-overlay" @click.self="showBackConfirm = false">
      <div class="confirm-box">
        <p class="confirm-text">{{ t.confirmBack }}</p>
        <div class="confirm-btns">
          <button class="cbtn cancel" @click="showBackConfirm = false">{{ t.cancel }}</button>
          <button class="cbtn confirm" @click="forceBack">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game15GamePage'
};
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import messages from '../i18n.js'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const props = defineProps({ lang: String, duration: Number })
const emit = defineEmits(['end', 'back'])

const t = computed(() => messages[props.lang] || messages.zh)
const showBatchSkip = shouldShowPbBatchSkip()
function onBatchSkip() { skipPbBatchGame() }

const LEVELS = [
  { totalStones: 4, fossils: 1, answerTime: 10, coeff: 1, rows: 2, cols: 2 },
  { totalStones: 6, fossils: 2, answerTime: 10, coeff: 1.5, rows: 2, cols: 3 },
  { totalStones: 9, fossils: 3, answerTime: 10, coeff: 2, rows: 3, cols: 3 },
  { totalStones: 12, fossils: 4, answerTime: 15, coeff: 2.5, rows: 3, cols: 4 },
  { totalStones: 16, fossils: 4, answerTime: 15, coeff: 3, rows: 4, cols: 4 },
  { totalStones: 20, fossils: 5, answerTime: 15, coeff: 3.5, rows: 4, cols: 5 },
]

// State
const roundKey = ref(0)
const difficulty = ref(getBatchStartDifficultyForGame('hsxb'))
const phase = ref('showing') // showing | answering | feedback | gameover
const cells = ref([])
const score = ref(0)
const gameTimeLeft = ref(props.duration)
const answerTimeLeft = ref(10)
const totalRounds = ref(0)
const correctRounds = ref(0)
const wrongRounds = ref(0)
const lastRoundCorrect = ref(false)
const showBackConfirm = ref(false)
const clickFeedback = ref(null)

// Window stats for 30s adjustment
const windowStart = ref(Date.now())
const windowCorrect = ref(0)
const windowTotal = ref(0)

// Reaction time tracking
const roundStartTime = ref(0)
const totalReactionMs = ref(0)
const reactionCount = ref(0)

const levelConfig = computed(() => LEVELS[difficulty.value - 1])

let gameTimer = null
let showTimer = null
let answerTimer = null
let feedbackTimer = null

function generateGrid() {
  const { fossils, rows, cols } = levelConfig.value

  // Calculate grid positioning (centered in soil area)
  const centerX = 50 // vw
  const centerY = 55 // vh (moved up to center in soil area)

  const positions = []

  // Generate grid positions
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = centerX + (col - (cols - 1) / 2) * 12 // 12vmin spacing
      const y = centerY + (row - (rows - 1) / 2) * 12
      positions.push({ x, y })
    }
  }

  // Shuffle and pick fossil indices
  const indices = Array.from({ length: positions.length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const fossilSet = new Set(indices.slice(0, fossils))

  cells.value = positions.map((pos, i) => ({
    id: i,
    isFossil: fossilSet.has(i),
    state: 'normal',
    clicked: false,
    x: pos.x,
    y: pos.y,
  }))
}

function startRound() {
  roundKey.value++
  generateGrid()
  phase.value = 'showing'
  // All stones visible during showing phase (no state change needed)
  // Hide after 2.5s
  clearTimeout(showTimer)
  showTimer = setTimeout(() => {
    startAnswering()
  }, 2500)
}

function startAnswering() {
  phase.value = 'answering'
  answerTimeLeft.value = levelConfig.value.answerTime
  roundStartTime.value = Date.now()
  clearInterval(answerTimer)
  answerTimer = setInterval(() => {
    answerTimeLeft.value--
    if (answerTimeLeft.value <= 0) {
      clearInterval(answerTimer)
      evaluateRound(false)
    }
  }, 1000)
}

function onCellClick(cell) {
  if (phase.value !== 'answering' || cell.clicked) return
  cell.clicked = true
  const { fossils } = levelConfig.value

  if (cell.isFossil) {
    cell.state = 'correct'
  } else {
    cell.state = 'wrong'
  }

  // Check if all fossils have been clicked
  const clickedCount = cells.value.filter(c => c.clicked).length
  if (clickedCount >= fossils) {
    clearInterval(answerTimer)
    const allCorrect = cells.value.filter(c => c.clicked).every(c => c.isFossil)
    // Only show feedback overlay when all clicks are done
    const hasWrong = cells.value.some(c => c.clicked && !c.isFossil)
    clickFeedback.value = hasWrong ? 'wrong' : 'correct'
    setTimeout(() => {
      clickFeedback.value = null
    }, 600)
    evaluateRound(allCorrect)
  }
}

function evaluateRound(success) {
  clearInterval(answerTimer)
  // Mark missed fossils and wrong clicks
  cells.value.forEach(c => {
    if (c.isFossil && !c.clicked) {
      // Missed fossil - keep it visible but mark as missed
      c.state = 'missed'
    }
  })

  totalRounds.value++
  if (success) {
    correctRounds.value++
    const pts = Math.round(5 * levelConfig.value.coeff)
    score.value += pts
    // Reaction time
    const rt = (Date.now() - roundStartTime.value) / 1000
    totalReactionMs.value += rt
    reactionCount.value++
  } else {
    wrongRounds.value++
  }

  windowTotal.value++
  if (success) windowCorrect.value++

  lastRoundCorrect.value = success
  phase.value = 'feedback'

  // Check 30s window adjustment
  const elapsed = (Date.now() - windowStart.value) / 1000
  if (elapsed >= 30) {
    adjustDifficulty()
    windowStart.value = Date.now()
    windowCorrect.value = 0
    windowTotal.value = 0
  }

  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    if (gameTimeLeft.value > 0) {
      startRound()
    }
  }, 1200)
}

function adjustDifficulty() {
  if (windowTotal.value === 0) return
  const rate = windowCorrect.value / windowTotal.value
  if (rate >= 0.9 && difficulty.value < 6) {
    difficulty.value++
  } else if (rate < 0.7 && difficulty.value > 1) {
    difficulty.value--
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss.toString().padStart(2, '0')}`
}

function endGame() {
  clearAllTimers()
  const avgReaction = reactionCount.value > 0
    ? (totalReactionMs.value / reactionCount.value).toFixed(1) : 0
  const durationSec = props.duration
  const durationLabel = durationSec === 60 ? t.value.min1 : durationSec === 180 ? t.value.min3 : t.value.min5
  emit('end', {
    score: score.value,
    finalLevel: difficulty.value,
    totalRounds: totalRounds.value,
    correctRounds: correctRounds.value,
    wrongRounds: wrongRounds.value,
    duration: props.duration,
    durationLabel,
    avgReaction,
  })
}

function clearAllTimers() {
  clearInterval(gameTimer)
  clearTimeout(showTimer)
  clearInterval(answerTimer)
  clearTimeout(feedbackTimer)
}

function onBackClick() {
  showBackConfirm.value = true
}

function forceBack() {
  clearAllTimers()
  showBackConfirm.value = false
  leavePbGameWindow({ confirm: false })
}

function cellClass(cell) {
  const cls = []
  if (phase.value === 'answering' && !cell.clicked) {
    cls.push('clickable')
  }
  if (cell.state === 'missed') {
    cls.push('missed')
  }
  return cls
}

onMounted(() => {
  startRound()
  gameTimer = setInterval(() => {
    gameTimeLeft.value--
    if (gameTimeLeft.value <= 0) {
      clearAllTimers()
      endGame()
    }
  }, 1000)
})

onUnmounted(() => {
  clearAllTimers()
})
</script>

<style scoped>
.game-page {
  width: 100vw;
  height: 100vh;
  background: #4A8B38;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* SVG Forest Background */
.forest-bg-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* HUD */
.hud {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5vmin 3vmin;
  min-height: 8vmin;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.hud-left {
  display: flex;
  gap: 2vmin;
}
.hud-item {
  background: rgba(120, 53, 15, 0.8);
  backdrop-filter: blur(4px);
  padding: 1.2vmin 2vmin;
  border-radius: 1.5vmin;
  border: 0.2vmin solid rgba(251, 191, 36, 0.6);
  box-shadow: 0 0.5vmin 1.5vmin rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3vmin;
}
.hud-label {
  font-size: 1.2vmin;
  color: rgba(251, 191, 36, 0.8);
  letter-spacing: 0.1vmin;
}
.hud-value {
  font-size: 2.5vmin;
  font-weight: 800;
  color: #fef3c7;
}
.level-badge {
  color: #fbbf24;
}
.score-value {
  color: #fef3c7;
}
.time-urgent {
  color: #fca5a5 !important;
  animation: blink 0.6s step-end infinite;
}
@keyframes blink {
  50% { opacity: 0.3; }
}

.hud-center {
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2vmin;
}
.task-msg {
  font-size: 3.5vmin;
  color: #fef3c7;
  font-weight: 900;
  text-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.8), 0 0 2vmin rgba(251, 191, 36, 0.6);
  background: linear-gradient(135deg, rgba(146, 64, 14, 0.95), rgba(120, 53, 15, 0.95));
  backdrop-filter: blur(6px);
  padding: 2vmin 4vmin;
  border-radius: 2vmin;
  border: 0.3vmin solid rgba(251, 191, 36, 0.8);
  box-shadow: 0 0.5vmin 2vmin rgba(0,0,0,0.5), 0 0 1.5vmin rgba(251, 191, 36, 0.4);
  letter-spacing: 0.1vmin;
}

.hud-right { display: flex; align-items: center; gap: 10px; }
.back-btn {
  padding: 1.2vmin 2.5vmin;
  font-size: 1.6vmin;
  font-weight: 700;
  background: rgba(127, 29, 29, 0.8);
  backdrop-filter: blur(4px);
  border: 0.2vmin solid rgba(239, 68, 68, 0.6);
  color: #fca5a5;
  border-radius: 1.2vmin;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0.3vmin 1vmin rgba(0,0,0,0.3);
}
.back-btn:hover {
  background: rgba(127, 29, 29, 1);
  border-color: rgba(239, 68, 68, 0.8);
}

/* Grid area */
.grid-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2vmin;
  padding: 2vmin;
  position: relative;
  z-index: 15;
}

.stone-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.stone-container.show-shovel {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Cpath d='M44 8 L52 8 L52 56 L44 56 Z' fill='%238B6F47' stroke='%236D5230' stroke-width='2'/%3E%3Cpath d='M36 56 Q48 84 60 56 L56 44 Q48 40 40 44 Z' fill='%23708898' stroke='%234A5A68' stroke-width='3'/%3E%3Cellipse cx='48' cy='48' rx='4' ry='2' fill='%238B6A40' opacity='0.5'/%3E%3Cpath d='M42 12 L54 12 L54 16 L42 16 Z' fill='%235A3A18'/%3E%3C/svg%3E") 48 80, pointer;
}

.game-grid {
  display: grid;
  gap: 1vmin;
}

.grid-cell {
  width: 11vmin;
  height:11vmin;
  border-radius: 1vmin;
  background: radial-gradient(circle at 35% 35%, #8a7060, #5a4030);
  border: 0.2vmin solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s;
  position: relative;
  user-select: none;
  overflow: hidden;
}

.grid-cell:hover {
  transform: scale(1.05);
  border-color: rgba(255,255,255,0.3);
}

.grid-cell.correct {
  background: radial-gradient(circle at 35% 35%, #2e7d32, #1b5e20);
  border-color: rgba(76, 175, 80, 0.6);
}

.grid-cell.wrong {
  background: radial-gradient(circle at 35% 35%, #c62828, #7f0000);
  border-color: rgba(244, 67, 54, 0.6);
}

.grid-cell.missed {
  opacity: 0.6;
}

.result-emoji {
  position: absolute;
  font-weight: 900;
  color: white;
  font-size: 5vmin;
  z-index: 1;
  animation: resultPop 0.4s ease-out;
}

@keyframes resultPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

.stone-svg {
  width: 80%;
  height: 80%;
  transition: opacity 0.3s;
}

/* Click feedback notification */
.click-feedback-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
}

.click-feedback-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vmin;
  padding: 4vmin 6vmin;
  border-radius: 3vmin;
  animation: feedbackPop 0.6s ease-out;
}

.click-feedback-msg.correct {
  background: rgba(34, 197, 94, 0.95);
  border: 0.4vmin solid #86efac;
  box-shadow: 0 0 4vmin rgba(34, 197, 94, 0.8);
}

.click-feedback-msg.wrong {
  background: rgba(239, 68, 68, 0.95);
  border: 0.4vmin solid #fca5a5;
  box-shadow: 0 0 4vmin rgba(239, 68, 68, 0.8);
}

.feedback-icon {
  font-size: 12vmin;
  font-weight: 900;
  color: white;
}

.feedback-text {
  font-size: 4vmin;
  font-weight: 800;
  color: white;
}

@keyframes feedbackPop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.click-feedback-enter-active, .click-feedback-leave-active {
  transition: opacity 0.3s;
}
.click-feedback-enter-from, .click-feedback-leave-to {
  opacity: 0;
}

/* Answer timer */
.answer-timer-wrap {
  width: min(50vmin, 80vw);
  height: 0.8vmin;
  background: rgba(255,255,255,0.1);
  border-radius: 1vmin;
  overflow: hidden;
}
.answer-timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 1s linear;
  border-radius: 1vmin;
}
.answer-timer-bar.urgent {
  background: linear-gradient(90deg, #f44336, #ff5722);
}

/* Feedback overlay */
.feedback-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.feedback-msg {
  font-size: 7vmin;
  font-weight: 900;
  padding: 2vmin 5vmin;
  border-radius: 2vmin;
  animation: msgPop 0.3s ease-out;
}
@keyframes msgPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.msg-correct {
  color: #a5d6a7;
  background: rgba(27, 94, 32, 0.85);
  border: 0.3vmin solid rgba(76,175,80,0.6);
  text-shadow: 0 0 2vmin rgba(76,175,80,0.6);
}
.msg-wrong {
  color: #ef9a9a;
  background: rgba(127, 0, 0, 0.85);
  border: 0.3vmin solid rgba(244,67,54,0.6);
  text-shadow: 0 0 2vmin rgba(244,67,54,0.6);
}

.fade-msg-enter-active, .fade-msg-leave-active { transition: opacity 0.3s; }
.fade-msg-enter-from, .fade-msg-leave-to { opacity: 0; }

/* Confirm dialog */
.confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.confirm-box {
  background: linear-gradient(160deg, #2e1a0a, #1a0c05);
  border: 0.2vmin solid rgba(255,200,100,0.3);
  border-radius: 2vmin;
  padding: 3.5vmin 5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  box-shadow: 0 2vmin 5vmin rgba(0,0,0,0.5);
}
.confirm-text {
  color: #f5e6c8;
  font-size: 2.2vmin;
  font-weight: 600;
}
.confirm-btns {
  display: flex;
  gap: 2vmin;
}
.cbtn {
  padding: 1.2vmin 3.5vmin;
  font-size: 2vmin;
  font-weight: 700;
  border-radius: 1vmin;
  cursor: pointer;
  transition: all 0.2s;
}
.cbtn.cancel {
  background: rgba(255,255,255,0.1);
  border: 0.2vmin solid rgba(255,255,255,0.2);
  color: #f5e6c8;
}
.cbtn.cancel:hover { background: rgba(255,255,255,0.2); }
.cbtn.confirm {
  background: linear-gradient(135deg, #8B5E2A, #C47C3A);
  border: 0.2vmin solid rgba(255,200,100,0.4);
  color: #f5e6c8;
}
.cbtn.confirm:hover {
  background: linear-gradient(135deg, #A06E35, #D48940);
}

/* Stone count bubble */
.stone-count-bubble {
  position: absolute;
  top: 16vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: linear-gradient(135deg, rgba(139, 94, 42, 0.95), rgba(120, 80, 35, 0.95));
  backdrop-filter: blur(6px);
  border: 0.3vmin solid rgba(251, 191, 36, 0.7);
  border-radius: 2vmin;
  padding: 2vmin 3vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.4), 0 0 1.5vmin rgba(251, 191, 36, 0.3);
  animation: bubblePulse 2s ease-in-out infinite;
}

@keyframes bubblePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.bubble-label {
  font-size: 1.4vmin;
  color: rgba(251, 191, 36, 0.9);
  text-align: center;
  margin-bottom: 1vmin;
  font-weight: 700;
  letter-spacing: 0.1vmin;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 1.2vmin;
}

.bubble-row {
  display: flex;
  align-items: center;
  gap: 1vmin;
}

.bubble-icon {
  font-size: 2.5vmin;
}

.bubble-text {
  font-size: 2vmin;
  color: #fef3c7;
  font-weight: 600;
}

.bubble-text strong {
  font-size: 2.8vmin;
  color: #fbbf24;
  font-weight: 900;
}

/* Bottom instructions - no specific class needed, styled inline in template */

</style>
