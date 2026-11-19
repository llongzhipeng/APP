<template>
  <div class="room" :class="{ fading: fading }">
    <!-- 环境光晕 -->
    <div class="ambient-light"></div>
    <div class="window-light"></div>

    <!-- 后墙 -->
    <div class="wall back-wall">
      <div class="wallpaper"></div>
      <div class="molding molding-top"></div>
      <div class="molding molding-bottom"></div>
      <!-- 装饰画 -->
      <div class="painting">
        <div class="painting-frame">
          <div class="painting-canvas">
            <div class="mountain m1"></div>
            <div class="mountain m2"></div>
            <div class="sun"></div>
          </div>
        </div>
      </div>
      <!-- 窗户 -->
      <div class="window">
        <div class="window-frame">
          <div class="pane p1"></div>
          <div class="pane p2"></div>
          <div class="pane p3"></div>
          <div class="pane p4"></div>
        </div>
        <div class="curtain curtain-l"></div>
        <div class="curtain curtain-r"></div>
      </div>
    </div>

    <!-- 木地板 -->
    <div class="floor">
      <div class="plank" v-for="i in 8" :key="i" :style="{ left: ((i - 1) * 12.5) + '%' }"></div>
      <div class="rug">
        <div class="rug-inner"></div>
      </div>
    </div>

    <!-- 位置槽标记（细线框 + 编号，帮助玩家记忆区域） -->
    <div class="pos-grid">
      <div class="pos-slot" v-for="p in positions" :key="p.id"
        :style="{ left: p.x + '%', top: p.y + '%' }">
        <div class="pos-label">{{ p.id }}</div>
      </div>
    </div>

    <!-- 摆放的物品（按 placements 定位） -->
    <div class="items">
      <div class="item-wrap"
        v-for="pl in placements" :key="pl.item + pl.pos"
        :class="{ hi: pl.hi }"
        :style="itemStyle(pl)">
        <div class="hi-ring" v-if="pl.hi"></div>
        <div class="hi-arrow" v-if="pl.hi">▼</div>

        <!-- 花瓶 -->
        <svg v-if="pl.item === 'vase'" viewBox="0 0 120 180" class="obj-svg vase-svg">
          <defs>
            <radialGradient :id="'vg-' + pl.pos" cx="35%" cy="35%" r="70%">
              <stop offset="0%" :stop-color="lighten(colorHex(pl.color), 40)"/>
              <stop offset="55%" :stop-color="colorHex(pl.color)"/>
              <stop offset="100%" :stop-color="darken(colorHex(pl.color), 35)"/>
            </radialGradient>
          </defs>
          <ellipse cx="60" cy="172" rx="30" ry="5" fill="#00000055"/>
          <path d="M45,20 Q40,35 45,50 Q20,70 25,120 Q30,160 60,168 Q90,160 95,120 Q100,70 75,50 Q80,35 75,20 Z"
            :fill="'url(#vg-' + pl.pos + ')'" stroke="#00000033" stroke-width="1"/>
          <ellipse cx="55" cy="55" rx="8" ry="18" fill="#ffffff55"/>
          <g transform="translate(60,10)">
            <circle r="8" fill="#ffd166"/>
            <circle cx="-10" cy="-4" r="6" fill="#ef476f"/>
            <circle cx="10" cy="-4" r="6" fill="#ef476f"/>
            <circle cx="0" cy="-12" r="6" fill="#ef476f"/>
            <circle r="3" fill="#8b5a00"/>
          </g>
          <line x1="60" y1="20" x2="60" y2="45" stroke="#2e7d32" stroke-width="2"/>
        </svg>

        <!-- 书本（一叠 3 本） -->
        <svg v-else-if="pl.item === 'book'" viewBox="0 0 120 120" class="obj-svg book-svg">
          <rect x="18" y="86" width="88" height="18" rx="2" :fill="colorHex(pl.color)" stroke="#00000055" stroke-width="1"/>
          <rect x="22" y="60" width="82" height="22" rx="2" :fill="lighten(colorHex(pl.color), 20)" stroke="#00000055" stroke-width="1"/>
          <rect x="14" y="30" width="90" height="26" rx="2" :fill="darken(colorHex(pl.color), 15)" stroke="#00000055" stroke-width="1"/>
          <line x1="26" y1="42" x2="94" y2="42" stroke="#ffffff88" stroke-width="1"/>
          <line x1="26" y1="72" x2="94" y2="72" stroke="#ffffff88" stroke-width="1"/>
        </svg>

        <!-- 钟表 -->
        <svg v-else-if="pl.item === 'clock'" viewBox="0 0 200 200" class="obj-svg clock-svg-obj">
          <defs>
            <radialGradient :id="'cface-'+pl.pos" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stop-color="#fffdf6"/>
              <stop offset="80%" stop-color="#f2e9d0"/>
              <stop offset="100%" stop-color="#c9b48a"/>
            </radialGradient>
            <linearGradient :id="'cring-'+pl.pos" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8b5a2b"/>
              <stop offset="45%" stop-color="#c9884b"/>
              <stop offset="100%" stop-color="#4a2f16"/>
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="95" :fill="'url(#cring-'+pl.pos+')'"/>
          <circle cx="100" cy="100" r="82" :fill="'url(#cface-'+pl.pos+')'" stroke="#8b6a3a" stroke-width="1"/>
          <g stroke="#3a2b1a" stroke-width="2" stroke-linecap="round">
            <line v-for="n in 12" :key="n"
              :x1="100 + Math.cos((n - 3) * Math.PI / 6) * 72"
              :y1="100 + Math.sin((n - 3) * Math.PI / 6) * 72"
              :x2="100 + Math.cos((n - 3) * Math.PI / 6) * 78"
              :y2="100 + Math.sin((n - 3) * Math.PI / 6) * 78" />
          </g>
          <line :x1="100" :y1="100"
            :x2="100 + Math.cos(hourAngle) * 42" :y2="100 + Math.sin(hourAngle) * 42"
            stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>
          <line :x1="100" :y1="100"
            :x2="100 + Math.cos(minAngle) * 62" :y2="100 + Math.sin(minAngle) * 62"
            stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="6" fill="#1a1a1a"/>
          <circle cx="100" cy="100" r="2.4" fill="#e6b04a"/>
        </svg>

        <!-- 上衣 -->
        <svg v-else-if="pl.item === 'shirt'" viewBox="0 0 100 100" class="obj-svg cloth-svg">
          <path d="M20,20 L35,10 Q50,22 65,10 L80,20 L92,35 L78,45 L78,90 L22,90 L22,45 L8,35 Z"
            :fill="colorHex(pl.color)" stroke="#00000055" stroke-width="1"/>
        </svg>

        <!-- 裤子 -->
        <svg v-else-if="pl.item === 'pants'" viewBox="0 0 100 100" class="obj-svg cloth-svg">
          <path d="M25,10 L75,10 L78,50 L70,95 L55,95 L50,55 L45,95 L30,95 L22,50 Z"
            :fill="colorHex(pl.color)" stroke="#00000055" stroke-width="1"/>
        </svg>

        <!-- 裙子 -->
        <svg v-else-if="pl.item === 'skirt'" viewBox="0 0 100 100" class="obj-svg cloth-svg">
          <path d="M30,10 L70,10 L85,90 L15,90 Z"
            :fill="colorHex(pl.color)" stroke="#00000055" stroke-width="1"/>
        </svg>
      </div>
    </div>

    <!-- 前景植物 -->
    <div class="plant">
      <div class="pot"></div>
      <div class="leaf l1"></div>
      <div class="leaf l2"></div>
      <div class="leaf l3"></div>
      <div class="leaf l4"></div>
    </div>
  </div>
