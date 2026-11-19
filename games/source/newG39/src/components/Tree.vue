<template>
  <svg viewBox="0 0 220 340" class="tree-svg">
    <defs>
      <!-- Bark -->
      <linearGradient :id="'bark-'+uid" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%"  stop-color="#3a1f0c"/>
        <stop offset="40%" stop-color="#7a4a24"/>
        <stop offset="70%" stop-color="#9f6836"/>
        <stop offset="100%" stop-color="#3a1f0c"/>
      </linearGradient>
      <!-- Foliage: cartoon fresh green -->
      <radialGradient :id="'leafA-'+uid" cx="35%" cy="30%" r="80%">
        <stop offset="0%"  stop-color="#b9e08a"/>
        <stop offset="55%" stop-color="#4a9a3f"/>
        <stop offset="100%" stop-color="#1f4a24"/>
      </radialGradient>
      <radialGradient :id="'leafB-'+uid" cx="35%" cy="30%" r="80%">
        <stop offset="0%"  stop-color="#a2d074"/>
        <stop offset="55%" stop-color="#3d8a37"/>
        <stop offset="100%" stop-color="#153a1a"/>
      </radialGradient>
    </defs>

    <!-- Ground shadow -->
    <ellipse cx="110" cy="330" rx="76" ry="9" fill="rgba(0,0,0,.45)"/>

    <!-- ============ TRUNK ============ -->
    <!-- Main trunk (thick, with slight base flare) -->
    <path d="M78 328 Q76 300 82 260 Q90 210 96 170 Q100 150 104 130 L116 130 Q120 150 124 170 Q130 210 138 260 Q144 300 142 328 Z"
          :fill="`url(#bark-${uid})`" stroke="#22110a" stroke-width="3"/>
    <!-- Bark texture (cracks) -->
    <path d="M92 308 Q90 250 96 200 Q100 160 106 130" stroke="#22110a" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M126 312 Q128 250 122 200 Q118 160 114 130" stroke="#22110a" stroke-width="1.6" fill="none" opacity=".45"/>
    <ellipse cx="98" cy="240" rx="4" ry="7" fill="#22110a" opacity=".45"/>
    <ellipse cx="122" cy="220" rx="3" ry="5" fill="#22110a" opacity=".4"/>
    <!-- Highlight -->
    <path d="M106 320 Q104 260 108 200 Q110 160 112 132" stroke="#c99668" stroke-width="1.4" fill="none" opacity=".5"/>

    <!-- ============ BRANCHES (thick, cartoon, visible beyond leaves) ============ -->
    <g :fill="`url(#bark-${uid})`" stroke="#22110a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <!-- Left main branch -->
      <path d="M100 148 Q78 138 54 128 Q44 124 34 128 L38 138 Q52 140 66 148 Q86 156 104 158 Z"/>
      <!-- Right main branch -->
      <path d="M120 138 Q144 128 168 118 Q180 114 190 120 L186 128 Q172 130 156 138 Q136 148 116 148 Z"/>
      <!-- Upper-left branch -->
      <path d="M104 120 Q94 96 78 74 Q70 62 62 62 L66 74 Q76 92 88 112 Q94 122 108 128 Z"/>
      <!-- Upper-right branch -->
      <path d="M116 118 Q126 96 142 76 Q150 64 158 66 L154 78 Q144 96 132 116 Q124 126 114 128 Z"/>
      <!-- Center top spike (for canopy attachment) -->
      <path d="M105 110 Q106 88 108 66 Q110 52 112 46 L118 46 Q120 52 120 66 Q120 88 121 112 Z"/>
    </g>

    <!-- ============ LEAF CLUSTERS (cartoon, big rounded clumps with outlines) ============ -->
    <g stroke="#153a1a" stroke-width="2.5">
      <!-- Left branch tip cluster -->
      <path d="M14 128 Q8 108 24 96 Q30 78 52 82 Q68 74 82 88 Q98 90 96 108 Q104 122 90 132 Q84 148 62 146 Q42 152 28 142 Q14 142 14 128 Z"
            :fill="`url(#leafA-${uid})`"/>
      <!-- Right branch tip cluster -->
      <path d="M132 132 Q126 148 144 152 Q160 160 178 152 Q198 148 202 132 Q214 122 206 106 Q210 90 194 86 Q182 74 164 82 Q146 78 138 92 Q124 100 128 116 Q120 128 132 132 Z"
            :fill="`url(#leafA-${uid})`"/>
      <!-- Upper-left cluster -->
      <path d="M28 62 Q22 44 40 34 Q48 20 66 26 Q82 20 88 38 Q98 46 90 60 Q94 76 76 78 Q62 88 48 78 Q32 78 28 62 Z"
            :fill="`url(#leafB-${uid})`"/>
      <!-- Upper-right cluster -->
      <path d="M134 60 Q128 42 146 32 Q156 18 174 24 Q192 20 196 38 Q206 48 196 62 Q200 78 182 80 Q170 90 154 80 Q136 78 134 60 Z"
            :fill="`url(#leafB-${uid})`"/>
      <!-- Central top canopy (largest, over the spike) -->
      <path d="M60 42 Q52 22 74 12 Q86 -4 108 4 Q130 -6 146 10 Q168 20 162 42 Q176 52 168 68 Q174 84 156 88 Q152 104 132 100 Q112 108 92 100 Q72 104 68 88 Q48 82 54 66 Q46 52 60 42 Z"
            :fill="`url(#leafA-${uid})`"/>
    </g>

    <!-- Individual leaf shapes for texture -->
    <g fill="#5aa155" stroke="#153a1a" stroke-width="1" opacity=".95">
      <path d="M40 20 Q48 8 58 16 Q52 30 40 20 Z"/>
      <path d="M90 -2 Q100 -10 108 0 Q102 12 90 -2 Z"/>
      <path d="M130 -4 Q140 -10 148 2 Q140 14 130 -4 Z"/>
      <path d="M170 20 Q180 12 186 22 Q178 32 170 20 Z"/>
      <path d="M22 100 Q30 92 38 100 Q30 110 22 100 Z"/>
      <path d="M186 96 Q194 88 202 96 Q194 106 186 96 Z"/>
      <path d="M30 140 Q38 132 46 140 Q38 150 30 140 Z"/>
      <path d="M176 148 Q184 140 192 148 Q184 158 176 148 Z"/>
    </g>
    <!-- Leaf vein hints -->
    <g stroke="#153a1a" stroke-width=".9" fill="none" opacity=".6">
      <path d="M60 26 Q72 18 84 24"/>
      <path d="M100 8 Q112 2 124 8"/>
      <path d="M140 24 Q152 16 164 24"/>
      <path d="M46 100 Q60 92 74 100"/>
      <path d="M150 100 Q164 92 178 100"/>
      <path d="M40 128 Q54 120 68 128"/>
      <path d="M150 132 Q164 124 180 132"/>
    </g>
    <!-- Sunlight highlights on top -->
    <g fill="#dff2ae" opacity=".55">
      <ellipse cx="86" cy="10" rx="20" ry="6"/>
      <ellipse cx="126" cy="8" rx="16" ry="5"/>
      <ellipse cx="40" cy="46" rx="14" ry="5"/>
      <ellipse cx="180" cy="44" rx="14" ry="5"/>
      <ellipse cx="34" cy="112" rx="14" ry="5"/>
      <ellipse cx="180" cy="112" rx="14" ry="5"/>
    </g>
  </svg>
</template>

<script>
let n = 0
export default {
  data () { return { uid: 't' + (++n) } }
}
</script>

<style scoped>
.tree-svg { width: 100%; height: auto; display: block; filter: drop-shadow(0 12px 16px rgba(0,0,0,.45)); }
</style>
