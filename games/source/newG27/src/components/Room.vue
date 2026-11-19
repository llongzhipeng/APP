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

    <!-- 钟表（挂在后墙） -->
    <div class="clock-wrap" :class="{ hi: isHi('clock') }">
      <div class="hi-ring" v-if="isHi('clock')"></div>
      <div class="hi-arrow" v-if="isHi('clock')">▼</div>
      <svg viewBox="0 0 200 200" class="clock-svg">
        <defs>
          <radialGradient id="cface" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="#fffdf6"/>
            <stop offset="80%" stop-color="#f2e9d0"/>
            <stop offset="100%" stop-color="#c9b48a"/>
          </radialGradient>
          <linearGradient id="cring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#8b5a2b"/>
            <stop offset="45%" stop-color="#c9884b"/>
            <stop offset="100%" stop-color="#4a2f16"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#cring)"/>
        <circle cx="100" cy="100" r="82" fill="url(#cface)" stroke="#8b6a3a" stroke-width="1"/>
        <g stroke="#3a2b1a" stroke-width="2" stroke-linecap="round">
          <line v-for="n in 12" :key="n"
            :x1="100 + Math.cos((n - 3) * Math.PI / 6) * 72"
            :y1="100 + Math.sin((n - 3) * Math.PI / 6) * 72"
            :x2="100 + Math.cos((n - 3) * Math.PI / 6) * 78"
            :y2="100 + Math.sin((n - 3) * Math.PI / 6) * 78" />
        </g>
        <text v-for="n in 12" :key="'t'+n"
          :x="100 + Math.cos((n - 3) * Math.PI / 6) * 60"
          :y="100 + Math.sin((n - 3) * Math.PI / 6) * 60 + 6"
          text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#3a2b1a" font-weight="700">{{ n }}</text>
        <!-- 时针 -->
        <line :x1="100" :y1="100"
          :x2="100 + Math.cos(hourAngle) * 42" :y2="100 + Math.sin(hourAngle) * 42"
          stroke="#1a1a1a" stroke-width="5" stroke-linecap="round"/>
        <!-- 分针 -->
        <line :x1="100" :y1="100"
          :x2="100 + Math.cos(minAngle) * 62" :y2="100 + Math.sin(minAngle) * 62"
          stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="100" cy="100" r="5" fill="#1a1a1a"/>
        <circle cx="100" cy="100" r="2.2" fill="#e6b04a"/>
      </svg>
    </div>

    <!-- 书柜 + 书本 -->
    <div class="bookshelf" :class="{ hi: isHi('book') }">
      <div class="hi-ring" v-if="isHi('book')"></div>
      <div class="hi-arrow" v-if="isHi('book')">▼</div>
      <div class="shelf-body">
        <div class="shelf-top"></div>
        <div class="shelf-row">
          <div class="book"
            v-for="(bk, i) in scene.books" :key="i"
            :style="{ background: colorHex(bk.color), height: (60 + (i * 3) % 15) + '%' }">
            <div class="book-band"></div>
            <div class="book-band b2"></div>
          </div>
        </div>
        <div class="shelf-divider"></div>
        <div class="shelf-row shelf-row-2">
          <div class="deco-frame"></div>
          <div class="deco-vase-mini"></div>
          <div class="deco-clock-mini"></div>
        </div>
        <div class="shelf-bottom"></div>
      </div>
    </div>

    <!-- 衣柜 -->
    <div class="wardrobe">
      <div class="wardrobe-body">
        <div class="wardrobe-top"></div>
        <div class="wardrobe-inside">
          <div class="rail"></div>
          <!-- 上衣 -->
          <div class="cloth shirt" :class="{ hi: isHi('shirt') }" :style="{ '--c': colorHex(scene.shirt.color) }">
            <div class="hi-ring cloth-ring" v-if="isHi('shirt')"></div>
            <div class="hi-arrow cloth-arrow" v-if="isHi('shirt')">▼</div>
            <div class="hanger"></div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M20,20 L35,10 Q50,22 65,10 L80,20 L92,35 L78,45 L78,90 L22,90 L22,45 L8,35 Z"
                fill="var(--c)" stroke="#00000033" stroke-width="1"/>
            </svg>
          </div>
          <!-- 裤子 -->
          <div class="cloth pants" :class="{ hi: isHi('pants') }" :style="{ '--c': colorHex(scene.pants.color) }">
            <div class="hi-ring cloth-ring" v-if="isHi('pants')"></div>
            <div class="hi-arrow cloth-arrow" v-if="isHi('pants')">▼</div>
            <div class="hanger"></div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M25,10 L75,10 L78,50 L70,95 L55,95 L50,55 L45,95 L30,95 L22,50 Z"
                fill="var(--c)" stroke="#00000033" stroke-width="1"/>
            </svg>
          </div>
          <!-- 裙子 -->
          <div class="cloth skirt" :class="{ hi: isHi('skirt') }" :style="{ '--c': colorHex(scene.skirt.color) }">
            <div class="hi-ring cloth-ring" v-if="isHi('skirt')"></div>
            <div class="hi-arrow cloth-arrow" v-if="isHi('skirt')">▼</div>
            <div class="hanger"></div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M30,10 L70,10 L85,90 L15,90 Z"
                fill="var(--c)" stroke="#00000033" stroke-width="1"/>
            </svg>
          </div>
        </div>
        <div class="wardrobe-door door-l"></div>
        <div class="wardrobe-door door-r"></div>
      </div>
      <div class="wardrobe-legs">
        <span></span><span></span>
      </div>
    </div>

    <!-- 茶几 + 花瓶 -->
    <div class="tea-table">
      <div class="table-top"></div>
      <div class="table-shade"></div>
      <div class="table-leg tl"></div>
      <div class="table-leg tr"></div>
      <!-- 花瓶 -->
      <div class="vase-wrap" :class="{ hi: isHi('vase') }">
        <div class="hi-ring vase-ring" v-if="isHi('vase')"></div>
        <div class="hi-arrow vase-arrow" v-if="isHi('vase')">▼</div>
        <svg viewBox="0 0 120 180" class="vase-svg">
          <defs>
            <radialGradient id="vg" cx="35%" cy="35%" r="70%">
              <stop offset="0%" :stop-color="lighten(colorHex(scene.vase.color), 40)"/>
              <stop offset="55%" :stop-color="colorHex(scene.vase.color)"/>
              <stop offset="100%" :stop-color="darken(colorHex(scene.vase.color), 35)"/>
            </radialGradient>
          </defs>
          <ellipse cx="60" cy="172" rx="30" ry="5" fill="#00000055"/>
          <path d="M45,20 Q40,35 45,50 Q20,70 25,120 Q30,160 60,168 Q90,160 95,120 Q100,70 75,50 Q80,35 75,20 Z"
            fill="url(#vg)" stroke="#00000033" stroke-width="1"/>
          <ellipse cx="55" cy="55" rx="8" ry="18" fill="#ffffff55"/>
          <!-- 花 -->
          <g transform="translate(60,10)">
            <circle r="8" fill="#ffd166"/>
            <circle cx="-10" cy="-4" r="6" fill="#ef476f"/>
            <circle cx="10" cy="-4" r="6" fill="#ef476f"/>
            <circle cx="0" cy="-12" r="6" fill="#ef476f"/>
            <circle r="3" fill="#8b5a00"/>
          </g>
          <line x1="60" y1="20" x2="60" y2="45" stroke="#2e7d32" stroke-width="2"/>
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
import { COLOR_HEX } from '../store.js'
export default {
  name: 'Room',
  props: {
    scene: { type: Object, required: true },
    highlights: { type: Array, default: () => [] },
    fading: { type: Boolean, default: false }
  },
  computed: {
    hourAngle() {
      const h = this.scene.clock.hour % 12
      const m = this.scene.clock.minute
      return ((h + m / 60) * 30 - 90) * Math.PI / 180
    },
    minAngle() {
      return (this.scene.clock.minute * 6 - 90) * Math.PI / 180
    }
  },
  methods: {
    isHi(k) { return this.highlights.includes(k) },
    colorHex(c) { return COLOR_HEX[c] || '#ccc' },
    lighten(hex, p) { return shade(hex, p) },
    darken(hex, p) { return shade(hex, -p) }
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
.wall.back-wall {
  position: absolute; left: 0; right: 0; top: 0; height: 52%;
}
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
.painting {
  position: absolute; left: 62%; top: 12%; width: 18%; height: 26%;
}
.painting-frame {
  width: 100%; height: 100%;
  padding: 6%;
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
  position: absolute; left: 9%; top: 12%; width: 26%; height: 28%;
  border-radius: 6px;
  background: linear-gradient(180deg, #a5d1ec 0%, #dff1ff 100%);
  box-shadow: 0 10px 24px rgba(0,0,0,0.2), inset 0 0 0 6px #f4e0b8, inset 0 0 0 8px #8b6a3a;
  overflow: hidden;
}
.window-frame {
  position: absolute; inset: 8px;
  display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
  gap: 6px;
}
.pane {
  background: linear-gradient(160deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1) 40%, rgba(180,220,240,0.4));
  border: 1px solid #a58549;
  border-radius: 2px;
}
.curtain {
  position: absolute; top: 0; bottom: 0; width: 18%;
  background: repeating-linear-gradient(90deg, #b83b3b, #8f2a2a 6px, #b83b3b 12px);
  box-shadow: inset -6px 0 8px rgba(0,0,0,0.25);
}
.curtain-l { left: 0; }
.curtain-r { right: 0; }

/* 地板 */
.floor {
  position: absolute; left: 0; right: 0; bottom: 0; height: 48%;
  overflow: hidden;
  perspective: 800px;
}
.plank {
  position: absolute; top: 0; bottom: 0; width: 12.5%;
  background: repeating-linear-gradient(180deg,
    #a3763f 0px, #b7864a 20px, #9a6a35 40px, #b17d43 60px);
  border-right: 2px solid #6b4a24;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.15);
}
.rug {
  position: absolute; left: 20%; right: 20%; bottom: 6%; height: 45%;
  background: #6b2c2c;
  border-radius: 50% / 30%;
  box-shadow: 0 12px 30px rgba(0,0,0,0.4);
  padding: 3%;
}
.rug-inner {
  width: 100%; height: 100%;
  background:
    repeating-linear-gradient(45deg, #8b3a3a 0 8px, #b04747 8px 16px),
    #8b3a3a;
  border-radius: 50% / 30%;
  border: 3px dashed #f2c48a;
}

/* ⭐ 高亮：紧贴物品轮廓的强对比发光圈 + 顶部指示箭头 */
.hi-ring {
  position: absolute; inset: -8%;
  border: 4px solid #00e5ff;
  border-radius: 14px;
  box-shadow:
    0 0 0 3px rgba(0, 229, 255, 0.35),
    0 0 30px 8px rgba(255, 0, 200, 0.85),
    inset 0 0 20px rgba(0, 229, 255, 0.7);
  animation: hiPulse 1s ease-in-out infinite;
  pointer-events: none;
  z-index: 6;
}
.cloth-ring { inset: -4%; border-radius: 8px; }
.vase-ring { inset: -10% -18%; border-radius: 50%; }
.hi-arrow {
  position: absolute; left: 50%; top: -34px;
  transform: translateX(-50%);
  color: #ff2fd0;
  font-size: 32px; font-weight: 900;
  text-shadow: 0 0 8px #fff, 0 0 16px #ff2fd0, 0 2px 4px #000;
  animation: hiBounce 0.7s ease-in-out infinite;
  z-index: 7; pointer-events: none;
}
.cloth-arrow { top: -30px; font-size: 26px; }
.vase-arrow { top: -46px; font-size: 36px; }
@keyframes hiPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.35), 0 0 30px 8px rgba(255, 0, 200, 0.85), inset 0 0 20px rgba(0, 229, 255, 0.7); border-color: #00e5ff; }
  50% { box-shadow: 0 0 0 6px rgba(255, 47, 208, 0.45), 0 0 50px 14px rgba(0, 229, 255, 0.9), inset 0 0 28px rgba(255, 47, 208, 0.8); border-color: #ff2fd0; }
}
@keyframes hiBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-8px); }
}
.hi { z-index: 6; }
.hi > *:not(.hi-ring):not(.hi-arrow) { filter: drop-shadow(0 0 10px #00e5ff) drop-shadow(0 0 20px #ff2fd0); }

/* 钟表 */
.clock-wrap {
  position: absolute; left: 42%; top: 8%; width: 12%; aspect-ratio: 1;
  transform: translateX(-50%);
}
.clock-svg { width: 100%; height: 100%; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35)); position: relative; z-index: 1; }

/* 书柜 */
.bookshelf {
  position: absolute; left: 3%; bottom: 6%; width: 22%; height: 62%;
}
.shelf-body {
  position: relative; width: 100%; height: 100%;
  background: linear-gradient(180deg, #7a4e26, #5a3818);
  border-radius: 6px 6px 4px 4px;
  box-shadow: 0 14px 30px rgba(0,0,0,0.45), inset 0 0 0 3px #4a2f16;
  padding: 4% 5%;
  display: flex; flex-direction: column; gap: 3%;
}
.shelf-top { height: 4%; background: linear-gradient(180deg, #8b5a2b, #6a3f18); border-radius: 3px; }
.shelf-bottom { height: 5%; background: linear-gradient(180deg, #5a3818, #3a2312); border-radius: 3px; margin-top: auto; }
.shelf-divider { height: 3%; background: #4a2f16; border-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.shelf-row {
  flex: 1;
  background: linear-gradient(180deg, #6a4020, #4a2a12);
  border-radius: 3px;
  display: flex; align-items: flex-end;
  padding: 4%;
  gap: 3px;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.4);
}
.book {
  flex: 1;
  min-width: 5%;
  height: 70%;
  border-radius: 1px 1px 0 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.3);
  position: relative;
}
.book-band { position: absolute; left: 0; right: 0; top: 20%; height: 6%; background: rgba(255,255,255,0.35); }
.book-band.b2 { top: 70%; background: rgba(0,0,0,0.25); }
.shelf-row-2 { justify-content: space-around; }
.deco-frame { width: 26%; height: 65%; background: linear-gradient(135deg, #d4a865, #8b5a2b); border-radius: 2px; box-shadow: inset 0 0 0 3px #f4e0b8; }
.deco-vase-mini { width: 18%; height: 55%; background: radial-gradient(circle at 30% 30%, #a8d8ea, #4a90b8); border-radius: 40% 40% 30% 30%; }
.deco-clock-mini { width: 22%; height: 55%; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #fffdf6, #c9b48a); border: 3px solid #8b5a2b; }

/* 衣柜 */
.wardrobe {
  position: absolute; right: 3%; bottom: 6%; width: 24%; height: 68%;
}
.wardrobe-body {
  position: relative; width: 100%; height: 92%;
  background: linear-gradient(180deg, #a67043, #7a4e26);
  border-radius: 6px 6px 3px 3px;
  box-shadow: 0 14px 30px rgba(0,0,0,0.45), inset 0 0 0 3px #4a2f16;
  overflow: hidden;
}
.wardrobe-top {
  position: absolute; top: 0; left: 0; right: 0; height: 6%;
  background: linear-gradient(180deg, #c9884b, #8b5a2b);
  border-radius: 6px 6px 0 0;
}
.wardrobe-inside {
  position: absolute; left: 6%; right: 6%; top: 9%; bottom: 6%;
  background: linear-gradient(180deg, #e8d8b8, #c9b48a);
  border-radius: 3px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
  display: flex; justify-content: space-around; align-items: flex-start;
  padding-top: 8%;
}
.rail {
  position: absolute; top: 6%; left: 5%; right: 5%; height: 3px;
  background: linear-gradient(180deg, #b8b8b8, #6a6a6a);
  border-radius: 2px;
  box-shadow: 0 2px 3px rgba(0,0,0,0.3);
}
.cloth {
  width: 28%; height: 78%;
  position: relative;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
}
.cloth svg { width: 100%; height: 100%; display: block; }
.hanger {
  position: absolute; top: -6%; left: 45%; width: 10%; height: 12%;
  border: 2px solid #666;
  border-top: none;
  border-radius: 0 0 50% 50%;
}
.hanger::before {
  content: ''; position: absolute; top: -60%; left: 40%;
  width: 20%; height: 60%; border: 2px solid #666;
  border-bottom: none;
  border-radius: 40% 40% 0 0;
}
/* 衣柜门（半开） */
.wardrobe-door {
  position: absolute; top: 6%; bottom: 6%; width: 12%;
  background: linear-gradient(180deg, #9b6836, #6a4020);
  box-shadow: inset 0 0 0 2px #4a2f16;
}
.door-l { left: 0; border-right: 2px solid #3a2312; transform-origin: left; transform: perspective(400px) rotateY(-25deg); }
.door-r { right: 0; border-left: 2px solid #3a2312; transform-origin: right; transform: perspective(400px) rotateY(25deg); }
.wardrobe-door::after {
  content: ''; position: absolute; top: 45%; width: 8px; height: 8px;
  background: radial-gradient(circle, #f4e0b8, #8b5a2b);
  border-radius: 50%;
}
.door-l::after { right: 6px; }
.door-r::after { left: 6px; }
.wardrobe-legs {
  position: absolute; bottom: 0; left: 8%; right: 8%; height: 8%;
  display: flex; justify-content: space-between;
}
.wardrobe-legs span { width: 12%; height: 100%; background: linear-gradient(180deg, #6a4020, #3a2312); border-radius: 3px; }

/* 茶几 */
.tea-table {
  position: absolute; left: 40%; bottom: 10%; width: 22%; height: 22%;
  transform: translateX(-50%);
}
.table-top {
  position: absolute; left: 0; right: 0; top: 22%; height: 12%;
  background: linear-gradient(180deg, #d9b48a 0%, #a67043 100%);
  border-radius: 50% / 40%;
  box-shadow: 0 6px 12px rgba(0,0,0,0.35), inset 0 0 0 2px #6a4020;
}
.table-shade {
  position: absolute; left: 8%; right: 8%; top: 33%; height: 6%;
  background: linear-gradient(180deg, #6a4020, transparent);
  border-radius: 50%;
  filter: blur(2px);
}
.table-leg {
  position: absolute; top: 30%; width: 4%; height: 70%;
  background: linear-gradient(180deg, #8b5a2b, #4a2f16);
  border-radius: 3px;
}
.table-leg.tl { left: 18%; transform: skewX(-8deg); }
.table-leg.tr { right: 18%; transform: skewX(8deg); }
.vase-wrap {
  position: absolute; left: 50%; bottom: 30%; width: 32%; height: 130%;
  transform: translateX(-50%);
  z-index: 2;
}
.vase-svg { width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); }

/* 前景植物 */
.plant {
  position: absolute; right: 28%; bottom: 4%; width: 8%; height: 24%;
}
.pot {
  position: absolute; bottom: 0; left: 10%; right: 10%; height: 40%;
  background: linear-gradient(180deg, #b06848, #6a3a20);
  border-radius: 8px 8px 20% 20%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.35);
}
.leaf {
  position: absolute; bottom: 35%; width: 55%; height: 55%;
  background: linear-gradient(135deg, #4a8f4a, #1e5b1e);
  border-radius: 50% 10% 50% 10%;
  transform-origin: bottom right;
}
.leaf.l1 { left: 5%; transform: rotate(-25deg); }
.leaf.l2 { left: 20%; transform: rotate(-5deg) scale(1.1); }
.leaf.l3 { left: 35%; transform: rotate(15deg); }
.leaf.l4 { left: 50%; transform: rotate(35deg); background: linear-gradient(135deg, #5aa05a, #2e6e2e); }
</style>