</template>

<script>
import { COLOR_HEX, POSITIONS } from '../store.js'
export default {
  name: 'Room',
  props: {
    scene: { type: Object, required: true },
    placements: { type: Array, default: () => [] },
    fading: { type: Boolean, default: false }
  },
  data() {
    return { positions: POSITIONS }
  },
  computed: {
    hourAngle() {
      const h = (this.scene.clock ? this.scene.clock.hour : 3) % 12
      const m = this.scene.clock ? this.scene.clock.minute : 0
      return ((h + m / 60) * 30 - 90) * Math.PI / 180
    },
    minAngle() {
      const m = this.scene.clock ? this.scene.clock.minute : 0
      return (m * 6 - 90) * Math.PI / 180
    }
  },
  methods: {
    colorHex(c) { return COLOR_HEX[c] || '#ccc' },
    lighten(hex, p) { return shade(hex, p) },
    darken(hex, p) { return shade(hex, -p) },
    itemStyle(pl) {
      const p = POSITIONS.find(pp => pp.id === pl.pos)
      return { left: p.x + '%', top: p.y + '%' }
    }
  }
}
function shade(hex, percent) {
  const c = hex.replace('#', '')
  const num = parseInt(c, 16)
  let r = (num >> 16) + Math.round(255 * percent / 100)
  let g = ((num >> 8) & 0xff) + Math.round(255 * percent / 100)
  let b = (num & 0xff) + Math.round(255 * percent / 100)
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
</script>

<style scoped>
.room {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  background:
    linear-gradient(180deg, #f6ecd8 0%, #ebd7b0 52%, #ebd7b0 52%, #b48a5b 52.5%, #a87848 100%);
  box-shadow: inset 0 0 100px rgba(0,0,0,0.18), 0 24px 60px rgba(0,0,0,0.3);
  transition: opacity .8s ease, filter .8s ease;
}
.room.fading { opacity: 0; filter: blur(6px); }

.ambient-light {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255,240,200,0.35), transparent 55%);
  pointer-events: none;
}
.window-light {
  position: absolute; left: 8%; top: 18%; width: 30%; height: 25%;
  background: radial-gradient(ellipse, rgba(255,238,180,0.55), transparent 70%);
  transform: skewY(6deg);
  filter: blur(10px);
  pointer-events: none;
}

