<template>
  <svg viewBox="-3 -3 106 106" preserveAspectRatio="xMidYMid meet" style="width:100%; height:100%; display:block;">
    <defs v-if="hasHoles">
      <mask :id="maskId">
        <rect x="-3" y="-3" width="106" height="106" fill="white"/>
        <circle v-for="(h,i) in holesScr" :key="'m'+i" :cx="h.x" :cy="h.y" :r="h.r" fill="black"/>
      </mask>
    </defs>
    <defs v-if="foldArrow">
      <marker :id="arrowId" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#a5432b"/>
      </marker>
    </defs>
    <!-- Paper polygon: solid cream fill -->
    <polygon
      :points="shapePts"
      fill="#f0e4c4"
      stroke="#8a6f47"
      stroke-width="0.9"
      :mask="hasHoles ? 'url(#'+maskId+')' : null"
    />
    <!-- Dark hole visualization on top (adds depth) -->
    <g v-if="hasHoles">
      <circle
        v-for="(h,i) in holesScr"
        :key="'h'+i"
        :cx="h.x"
        :cy="h.y"
        :r="h.r*0.95"
        fill="#2a2419"
        opacity="0.9"
      />
    </g>
    <!-- Punch marks on folded paper -->
    <g v-if="punchesScr.length">
      <g v-for="(p,i) in punchesScr" :key="'p'+i">
        <circle :cx="p.x" :cy="p.y" :r="p.r*1.35" fill="none" stroke="#a5432b" stroke-width="1.1" stroke-dasharray="2 1.5"/>
        <circle :cx="p.x" :cy="p.y" :r="p.r*0.85" fill="#2a2419" opacity="0.88"/>
      </g>
    </g>
    <!-- Fold line -->
    <line
      v-if="foldLineScr"
      :x1="foldLineScr.x1"
      :y1="foldLineScr.y1"
      :x2="foldLineScr.x2"
      :y2="foldLineScr.y2"
      stroke="#a5432b"
      stroke-width="1.2"
      stroke-dasharray="3 2"
    />
    <!-- Fold arrow -->
    <path
      v-if="foldArrow"
      :d="foldArrow"
      fill="none"
      stroke="#a5432b"
      stroke-width="1.4"
      :marker-end="'url(#'+arrowId+')'"
    />
  </svg>
</template>

<script>
let PSVGuid = 0 // PaperSvg 唯一 ID 计数

export default {
  name: 'PaperSvg',
  props: {
    shape: { type: Array, default: () => [[0, 0], [1, 0], [1, 1], [0, 1]] }, // 纸面多边形（归一化坐标）
    holes: { type: Array, default: () => [] }, // 展开后的孔洞
    punches: { type: Array, default: () => [] }, // 折叠纸上的打孔标记
    foldLine: { type: Object, default: null }, // 折痕线段
    foldArrow: { type: String, default: null }, // 折叠方向箭头 path
  },
  data() {
    return {
      uid: ++PSVGuid, // 实例唯一 ID（mask/marker）
    }
  },
  computed: {
    /** mask 元素 id */
    maskId() { return 'phm' + this.uid },
    /** 箭头 marker id */
    arrowId() { return 'fa' + this.uid },
    /** 是否有孔洞需要 mask */
    hasHoles() { return this.holes && this.holes.length > 0 },
    /** 纸面多边形 points 字符串 */
    shapePts() {
      return this.shape.map(p => `${(p[0] * 100).toFixed(2)},${(p[1] * 100).toFixed(2)}`).join(' ')
    },
    /** 孔洞屏幕坐标 */
    holesScr() {
      return this.holes.map(h => ({ x: h.x * 100, y: h.y * 100, r: (h.r || 0.055) * 100 }))
    },
    /** 打孔标记屏幕坐标 */
    punchesScr() {
      return this.punches.map(p => ({
        x: (p.u != null ? p.u : p.x) * 100,
        y: (p.v != null ? p.v : p.y) * 100,
        r: (p.r || 0.055) * 100,
      }))
    },
    /** 折痕屏幕坐标 */
    foldLineScr() {
      if (!this.foldLine) return null
      const f = this.foldLine
      return { x1: f.x1 * 100, y1: f.y1 * 100, x2: f.x2 * 100, y2: f.y2 * 100 }
    },
  },
}
</script>
