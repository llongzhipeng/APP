<template>
  <div class="scene-wrap">
    <svg :viewBox="`0 0 ${W} ${H}`" class="scene-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <!-- ===== Room / floor ===== -->
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#f7f2e6"/>
          <stop offset="100%" stop-color="#d8ccb0"/>
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stop-color="#e8d3ae"/>
          <stop offset="50%" stop-color="#d1b689"/>
          <stop offset="100%" stop-color="#a37a4a"/>
        </linearGradient>
        <linearGradient id="plankGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stop-color="rgba(122,79,42,0.0)"/>
          <stop offset="50%" stop-color="rgba(122,79,42,0.35)"/>
          <stop offset="100%" stop-color="rgba(122,79,42,0.0)"/>
        </linearGradient>
        <radialGradient id="rugGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%"  stop-color="#e0eaf7"/>
          <stop offset="70%" stop-color="#a3b7d8"/>
          <stop offset="100%" stop-color="#6b83ac"/>
        </radialGradient>

        <!-- ===== Head (top-down sphere) ===== -->
        <radialGradient id="hairMale" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#4a4a52"/>
          <stop offset="55%" stop-color="#1f2430"/>
          <stop offset="100%" stop-color="#0b0d13"/>
        </radialGradient>
        <radialGradient id="hairBrown" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#a06a3f"/>
          <stop offset="55%" stop-color="#5c331a"/>
          <stop offset="100%" stop-color="#2e1a0d"/>
        </radialGradient>
        <radialGradient id="hairDark" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#3a3630"/>
          <stop offset="55%" stop-color="#1a1512"/>
          <stop offset="100%" stop-color="#080604"/>
        </radialGradient>
        <radialGradient id="skinGrad" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffe1c4"/>
          <stop offset="60%" stop-color="#e6b389"/>
          <stop offset="100%" stop-color="#a97148"/>
        </radialGradient>

        <!-- Shirt gradients (view from directly above) -->
        <radialGradient id="shirtBlue" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#93c5fd"/>
          <stop offset="60%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1e3a8a"/>
        </radialGradient>
        <radialGradient id="shirtPink" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#fbcfe8"/>
          <stop offset="60%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#831843"/>
        </radialGradient>
        <radialGradient id="shirtGreen" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#bbf7d0"/>
          <stop offset="60%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </radialGradient>
        <radialGradient id="shirtSky" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="60%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </radialGradient>

        <!-- ===== Filters ===== -->
        <filter id="dropShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity="0.30"/>
        </filter>
        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.28"/>
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Wall inner shadow (fakes 3D perspective corner darkening) -->
        <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
          <feOffset dx="0" dy="0" result="off"/>
          <feFlood flood-color="#000" flood-opacity="0.35"/>
          <feComposite in2="off" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over"/>
        </filter>
      </defs>

      <!-- ambient background outside the room -->
      <rect x="0" y="0" :width="W" :height="H" fill="#c4d1e0"/>

      <!-- ===== ROOM (top-down 3D isometric-lite) ===== -->
      <!-- Outer wall (thicker top+left walls to fake 3D thickness) -->
      <g :transform="`translate(${room.x}, ${room.y})`">
        <!-- wall thickness shadow -->
        <rect x="-16" y="-16" :width="room.w + 32" :height="room.h + 32" rx="14" fill="#000" opacity="0.15"/>
        <!-- wall face -->
        <rect x="-10" y="-10" :width="room.w + 20" :height="room.h + 20" rx="10" fill="url(#wallGrad)"/>
        <!-- inner wall highlight -->
        <rect x="-8" y="-8" :width="room.w + 16" :height="room.h + 16" rx="10" fill="none" stroke="#fff" stroke-width="1" opacity="0.6"/>

        <!-- Floor -->
        <rect x="0" y="0" :width="room.w" :height="room.h" fill="url(#floorGrad)"/>
        <!-- Wood planks (horizontal) -->
        <g>
          <line v-for="n in 8" :key="'pl'+n"
                :x1="0" :y1="n * room.h / 9" :x2="room.w" :y2="n * room.h / 9"
                stroke="url(#plankGrad)" stroke-width="2"/>
        </g>
        <!-- floor vignette -->
        <rect x="0" y="0" :width="room.w" :height="room.h" fill="url(#skinGrad)" opacity="0" pointer-events="none"/>
        <!-- Corner shadows for 3D depth -->
        <rect x="0" y="0" :width="room.w" :height="room.h" fill="none" filter="url(#innerShadow)" pointer-events="none"/>

        <!-- ===== Furniture — a subtle rug in the center to anchor "self" ===== -->
        <ellipse :cx="room.w / 2" :cy="room.h / 2" :rx="cellSize * 1.3" :ry="cellSize * 1.3"
                 fill="url(#rugGrad)" opacity="0.9"/>
        <ellipse :cx="room.w / 2" :cy="room.h / 2" :rx="cellSize * 1.1" :ry="cellSize * 1.1"
                 fill="none" stroke="#f5e9d0" stroke-width="2" stroke-dasharray="6 6" opacity="0.65"/>
        <ellipse :cx="room.w / 2" :cy="room.h / 2" :rx="cellSize * 0.6" :ry="cellSize * 0.6"
                 fill="#f5e9d0" opacity="0.5"/>

        <!-- ===== Grid guides (very faint) ===== -->
        <g opacity="0.07" stroke="#000">
          <line v-for="n in 4" :key="'gv'+n"
                :x1="(n) * cellSize" :y1="0" :x2="(n) * cellSize" :y2="room.h" stroke-dasharray="3 8"/>
          <line v-for="n in 4" :key="'gh'+n"
                :x1="0" :y1="(n) * cellSize" :x2="room.w" :y2="(n) * cellSize" stroke-dasharray="3 8"/>
        </g>

        <!-- ===== Entities (sorted back-to-front) ===== -->
        <g v-for="ent in sortedEntities" :key="ent.type + ent.key">
          <!-- ITEM -->
          <g v-if="ent.type === 'item'" :transform="`translate(${ent.pos.x}, ${ent.pos.y})`">
            <!-- ground shadow -->
            <ellipse cx="0" :cy="18" :rx="26" :ry="6" fill="#000" opacity="0.28"/>
            <!-- pulsing target highlight -->
            <g v-if="ent.data === question.askItem">
              <circle r="42" fill="#f59e0b" opacity="0.18">
                <animate attributeName="r" values="36;48;36" dur="1.4s" repeatCount="indefinite"/>
              </circle>
              <circle r="42" fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.9" filter="url(#glow)">
                <animate attributeName="r" values="36;48;36" dur="1.4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.4s" repeatCount="indefinite"/>
              </circle>
            </g>
            <!-- item art -->
            <g filter="url(#softShadow)">
              <g v-if="ent.data.kind === 'apple'">
                <ellipse cx="0" cy="4" rx="20" ry="18" fill="#c0392b"/>
                <ellipse cx="-6" cy="-2" rx="10" ry="6" fill="#e74c3c" opacity="0.8"/>
                <ellipse cx="8" cy="-12" rx="9" ry="4" fill="#27ae60" transform="rotate(30 8 -12)"/>
              </g>
              <g v-else-if="ent.data.kind === 'cup'">
                <circle r="18" fill="#f0f0f4"/>
                <circle r="15" fill="#4a2f1a"/>
                <circle r="15" fill="#7a5a3a" opacity="0.4"/>
                <ellipse cx="-5" cy="-5" rx="6" ry="3" fill="#fff" opacity="0.4"/>
              </g>
              <g v-else-if="ent.data.kind === 'book'">
                <rect x="-22" y="-16" width="44" height="32" rx="2" fill="#8b2a1f"/>
                <rect x="-22" y="-16" width="6" height="32" fill="#5a1a12"/>
                <rect x="-16" y="-14" width="36" height="28" rx="1" fill="#a83627"/>
                <path d="M -10 -6 L 14 -6 M -10 -1 L 14 -1 M -10 4 L 10 4" stroke="#f5d78e" stroke-width="1.2" opacity="0.9"/>
              </g>
              <g v-else-if="ent.data.kind === 'phone'">
                <rect x="-13" y="-22" width="26" height="44" rx="5" fill="#1f2937"/>
                <rect x="-10" y="-18" width="20" height="34" rx="2" fill="#0ea5e9"/>
                <circle cx="0" cy="18" r="2" fill="#4b5563"/>
              </g>
              <g v-else-if="ent.data.kind === 'key'">
                <circle cx="-10" cy="0" r="10" fill="none" stroke="#d4a017" stroke-width="4"/>
                <rect x="-2" y="-3" width="26" height="6" rx="1" fill="#d4a017"/>
                <rect x="18" y="3" width="4" height="8" fill="#d4a017"/>
                <rect x="12" y="3" width="4" height="6" fill="#d4a017"/>
              </g>
              <g v-else-if="ent.data.kind === 'pen'">
                <rect x="-22" y="-3" width="32" height="6" rx="1" fill="#1e40af"/>
                <polygon points="10,-3 22,0 10,3" fill="#f5c518"/>
                <rect x="-22" y="-3" width="6" height="6" fill="#93c5fd"/>
              </g>
              <g v-else-if="ent.data.kind === 'clock'">
                <circle r="20" fill="#f8fafc"/>
                <circle r="20" fill="none" stroke="#1f2937" stroke-width="3"/>
                <g stroke="#1f2937" stroke-width="1.6">
                  <line x1="0" y1="-16" x2="0" y2="-13"/>
                  <line x1="0" y1="16" x2="0" y2="13"/>
                  <line x1="-16" y1="0" x2="-13" y2="0"/>
                  <line x1="16" y1="0" x2="13" y2="0"/>
                </g>
                <line x1="0" y1="0" x2="0" y2="-11" stroke="#1f2937" stroke-width="2.4" stroke-linecap="round"/>
                <line x1="0" y1="0" x2="7" y2="4" stroke="#ef4444" stroke-width="1.6" stroke-linecap="round"/>
              </g>
              <g v-else-if="ent.data.kind === 'plant'">
                <ellipse cx="0" cy="10" rx="16" ry="6" fill="#a97148"/>
                <ellipse cx="0" cy="6" rx="15" ry="5" fill="#8b5a2b"/>
                <circle cx="-6" cy="-4" r="9" fill="#27ae60"/>
                <circle cx="6" cy="-6" r="10" fill="#2ecc71"/>
                <circle cx="0" cy="-10" r="9" fill="#16a34a"/>
              </g>
            </g>
            <!-- Label chip -->
            <g transform="translate(0, 34)">
              <rect x="-32" y="-11" width="64" height="22" rx="11" fill="#fff" opacity="0.95" filter="url(#softShadow)"/>
              <text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">{{ t(ent.data.key) }}</text>
            </g>
          </g>

          <!-- CHARACTER (strict top-down: head crown + shoulders only) -->
          <g v-else-if="ent.type === 'char'"
             :transform="`translate(${ent.pos.x}, ${ent.pos.y}) rotate(${facingDeg(ent.data.facing)})`">
            <!-- gaze cone if asker -->
            <g v-if="askIsChar(ent.data)">
              <path :d="gazeConePath(cellSize)" fill="#f59e0b" opacity="0.20"/>
              <path :d="gazeConePath(cellSize)" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.75" stroke-dasharray="6 5"/>
            </g>
            <!-- Ground shadow ellipse under character -->
            <ellipse cx="0" cy="4" rx="34" ry="30" fill="#000" opacity="0.28"/>
            <!-- Highlight ring under asker -->
            <circle v-if="askIsChar(ent.data)" r="42" fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.95" filter="url(#glow)">
              <animate attributeName="r" values="40;48;40" dur="1.4s" repeatCount="indefinite"/>
            </circle>

            <!-- SHOULDERS (viewed from directly above): rounded rectangle wider than head. -->
            <g filter="url(#dropShadow)">
              <!-- shirt shape: shoulders extend left/right; slightly tapered front/back -->
              <path d="M -34 -18 Q -40 0 -34 18 Q -14 26 14 26 Q 34 26 40 18 Q 46 0 40 -18 Q 30 -24 14 -22 L -14 -22 Q -30 -24 -34 -18 Z"
                    :fill="`url(#${shirtGrad(ent.data)})`"/>
              <!-- subtle center crease -->
              <path d="M 0 -22 L 0 26" stroke="#000" stroke-width="1" opacity="0.15"/>
              <!-- collar patch -->
              <ellipse cx="0" cy="-20" rx="10" ry="4" fill="#1e293b" opacity="0.5"/>
            </g>

            <!-- HEAD (perfectly round crown seen from above) -->
            <g filter="url(#softShadow)">
              <!-- skin under hair (visible on sides / front for slight face-forward hint) -->
              <ellipse cx="0" cy="-4" rx="18" ry="17" fill="url(#skinGrad)"/>
              <!-- Hair covering most of the crown -->
              <path :d="hairPath()" :fill="`url(#${hairGrad(ent.data)})`"/>
              <!-- crown highlight (single specular arc, top-left offset) -->
              <ellipse cx="-4" cy="-10" rx="7" ry="4" fill="#ffffff" opacity="0.35"/>
              <!-- swirl (发旋) -->
              <path d="M 0 -4 q 3 -3 6 0 q -3 3 -6 0 z" fill="#000" opacity="0.35"/>
            </g>

            <!-- FORWARD-facing nose bump (a tiny wedge peeking past the crown to show facing) -->
            <path d="M -3 -18 L 3 -18 L 0 -22 Z" fill="url(#skinGrad)"/>

            <!-- Facing indicator: a small chevron above the crown -->
            <g opacity="0.85">
              <path d="M -8 -34 L 0 -42 L 8 -34" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </g>

            <!-- Name badge (counter-rotate so text is upright) -->
            <g :transform="`rotate(${-facingDeg(ent.data.facing)}) translate(0, 46)`">
              <rect x="-30" y="-12" width="60" height="24" rx="12"
                    :fill="askIsChar(ent.data) ? '#f59e0b' : '#ffffff'" opacity="0.96" filter="url(#softShadow)"/>
              <text y="5" text-anchor="middle" font-size="13" font-weight="800"
                    :fill="askIsChar(ent.data) ? '#fff' : '#1e293b'">{{ t(ent.data.key) }}</text>
            </g>
          </g>

          <!-- SELF (center cell) -->
          <g v-else-if="ent.type === 'self'"
             :transform="`translate(${ent.pos.x}, ${ent.pos.y}) rotate(${facingDeg(question.selfFacing)})`">
            <g v-if="askIsSelf">
              <path :d="gazeConePath(cellSize)" fill="#0ea5e9" opacity="0.20"/>
              <path :d="gazeConePath(cellSize)" fill="none" stroke="#0ea5e9" stroke-width="2.4" opacity="0.8" stroke-dasharray="6 5"/>
            </g>
            <ellipse cx="0" cy="4" rx="38" ry="34" fill="#000" opacity="0.28"/>
            <circle v-if="askIsSelf" r="48" fill="none" stroke="#0ea5e9" stroke-width="3" opacity="0.95" filter="url(#glow)">
              <animate attributeName="r" values="44;54;44" dur="1.4s" repeatCount="indefinite"/>
            </circle>

            <g filter="url(#dropShadow)">
              <path d="M -38 -20 Q -44 0 -38 20 Q -16 28 16 28 Q 38 28 44 20 Q 50 0 44 -20 Q 32 -26 16 -24 L -16 -24 Q -32 -26 -38 -20 Z"
                    :fill="askIsSelf ? 'url(#shirtSky)' : 'url(#shirtBlue)'"/>
              <path d="M 0 -24 L 0 28" stroke="#000" stroke-width="1" opacity="0.15"/>
              <ellipse cx="0" cy="-22" rx="12" ry="4" fill="#1e293b" opacity="0.5"/>
            </g>

            <g filter="url(#softShadow)">
              <ellipse cx="0" cy="-4" rx="20" ry="19" fill="url(#skinGrad)"/>
              <path :d="hairPath(20)" fill="url(#hairMale)"/>
              <ellipse cx="-5" cy="-11" rx="8" ry="4.5" fill="#ffffff" opacity="0.35"/>
              <path d="M 0 -4 q 3 -3 6 0 q -3 3 -6 0 z" fill="#000" opacity="0.35"/>
            </g>
            <path d="M -3 -20 L 3 -20 L 0 -24 Z" fill="url(#skinGrad)"/>

            <!-- Big forward chevron for self -->
            <g>
              <path d="M -10 -40 L 0 -50 L 10 -40" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="0" cy="-52" r="3" fill="#f59e0b" filter="url(#glow)"/>
            </g>

            <g :transform="`rotate(${-facingDeg(question.selfFacing)}) translate(0, 50)`">
              <rect x="-34" y="-13" width="68" height="26" rx="13"
                    :fill="askIsSelf ? '#0ea5e9' : '#ffffff'" opacity="0.96" filter="url(#softShadow)"/>
              <text y="5" text-anchor="middle" font-size="14" font-weight="800"
                    :fill="askIsSelf ? '#fff' : '#1e293b'">{{ t('whoSelf') }}</text>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Scene',
  props: {
    question: { type: Object, required: true },
    t: { type: Function, required: true },
  },
  data() { return { W: 900, H: 600 } },
  computed: {
    // Room occupies most of the SVG.
    room() {
      const pad = 40
      return { x: pad, y: pad, w: this.W - pad * 2, h: this.H - pad * 2 }
    },
    cellSize() { return Math.min(this.room.w, this.room.h) / 5 },
    askIsSelf() { return this.question.askerType === 'self' },
    sortedEntities() {
      const list = []
      for (const c of this.question.chars) {
        const p = this.cellPos(c.cell)
        list.push({ type: 'char', key: c.key, data: c, pos: p, y: p.y })
      }
      for (const it of this.question.items) {
        const p = this.cellPos(it.cell)
        list.push({ type: 'item', key: it.key + it.cell.r + it.cell.c, data: it, pos: p, y: p.y })
      }
      const selfPos = this.cellPos({ r: 2, c: 2 })
      list.push({ type: 'self', key: 'self', data: null, pos: selfPos, y: selfPos.y })
      list.sort((a, b) => a.y - b.y)
      return list
    },
  },
  methods: {
    // Map grid cell {r, c} to LOCAL room-frame coordinates (room origin at 0,0).
    cellPos(cell) {
      return {
        x: (cell.c + 0.5) * this.cellSize,
        y: (cell.r + 0.5) * this.cellSize,
      }
    },
    facingDeg(f) { return f * 45 },
    askIsChar(c) { return this.question.askerType === 'char' && this.question.askCell && this.question.askCell.r === c.cell.r && this.question.askCell.c === c.cell.c },
    // Rounded top-down hair silhouette (crown covers back+sides, leaves small forehead gap).
    hairPath(r) {
      const R = r || 18
      // A crown shape: near-circle, but with a small notch at the front (top when unrotated).
      return `M ${-R + 1} -6
              Q ${-R - 1} ${-R * 0.6} ${-R * 0.5} ${-R + 2}
              Q 0 ${-R + 4} ${R * 0.5} ${-R + 2}
              Q ${R + 1} ${-R * 0.6} ${R - 1} -6
              Q ${R} 6 ${R * 0.4} 12
              Q 0 15 ${-R * 0.4} 12
              Q ${-R} 6 ${-R + 1} -6 Z`
    },
    // Gaze cone shape, projecting forward from the character.
    gazeConePath(cs) {
      const len = cs * 2.2
      const halfW = cs * 0.85
      return `M 0 -22 L ${halfW} ${-22 - len} L ${-halfW} ${-22 - len} Z`
    },
    shirtGrad(c) {
      if (c.key === 'charA') return 'shirtBlue'
      if (c.key === 'charB') return 'shirtPink'
      return 'shirtGreen'
    },
    hairGrad(c) {
      if (c.key === 'charA') return 'hairMale'
      if (c.key === 'charB') return 'hairBrown'
      return 'hairDark'
    },
  },
}
</script>

<style scoped>
.scene-wrap { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.scene-svg {
  width: 100%; height: 100%; display: block;
  background: linear-gradient(180deg, #eef3f9 0%, #d5deeb 100%);
}
</style>