/* 墙 */
.wall.back-wall { position: absolute; left: 0; right: 0; top: 0; height: 52%; }
.wallpaper {
  position: absolute; inset: 0;
  background:
    repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 22px),
    linear-gradient(180deg, #f8ecd3 0%, #e9d3ab 100%);
}
.molding {
  position: absolute; left: 0; right: 0;
  background: linear-gradient(180deg, #f0dfbc, #c9a878);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.molding-top { top: 0; height: 3.5%; }
.molding-bottom { bottom: 0; height: 4%; background: linear-gradient(180deg, #c9a878, #8b6a3a); }

/* 装饰画 */
.painting { position: absolute; left: 62%; top: 8%; width: 14%; height: 18%; }
.painting-frame {
  width: 100%; height: 100%; padding: 6%;
  background: linear-gradient(135deg, #6b4a24, #3a2612);
  border-radius: 4px;
  box-shadow: 0 8px 18px rgba(0,0,0,0.35), inset 0 0 0 2px #d4a865;
}
.painting-canvas {
  width: 100%; height: 100%;
  position: relative; overflow: hidden;
  background: linear-gradient(180deg, #ffd28a 0%, #ffb26b 45%, #7fbfa8 100%);
  border-radius: 2px;
}
.mountain { position: absolute; bottom: 15%; }
.mountain.m1 { left: -10%; width: 70%; height: 55%; background: #4a6b73; clip-path: polygon(0 100%, 40% 30%, 100% 100%); }
.mountain.m2 { right: -10%; width: 70%; height: 45%; background: #2d4a56; clip-path: polygon(0 100%, 55% 20%, 100% 100%); }
.sun { position: absolute; top: 15%; right: 30%; width: 14%; height: 20%; background: #ffe8a0; border-radius: 50%; box-shadow: 0 0 12px #fff2b0; }

/* 窗户 */
.window {
  position: absolute; left: 4%; top: 8%; width: 20%; height: 22%;
  border-radius: 6px;
  background: linear-gradient(180deg, #a5d1ec 0%, #dff1ff 100%);
  box-shadow: 0 10px 24px rgba(0,0,0,0.2), inset 0 0 0 6px #f4e0b8, inset 0 0 0 8px #8b6a3a;
  overflow: hidden;
}
.window-frame { position: absolute; inset: 8px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 6px; }
.pane { background: linear-gradient(160deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1) 40%, rgba(180,220,240,0.4)); border: 1px solid #a58549; border-radius: 2px; }
.curtain { position: absolute; top: 0; bottom: 0; width: 18%; background: repeating-linear-gradient(90deg, #b83b3b, #8f2a2a 6px, #b83b3b 12px); box-shadow: inset -6px 0 8px rgba(0,0,0,0.25); }
.curtain-l { left: 0; }
.curtain-r { right: 0; }

/* 地板 */
.floor { position: absolute; left: 0; right: 0; bottom: 0; height: 48%; overflow: hidden; perspective: 800px; }
.plank { position: absolute; top: 0; bottom: 0; width: 12.5%; background: repeating-linear-gradient(180deg, #a3763f 0px, #b7864a 20px, #9a6a35 40px, #b17d43 60px); border-right: 2px solid #6b4a24; box-shadow: inset 0 0 20px rgba(0,0,0,0.15); }
.rug { position: absolute; left: 12%; right: 12%; bottom: 4%; height: 60%; background: #6b2c2c; border-radius: 50% / 30%; box-shadow: 0 12px 30px rgba(0,0,0,0.4); padding: 3%; }
.rug-inner { width: 100%; height: 100%; background: repeating-linear-gradient(45deg, #8b3a3a 0 8px, #b04747 8px 16px), #8b3a3a; border-radius: 50% / 30%; border: 3px dashed #f2c48a; }

/* 位置槽（半透明标记，帮助玩家形成空间锚点） */
.pos-grid { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.pos-slot {
  position: absolute;
  width: 16vmin; height: 16vmin;
  transform: translate(-50%, -50%);
  border: 2px dashed rgba(255,255,255,0.32);
  border-radius: 18px;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15), inset 0 0 12px rgba(255,255,255,0.06);
  display: flex; align-items: flex-start; justify-content: flex-start;
}
.pos-label {
  margin: 0.6vmin 0 0 0.8vmin;
  padding: 0.2vmin 0.9vmin;
  background: linear-gradient(135deg, #ffd166, #ef476f);
  color: #fff; font-weight: 900;
  font-size: 1.8vmin; letter-spacing: 0.4px;
  border-radius: 999px;
  box-shadow: 0 0.4vmin 1vmin rgba(0,0,0,0.35);
}

/* 物品容器 */
.items { position: absolute; inset: 0; z-index: 4; }
.item-wrap {
  position: absolute;
  width: 14vmin; height: 14vmin;
  transform: translate(-50%, -50%);
  display: flex; align-items: center; justify-content: center;
  filter: drop-shadow(0 0.6vmin 1.4vmin rgba(0,0,0,0.5));
}
.obj-svg { width: 100%; height: 100%; }
.cloth-svg { width: 88%; height: 88%; }
.book-svg { width: 92%; height: 92%; }
.vase-svg { width: 78%; height: 100%; }
.clock-svg-obj { width: 88%; height: 88%; }

/* ⭐ 高亮：紧贴物品的强对比发光圈 + 顶部指示箭头 */
.hi-ring {
  position: absolute; inset: -6%;
  border: 4px solid #00e5ff;
  border-radius: 18px;
  box-shadow:
    0 0 0 3px rgba(0, 229, 255, 0.35),
    0 0 30px 8px rgba(255, 0, 200, 0.85),
    inset 0 0 20px rgba(0, 229, 255, 0.7);
  animation: hiPulse 1s ease-in-out infinite;
  pointer-events: none; z-index: 6;
}
.hi-arrow {
  position: absolute; left: 50%; top: -3.6vmin;
  transform: translateX(-50%);
  color: #ff2fd0;
  font-size: 3.2vmin; font-weight: 900;
  text-shadow: 0 0 8px #fff, 0 0 16px #ff2fd0, 0 2px 4px #000;
  animation: hiBounce 0.7s ease-in-out infinite;
  z-index: 7; pointer-events: none;
}
@keyframes hiPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.35), 0 0 30px 8px rgba(255, 0, 200, 0.85), inset 0 0 20px rgba(0, 229, 255, 0.7); border-color: #00e5ff; }
  50% { box-shadow: 0 0 0 6px rgba(255, 47, 208, 0.45), 0 0 50px 14px rgba(0, 229, 255, 0.9), inset 0 0 28px rgba(255, 47, 208, 0.8); border-color: #ff2fd0; }
}
@keyframes hiBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-8px); }
}
.hi > svg { filter: drop-shadow(0 0 10px #00e5ff) drop-shadow(0 0 20px #ff2fd0); }

/* 前景植物 */
.plant { position: absolute; right: 2%; bottom: 4%; width: 7%; height: 22%; z-index: 5; }
.pot { position: absolute; bottom: 0; left: 10%; right: 10%; height: 40%; background: linear-gradient(180deg, #b06848, #6a3a20); border-radius: 8px 8px 20% 20%; box-shadow: 0 4px 8px rgba(0,0,0,0.35); }
.leaf { position: absolute; bottom: 35%; width: 55%; height: 55%; background: linear-gradient(135deg, #4a8f4a, #1e5b1e); border-radius: 50% 10% 50% 10%; transform-origin: bottom right; }
.leaf.l1 { left: 5%; transform: rotate(-25deg); }
.leaf.l2 { left: 20%; transform: rotate(-5deg) scale(1.1); }
.leaf.l3 { left: 35%; transform: rotate(15deg); }
.leaf.l4 { left: 50%; transform: rotate(35deg); background: linear-gradient(135deg, #5aa05a, #2e6e2e); }
</style>
