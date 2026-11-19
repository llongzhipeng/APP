<template>
  <div class="game-root">
    <!-- Forest scene -->
    <div class="stage" ref="stage">
      <!-- ============ BACKGROUND: sky, sun rays, mountains, forest depth ============ -->
      <svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <!-- Sky: dawn/morning through canopy -->
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stop-color="#c8dfe3"/>
            <stop offset="18%" stop-color="#a4c9b8"/>
            <stop offset="45%" stop-color="#6ea27a"/>
            <stop offset="80%" stop-color="#2e5a34"/>
            <stop offset="100%" stop-color="#152c1a"/>
          </linearGradient>
          <!-- Warm sun light shaft -->
          <radialGradient id="sun" cx="72%" cy="8%" r="55%">
            <stop offset="0%"  stop-color="#fff6c9" stop-opacity=".9"/>
            <stop offset="35%" stop-color="#ffd580" stop-opacity=".35"/>
            <stop offset="100%" stop-color="#ffd580" stop-opacity="0"/>
          </radialGradient>
          <!-- Volumetric god rays -->
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fff2b8" stop-opacity=".28"/>
            <stop offset="100%" stop-color="#fff2b8" stop-opacity="0"/>
          </linearGradient>
          <!-- Mist -->
          <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e8f4f0" stop-opacity="0"/>
            <stop offset="60%" stop-color="#dfece0" stop-opacity=".45"/>
            <stop offset="100%" stop-color="#c4d8c0" stop-opacity=".2"/>
          </linearGradient>
          <!-- Distant forest silhouettes -->
          <linearGradient id="hillsFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5a8767"/>
            <stop offset="100%" stop-color="#385c48"/>
          </linearGradient>
          <linearGradient id="hillsMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3d6c48"/>
            <stop offset="100%" stop-color="#22432c"/>
          </linearGradient>
          <!-- Ground with painterly depth -->
          <radialGradient id="ground" cx="50%" cy="70%" r="90%">
            <stop offset="0%"  stop-color="#6e9758"/>
            <stop offset="45%" stop-color="#3f6a3c"/>
            <stop offset="100%" stop-color="#152615"/>
          </radialGradient>
          <!-- Grass tuft pattern -->
          <pattern id="tufts" x="0" y="0" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M6 42 Q7 32 5 22 M9 42 Q10 30 12 22 M20 42 Q21 34 19 26 M23 42 Q22 32 25 26 M34 42 Q33 30 35 22 M37 42 Q38 34 36 26"
                  stroke="#3f7a4a" stroke-width="1.1" fill="none" opacity=".55"/>
            <path d="M14 42 L14 34 M28 42 L28 36 M40 42 L40 34" stroke="#4c8c56" stroke-width="1" opacity=".45"/>
          </pattern>
          <!-- Vignette -->
          <radialGradient id="vig" cx="50%" cy="55%" r="70%">
            <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,.55)"/>
          </radialGradient>
          <filter id="blur1"><feGaussianBlur stdDeviation="2.2"/></filter>
          <filter id="blur3"><feGaussianBlur stdDeviation="4"/></filter>
        </defs>

        <!-- Sky -->
        <rect width="1600" height="900" fill="url(#sky)"/>
        <!-- Sun bloom -->
        <rect width="1600" height="900" fill="url(#sun)"/>
        <!-- God rays -->
        <g opacity=".55">
          <polygon points="1150,-20 1220,-20 1000,900 900,900" fill="url(#ray)"/>
          <polygon points="1260,-20 1330,-20 1120,900 1030,900" fill="url(#ray)"/>
          <polygon points="1050,-20 1100,-20 850,900 780,900" fill="url(#ray)"/>
          <polygon points="900,-20 940,-20 720,900 670,900" fill="url(#ray)" opacity=".7"/>
        </g>
        <!-- Far mountains -->
        <path d="M0 500 L120 430 L240 480 L360 400 L520 470 L680 410 L820 480 L980 420 L1140 475 L1300 400 L1460 465 L1600 430 L1600 620 L0 620 Z"
              fill="url(#hillsFar)" opacity=".55"/>
        <!-- Middle forest silhouette -->
        <path d="M0 560 L60 520 L110 555 L170 500 L230 555 L290 515 L360 560 L430 505 L510 555 L590 500 L670 560 L760 510 L840 555 L920 500 L1010 555 L1090 510 L1180 560 L1270 505 L1360 555 L1450 510 L1540 560 L1600 530 L1600 700 L0 700 Z"
              fill="url(#hillsMid)" opacity=".9"/>
        <!-- Mist band -->
        <rect x="0" y="520" width="1600" height="180" fill="url(#mist)"/>
        <!-- Ground -->
        <path d="M0 640 Q800 590 1600 640 L1600 900 L0 900 Z" fill="url(#ground)"/>
        <rect x="0" y="640" width="1600" height="260" fill="url(#tufts)" opacity=".55"/>
        <!-- Distant trees to add depth -->
        <g opacity=".55">
          <g v-for="(t,i) in bgTrees" :key="'bg'+i" :transform="`translate(${t.x} ${t.y}) scale(${t.s})`">
            <ellipse cx="0" cy="8" rx="60" ry="7" fill="rgba(0,0,0,.35)"/>
            <path d="M-6 30 Q-3 -10 -8 -60 Q0 -70 8 -60 Q3 -10 6 30 Z" fill="#3d2612"/>
            <ellipse cx="-24" cy="-30" rx="28" ry="34" fill="#2b5a35"/>
            <ellipse cx="24"  cy="-40" rx="30" ry="36" fill="#2b5a35"/>
            <ellipse cx="0"   cy="-58" rx="34" ry="38" fill="#3a7146"/>
            <ellipse cx="-14" cy="-72" rx="22" ry="24" fill="#4a8354"/>
            <ellipse cx="16"  cy="-72" rx="22" ry="24" fill="#4a8354"/>
          </g>
        </g>
        <!-- Ground detail: rocks & mushrooms & flowers -->
        <g>
          <g v-for="(r,i) in decor.rocks" :key="'r'+i" :transform="`translate(${r.x} ${r.y}) scale(${r.s})`">
            <ellipse cx="0" cy="6" rx="26" ry="4" fill="rgba(0,0,0,.35)"/>
            <path d="M-22 4 Q-26 -12 -6 -18 Q10 -24 22 -10 Q28 6 10 8 Q-10 12 -22 4 Z" fill="#6a6a63"/>
            <path d="M-16 -2 Q-8 -14 4 -12 Q14 -8 12 0 Q4 6 -16 -2 Z" fill="#8a8a80" opacity=".6"/>
          </g>
          <g v-for="(m,i) in decor.mushrooms" :key="'m'+i" :transform="`translate(${m.x} ${m.y})`">
            <ellipse cx="0" cy="14" rx="10" ry="2" fill="rgba(0,0,0,.35)"/>
            <rect x="-3" y="4" width="6" height="12" rx="3" fill="#f5efe0"/>
            <path d="M-14 4 Q-14 -10 0 -12 Q14 -10 14 4 Q0 8 -14 4 Z" fill="#c0392b"/>
            <circle cx="-6" cy="-3" r="2" fill="#fff8ec"/><circle cx="4" cy="-6" r="1.6" fill="#fff8ec"/><circle cx="7" cy="1" r="1.8" fill="#fff8ec"/>
          </g>
          <g v-for="(f,i) in decor.wildflowers" :key="'w'+i" :transform="`translate(${f.x} ${f.y})`">
            <path :d="`M0 12 Q-1 6 0 -2`" stroke="#3a7a3a" stroke-width="1.4" fill="none"/>
            <g v-for="j in 5" :key="j" :transform="`rotate(${j*72})`">
              <circle cx="0" cy="-4" r="2.2" :fill="f.c"/>
            </g>
            <circle r="1.4" fill="#facc15"/>
          </g>
        </g>
        <!-- Floating pollen / dust -->
        <g>
          <circle v-for="(p,i) in petals" :key="'p'+i" :cx="p.x" :cy="p.y" :r="p.r" :fill="p.c" opacity=".55">
            <animate attributeName="cy" :values="`${p.y};${p.y+220}`" :dur="p.d+'s'" repeatCount="indefinite"/>
          </circle>
        </g>
        <!-- Vignette on top -->
        <rect width="1600" height="900" fill="url(#vig)"/>
      </svg>

      <!-- ============ TREES (foreground, host fires) ============ -->
      <div v-for="(t,i) in trees" :key="'tree'+i" class="tree"
           :style="{ left: t.x + '%', top: t.y + '%', width: t.w + '%', zIndex: 5 + Math.round(t.y) }">
        <Tree />

        <!-- Fire on this tree -->
        <transition name="pop">
          <button v-if="t.fire" class="fire-btn" @click.stop="hitFire(t)">
            <svg viewBox="0 0 100 140" class="fire-svg">
              <defs>
                <radialGradient :id="'glow'+i" cx="50%" cy="70%" r="70%">
                  <stop offset="0%"  stop-color="#fff2a8" stop-opacity=".95"/>
                  <stop offset="40%" stop-color="#ffb020" stop-opacity=".55"/>
                  <stop offset="100%" stop-color="#e0431a" stop-opacity="0"/>
                </radialGradient>
                <linearGradient :id="'flameA'+i" x1="0" x2="0" y1="1" y2="0">
                  <stop offset="0%"  stop-color="#a80f0f"/>
                  <stop offset="30%" stop-color="#ff5a1a"/>
                  <stop offset="70%" stop-color="#ffb020"/>
                  <stop offset="100%" stop-color="#fff2a8"/>
                </linearGradient>
                <linearGradient :id="'flameB'+i" x1="0" x2="0" y1="1" y2="0">
                  <stop offset="0%"  stop-color="#ff7a1a"/>
                  <stop offset="60%" stop-color="#ffd247"/>
                  <stop offset="100%" stop-color="#fffbe0"/>
                </linearGradient>
              </defs>
              <!-- Ambient glow -->
              <ellipse cx="50" cy="110" rx="46" ry="24" :fill="`url(#glow${i})`"/>
              <!-- Outer flame -->
              <path :fill="`url(#flameA${i})`" opacity=".95"
                    d="M50 8 C 74 34, 84 62, 70 96 C 82 88, 88 74, 84 60 C 96 88, 84 122, 50 128 C 16 122, 4 88, 16 60 C 12 74, 18 88, 30 96 C 16 62, 26 34, 50 8 Z"/>
              <!-- Mid flame -->
              <path :fill="`url(#flameB${i})`"
                    d="M50 30 C 66 50, 72 74, 60 100 C 70 92, 74 82, 72 72 C 80 92, 72 118, 50 122 C 28 118, 20 92, 28 72 C 26 82, 30 92, 40 100 C 28 74, 34 50, 50 30 Z">
                <animate attributeName="opacity" values=".7;1;.7" dur=".6s" repeatCount="indefinite"/>
              </path>
              <!-- Core -->
              <path fill="#fffbe0"
                    d="M50 60 C 58 74, 60 88, 54 100 C 60 96, 62 90, 60 84 C 66 96, 58 112, 50 114 C 42 112, 34 96, 40 84 C 38 90, 40 96, 46 100 C 40 88, 42 74, 50 60 Z">
                <animate attributeName="opacity" values="1;.6;1" dur=".5s" repeatCount="indefinite"/>
              </path>
              <!-- Static ember dots -->
              <g fill="#ffd066" opacity=".8">
                <circle cx="30" cy="40" r="1.4"/>
                <circle cx="66" cy="30" r="1.6"/>
                <circle cx="52" cy="46" r="1.2"/>
              </g>
            </svg>
            <div class="life-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="3"/>
                <circle cx="20" cy="20" r="18" fill="none" stroke="#fde047" stroke-width="3"
                        stroke-linecap="round" pathLength="1"
                        :stroke-dasharray="`${t.fire.remain/t.fire.total} 1`"
                        transform="rotate(-90 20 20)"/>
              </svg>
            </div>
          </button>
        </transition>
      </div>

      <!-- ============ CENTER: daisy on the ground ============ -->
      <div class="flower" :class="{ wilted }">
        <Daisy :wilted="wilted" />
      </div>

      <!-- ============ BUGS (realistic beetle) ============ -->
      <button v-for="b in bugs" :key="b.id" class="bug" :class="{ landed: b.landed }"
              :style="bugStyle(b)" @click.stop="hitBug(b)">
        <svg viewBox="0 0 100 100">
          <defs>
            <!-- Beetle shell with iridescent highlight -->
            <radialGradient :id="'shell'+b.id" cx="35%" cy="30%" r="80%">
              <stop offset="0%"  stop-color="#a3f0c8"/>
              <stop offset="25%" stop-color="#3a8f5b"/>
              <stop offset="65%" stop-color="#1c3a24"/>
              <stop offset="100%" stop-color="#0a1a10"/>
            </radialGradient>
            <linearGradient :id="'shell2'+b.id" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="#7ac6a0" stop-opacity=".6"/>
              <stop offset="100%" stop-color="#0a1a10" stop-opacity="0"/>
            </linearGradient>
            <radialGradient :id="'head'+b.id" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stop-color="#5a7a5a"/>
              <stop offset="100%" stop-color="#0a1a10"/>
            </radialGradient>
          </defs>
          <!-- Shadow -->
          <ellipse cx="50" cy="86" rx="30" ry="4" fill="rgba(0,0,0,.5)"/>
          <!-- Legs (three per side, with joints) -->
          <g stroke="#0a0503" stroke-width="2.4" stroke-linecap="round" fill="none">
            <path d="M34 50 Q22 42 12 34"/>
            <path d="M34 58 Q18 60 8 62"/>
            <path d="M34 66 Q22 76 14 84"/>
            <path d="M66 50 Q78 42 88 34"/>
            <path d="M66 58 Q82 60 92 62"/>
            <path d="M66 66 Q78 76 86 84"/>
          </g>
          <!-- Body shadow -->
          <ellipse cx="50" cy="60" rx="28" ry="24" fill="#050a06" opacity=".55"/>
          <!-- Shell (elytra) -->
          <path d="M22 56 Q22 32 50 30 Q78 32 78 56 Q78 82 50 82 Q22 82 22 56 Z"
                :fill="`url(#shell${b.id})`" stroke="#03080a" stroke-width="1.4"/>
          <!-- Center split line -->
          <path d="M50 30 L50 82" stroke="#03080a" stroke-width="1.6"/>
          <!-- Elytra ridges / dots -->
          <g fill="#03080a" opacity=".75">
            <circle cx="36" cy="46" r="1.4"/>
            <circle cx="30" cy="58" r="1.4"/>
            <circle cx="34" cy="72" r="1.4"/>
            <circle cx="64" cy="46" r="1.4"/>
            <circle cx="70" cy="58" r="1.4"/>
            <circle cx="66" cy="72" r="1.4"/>
          </g>
          <!-- Iridescent highlight -->
          <path d="M28 42 Q36 34 50 34 Q60 34 66 40 Q52 44 28 52 Z" :fill="`url(#shell2${b.id})`"/>
          <ellipse cx="38" cy="40" rx="10" ry="4" fill="#d6f5e2" opacity=".55"/>
          <!-- Head with pronotum -->
          <path d="M38 30 Q38 20 50 18 Q62 20 62 30 Q62 34 50 34 Q38 34 38 30 Z" :fill="`url(#head${b.id})`" stroke="#03080a" stroke-width="1.3"/>
          <ellipse cx="46" cy="22" rx="4" ry="2" fill="#7ea88a" opacity=".7"/>
          <!-- Eyes -->
          <circle cx="42" cy="24" r="1.8" fill="#fbeaa8"/>
          <circle cx="58" cy="24" r="1.8" fill="#fbeaa8"/>
          <circle cx="42" cy="24" r=".8" fill="#0a0503"/>
          <circle cx="58" cy="24" r=".8" fill="#0a0503"/>
          <!-- Antennae -->
          <path d="M42 20 Q36 12 28 6" stroke="#0a0503" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <path d="M58 20 Q64 12 72 6" stroke="#0a0503" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <circle cx="28" cy="6" r="1.6" fill="#0a0503"/>
          <circle cx="72" cy="6" r="1.6" fill="#0a0503"/>
        </svg>
        <div v-if="!b.landed" class="life-ring bug-ring">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="3"/>
            <circle cx="20" cy="20" r="18" fill="none" stroke="#f87171" stroke-width="3"
                    stroke-linecap="round" pathLength="1"
                    :stroke-dasharray="`${b.remain/b.total} 1`"
                    transform="rotate(-90 20 20)"/>
          </svg>
        </div>
      </button>

      <!-- ============ HIT EFFECTS (explosion for bugs, water splash for fires) ============ -->
      <div v-for="e in effects" :key="'fx'+e.id" class="fx" :class="'fx-'+e.type"
           :style="{ left: e.x+'%', top: e.y+'%' }">
        <svg v-if="e.type==='explosion'" viewBox="-50 -50 100 100">
          <defs>
            <radialGradient :id="'exC'+e.id" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stop-color="#ffffff"/>
              <stop offset="30%"  stop-color="#fff2a0"/>
              <stop offset="60%"  stop-color="#ff9a1e"/>
              <stop offset="100%" stop-color="#c81a1a" stop-opacity="0"/>
            </radialGradient>
            <radialGradient :id="'exS'+e.id" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stop-color="#5a4030" stop-opacity=".85"/>
              <stop offset="100%" stop-color="#2a1a10" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <!-- Smoke puffs (behind) -->
          <g class="ex-smoke" :fill="`url(#exS${e.id})`">
            <circle cx="-14" cy="-10" r="16"/>
            <circle cx="16" cy="-8" r="14"/>
            <circle cx="-8" cy="14" r="15"/>
            <circle cx="18" cy="12" r="12"/>
            <circle cx="0" cy="-18" r="12"/>
          </g>
          <!-- Fireball core -->
          <circle class="ex-core" r="22" :fill="`url(#exC${e.id})`"/>
          <!-- Debris chunks (dark bug shell bits) -->
          <g class="ex-debris" fill="#1a0806">
            <path d="M-24 -18 l6 -2 l2 5 l-5 4 z"/>
            <path d="M22 -22 l5 2 l-1 6 l-6 -1 z"/>
            <path d="M-28 12 l6 1 l0 5 l-6 -2 z"/>
            <path d="M26 16 l4 3 l-2 5 l-5 -2 z"/>
            <path d="M-6 26 l5 0 l1 4 l-5 1 z"/>
            <path d="M4 -30 l4 1 l-1 4 l-4 0 z"/>
          </g>
        </svg>
        <svg v-else viewBox="-50 -50 100 100">
          <defs>
            <linearGradient :id="'wg'+e.id" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#93c5fd"/>
              <stop offset="100%" stop-color="#2563eb"/>
            </linearGradient>
          </defs>
          <g :fill="`url(#wg${e.id})`" opacity=".95">
            <path d="M-18 -30 Q-16 -18 -12 -6 Q-8 -18 -18 -30 Z"/>
            <path d="M2 -34 Q4 -20 8 -6 Q12 -20 2 -34 Z"/>
            <path d="M20 -28 Q22 -16 26 -4 Q28 -18 20 -28 Z"/>
          </g>
          <path d="M-30 4 Q-14 -18 0 -14 Q14 -18 30 4" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" opacity=".95"/>
          <g fill="#e0f2fe" opacity=".8">
            <circle cx="-12" cy="14" r="8"/>
            <circle cx="4" cy="10" r="9"/>
            <circle cx="18" cy="16" r="7"/>
            <circle cx="-2" cy="22" r="6"/>
          </g>
        </svg>
      </div>

      <!-- ============ SCORE POPUPS ============ -->
      <div v-for="p in pops" :key="'pop'+p.id" class="pop" :style="{ left: p.x+'%', top: p.y+'%', color: p.color }">
        {{ p.v > 0 ? '+' + p.v : 'MISS' }}
      </div>

      <!-- ============ HUD ============ -->
      <div class="hud">
        <div class="hud-left">
          <div class="chip hud-chip">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.5 6.5L21 10l-5 4.5L17.5 22 12 18l-5.5 4L8 14.5 3 10l6.5-1.5z"/></svg>
            </span>
            {{ t('difficulty') }} <b>{{ level }}</b>
          </div>
          <div class="chip hud-chip">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </span>
            {{ t('timeLeft') }} <b>{{ formatTime(remainMs) }}</b>
          </div>
          <div class="chip hud-chip score-chip">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            {{ t('score') }} <b>{{ score }}</b>
          </div>
        </div>
        <div class="hud-center">
          <div class="task-prompt">{{ t('taskPrompt') }}</div>
        </div>
        <div class="hud-right">
          <button v-if="showBatchSkip" class="btn ghost small" @click="$emit('batch-skip')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h4v12H6zm8 0h4v12h-4z"/></svg>
            {{ t('skipGame') }}
          </button>
          <button class="btn ghost small" @click="pause('back')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            {{ t('back') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pause modal -->
    <transition name="fade">
      <div v-if="paused" class="overlay pause-overlay" @click.self="resume">
        <div class="card pause-card">
          <div class="pause-icon">
            <svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
          </div>
          <h2>{{ t('pauseTitle') }}</h2>
          <p>{{ t('pauseDesc') }}</p>
          <div class="pause-actions">
            <button class="btn ghost" @click="resume">{{ t('resume') }}</button>
            <button class="btn danger" @click="endGame">{{ t('quit') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { store, t } from '../store'
import { DIFFICULTY, BUG_SCORE, FIRE_SCORE, ADAPT_WINDOW, UP_THRESHOLD, DOWN_THRESHOLD } from '../config'
import Tree from './Tree.vue'
import Daisy from './Daisy.vue'
import { getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { resolveVoice } from '../assets'

const GAME_TYPE = 'shhd' // 守护花朵 gameType

let ID = 1
const uid = () => ID++

export default {
  components: { Tree, Daisy },
  props: {
    duration: { type: Number, required: true },
    showBatchSkip: { type: Boolean, default: false },
  },
  data () {
    return {
      store,
      level: getBatchStartDifficultyForGame(GAME_TYPE),
      score: 0,
      bugs: [],
      pops: [],
      effects: [],
      wilted: false,
      trees: this.makeTrees(),
      bgTrees: this.makeBgTrees(),
      petals: this.makePetals(),
      decor: this.makeDecor(),
      startTs: 0,
      elapsedMs: 0,
      remainMs: this.duration * 1000,
      paused: false,
      winStart: 0,
      winTotal: 0,
      winSuccess: 0,
      total: 0,
      success: 0,
      fail: 0,
      reactionSum: 0,
      lastBugSpawn: 0,
      lastFireSpawn: 0,
      rafId: 0,
      lastFrame: 0
    }
  },
  computed: {
    t () { const _ = this.store.lang; return t },
    diff () { return DIFFICULTY[this.level - 1] }
  },
  methods: {
    formatTime (ms) {
      const s = Math.max(0, Math.ceil(ms / 1000))
      const m = Math.floor(s / 60)
      const r = s % 60
      return m + ':' + String(r).padStart(2, '0')
    },
    makeTrees () {
      // Placed along the perimeter around the flower; wider trees at bottom (closer)
      // Positioned to frame the flower while keeping tree canopies (where fires
      // appear) clear of the top HUD band so fires are always clickable.
      return [
        { x: 3,  y: 30, w: 13 },
        { x: 85, y: 30, w: 13 },
        { x: 1,  y: 55, w: 15 },
        { x: 86, y: 55, w: 15 },
        { x: 13, y: 46, w: 11 },
        { x: 76, y: 46, w: 11 },
        { x: 7,  y: 76, w: 16 },
        { x: 78, y: 76, w: 16 }
      ].map(t => ({ ...t, fire: null }))
    },
    makeBgTrees () {
      const arr = []
      for (let i = 0; i < 18; i++) {
        arr.push({ x: 40 + Math.random() * 1520, y: 490 + Math.random() * 130, s: 0.55 + Math.random() * 0.6 })
      }
      return arr
    },
    makePetals () {
      const cols = ['#f9a8d4', '#fda4af', '#fde68a', '#fbcfe8', '#fef3c7']
      const arr = []
      for (let i = 0; i < 8; i++) {
        arr.push({ x: Math.random() * 1600, y: -20 - Math.random() * 300, r: 1.5 + Math.random() * 2.5, c: cols[i % cols.length], d: 12 + Math.random() * 10 })
      }
      return arr
    },
    makeDecor () {
      const rocks = [], mushrooms = [], wildflowers = []
      for (let i = 0; i < 6; i++) rocks.push({ x: 120 + Math.random() * 1360, y: 720 + Math.random() * 130, s: 0.6 + Math.random() * 0.9 })
      for (let i = 0; i < 5; i++) mushrooms.push({ x: 160 + Math.random() * 1280, y: 740 + Math.random() * 110 })
      const colors = ['#f9a8d4', '#a5b4fc', '#fde68a', '#fca5a5']
      for (let i = 0; i < 14; i++) wildflowers.push({ x: 80 + Math.random() * 1440, y: 720 + Math.random() * 140, c: colors[i % colors.length] })
      return { rocks, mushrooms, wildflowers }
    },
    bugStyle (b) {
      // Position via transform only (translate + center + rotate) to keep the
      // whole update on the GPU compositor and avoid per-frame layout reflow.
      return {
        left: '0',
        top: '0',
        transform: `translate(${b.x}vw, ${b.y}vh) translate(-50%,-50%) rotate(${b.rot}deg)`,
        zIndex: 20 + Math.round(b.y)
      }
    },
    spawnBug () {
      // Spawn on a ring around the flower — close, but with enough distance
      // for the player to react. Radius in arena %.
      const cx = 50, cy = 58
      const angle = Math.random() * Math.PI * 2
      const radius = 22 + Math.random() * 10  // 22%–32% from flower
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius * 0.85 // slight vertical squash to keep on stage
      const dx = cx - x, dy = cy - y
      const rot = Math.atan2(dy, dx) * 180 / Math.PI + 90
      const total = this.diff.maxAnswerTime
      const dist = Math.hypot(dx, dy)
      const speed = dist / total
      this.bugs.push({ id: uid(), x, y, tx: cx, ty: cy, speed, total, remain: total, spawnTs: performance.now(), rot })
      this.total++; this.winTotal++
    },
    spawnFire () {
      const free = this.trees.filter(t => !t.fire)
      if (!free.length) return
      const t = free[Math.floor(Math.random() * free.length)]
      const total = this.diff.maxAnswerTime
      this.$set(t, 'fire', { id: uid(), total, remain: total, spawnTs: performance.now() })
      this.total++; this.winTotal++
    },
    playCue () {
      // Localized voice cue: fires on game start and whenever difficulty changes
      try {
        const lang = this.store.lang === 'en' ? 'english' : 'chinese'
        const url = resolveVoice(`/voice/${lang}/1.mp3`)
        const a = new Audio(url)
        a.volume = 0.9
        a.play().catch(() => { /* silently ignore autoplay block */ })
      } catch (e) { /* no-op */ }
    },
    playSfx (name) {
      try {
        const url = resolveVoice(`/voice/${name}.wav`)
        const a = new Audio(url)
        a.volume = 0.85
        a.play().catch(() => {})
      } catch (e) { /* no-op */ }
    },
    spawnEffect (type, x, y) {
      const id = uid()
      const dur = type === 'water' ? 750 : 550
      this.effects.push({ id, type, x, y })
      setTimeout(() => { this.effects = this.effects.filter(e => e.id !== id) }, dur)
    },
    hitBug (b) {
      if (this.paused) return
      // A bug that already landed on the flower can be swept off with a click.
      // It's already been counted as a failure — clicking it just clears the
      // pest so the flower can recover.
      if (b.landed) {
        this.spawnEffect('explosion', b.x, b.y)
        this.playSfx('2')
        this.bugs = this.bugs.filter(x => x.id !== b.id)
        if (!this.bugs.some(x => x.landed)) this.wilted = false
        return
      }
      const gain = Math.round(BUG_SCORE * this.diff.coeff)
      this.score += gain
      this.success++; this.winSuccess++
      this.reactionSum += (performance.now() - b.spawnTs)
      this.popup(b.x, b.y, gain, '#fde047')
      this.spawnEffect('explosion', b.x, b.y)
      this.playSfx('2')
      this.bugs = this.bugs.filter(x => x.id !== b.id)
    },
    hitFire (t) {
      if (this.paused || !t.fire) return
      const gain = Math.round(FIRE_SCORE * this.diff.coeff)
      this.score += gain
      this.success++; this.winSuccess++
      this.reactionSum += (performance.now() - t.fire.spawnTs)
      this.popup(t.x, t.y + 3, gain, '#fca5a5')
      this.spawnEffect('water', t.x, t.y + 3)
      this.playSfx('1')
      t.fire = null
    },
    popup (x, y, v, color) {
      const id = uid()
      this.pops.push({ id, x, y, v, color })
      setTimeout(() => { this.pops = this.pops.filter(p => p.id !== id) }, 900)
    },
    tick (now) {
      if (this.paused) { this.lastFrame = now; this.rafId = requestAnimationFrame(this.tick); return }
      const dt = this.lastFrame ? (now - this.lastFrame) : 16
      this.lastFrame = now
      this.elapsedMs += dt
      this.remainMs = Math.max(0, this.duration * 1000 - this.elapsedMs)

      for (const b of this.bugs) {
        if (b.landed) continue
        const dx = b.tx - b.x, dy = b.ty - b.y
        const d = Math.hypot(dx, dy)
        if (d > 0.1) {
          const step = Math.min(b.speed * dt, d)
          b.x += (dx / d) * step
          b.y += (dy / d) * step
        }
        b.remain -= dt
      }
      // Bugs that reached the flower — land, count as failure, wilt the flower,
      // but keep the bug on stage so the player can see the damage.
      for (const b of this.bugs) {
        if (!b.landed && Math.hypot(b.tx - b.x, b.ty - b.y) < 1) {
          this.$set(b, 'landed', true)
          this.fail++
          this.popup(b.x, b.y, 0, '#f87171')
          this.wilted = true
        }
      }
      // Bugs that timed out without reaching the flower — remove and count as fail.
      const timedOut = this.bugs.filter(b => !b.landed && b.remain <= 0)
      if (timedOut.length) {
        for (const b of timedOut) this.popup(b.x, b.y, 0, '#f87171')
        this.fail += timedOut.length
        this.bugs = this.bugs.filter(b => !timedOut.includes(b))
      }
      for (const t of this.trees) {
        if (!t.fire) continue
        t.fire.remain -= dt
        if (t.fire.remain <= 0) {
          this.fail++
          this.popup(t.x, t.y + 3, 0, '#f87171')
          t.fire = null
        }
      }

      if (now - this.lastBugSpawn >= this.diff.bugInterval) { this.lastBugSpawn = now; this.spawnBug() }
      if (now - this.lastFireSpawn >= this.diff.fireInterval) { this.lastFireSpawn = now; this.spawnFire() }

      if (this.elapsedMs - this.winStart >= ADAPT_WINDOW) {
        this.evaluateWindow()
        this.winStart = this.elapsedMs
        this.winTotal = 0
        this.winSuccess = 0
      }

      if (this.remainMs <= 0) { this.finish(); return }
      this.rafId = requestAnimationFrame(this.tick)
    },
    evaluateWindow () {
      if (this.winTotal === 0) return
      const rate = this.winSuccess / this.winTotal
      const prev = this.level
      if (rate >= UP_THRESHOLD && this.level < DIFFICULTY.length) this.level++
      else if (rate <= DOWN_THRESHOLD && this.level > 1) this.level--
      if (this.level !== prev) this.playCue()
    },
    pause () { this.paused = true },
    resume () { this.paused = false; this.lastFrame = 0 },
    endGame () { this.paused = false; cancelAnimationFrame(this.rafId); this.$emit('quit') },
    finish () {
      cancelAnimationFrame(this.rafId)
      const answered = this.success + this.fail
      const rate = answered ? this.success / answered : 0
      const avg = this.success ? Math.round(this.reactionSum / this.success) : 0
      const result = {
        ts: Date.now(),
        project: this.store.lang === 'zh' ? '守护花朵' : 'Guard the Flower',
        level: this.level,
        duration: this.duration,
        total: answered,
        success: this.success,
        fail: this.fail,
        rate,
        avgMs: avg,
        score: this.score
      }
      this.$emit('finish', result)
    }
  },
  mounted () {
    this.startTs = performance.now()
    this.lastBugSpawn = this.startTs
    this.lastFireSpawn = this.startTs
    this.rafId = requestAnimationFrame(this.tick)
    setTimeout(() => this.spawnBug(), 600)
    setTimeout(() => this.spawnFire(), 1400)
    // Voice cue on game start
    this.playCue()
  },
  beforeDestroy () { cancelAnimationFrame(this.rafId) }
}
</script>

<style scoped>
.game-root { position: absolute; inset: 0; }
.stage { position: absolute; inset: 0; overflow: hidden; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; }

/* HUD — larger typography */
.hud {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 2.4vmin 3vmin;
  display: flex; justify-content: space-between; align-items: flex-start;
  z-index: 60;
  pointer-events: none;
  gap: 2vmin;
}
.hud > * { pointer-events: auto; }
.hud-left { display: flex; gap: 1.4vmin; flex-wrap: wrap; }
.hud-chip { font-size: 2.2vmin; padding: .7em 1.3em; color: #fff; }
.hud-chip b { color: #fde68a; margin-left: .5em; font-size: 2.6vmin; }
.hud-chip .icon svg { width: 1.9vmin; height: 1.9vmin; }
.score-chip b { color: #a7f3d0; }
.hud-center { flex: 1; display: flex; justify-content: center; margin: 0 1.5vmin; }
.task-prompt {
  padding: 1.4vmin 3vmin;
  background: rgba(0,0,0,.68);
  border: 1.5px solid rgba(255,255,255,.24);
  border-radius: 999px;
  font-size: 2vmin;
  font-weight: 800;
  letter-spacing: .05em;
  color: #fef3c7;
  white-space: nowrap;
  box-shadow: 0 12px 34px -10px rgba(0,0,0,.6);
}
.hud-right { display: flex; gap: 1.2vmin; }
.btn.small { padding: .7em 1.4em; font-size: 1.9vmin; }
.btn.small svg { margin-right: .5em; width: 1.9vmin; height: 1.9vmin; }

/* Flower center — anchored to the ground line */
.flower {
  position: absolute; left: 50%; top: 82%;
  transform: translate(-50%, -100%);
  width: 28vmin; height: 38vmin;
  z-index: 40;
  filter: drop-shadow(0 20px 30px rgba(0,0,0,.5));
  pointer-events: none;
  transition: filter .9s ease, transform .9s cubic-bezier(.36,.07,.19,.97);
}
.flower svg { width: 100%; height: 100%; display: block; }
.flower.wilted {
  filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)) grayscale(.5) sepia(.35) hue-rotate(-20deg) brightness(.72);
  transform: translate(-50%, -96%) rotate(-11deg);
}

/* Trees */
.tree { position: absolute; transform: translate(-50%,0); pointer-events: none; }
.tree-svg { width: 100%; height: auto; display: block; filter: drop-shadow(0 10px 14px rgba(0,0,0,.45)); }

/* Fire */
.fire-btn {
  position: absolute; left: 50%; top: 18%;
  transform: translate(-50%,-50%);
  width: 55%; aspect-ratio: 100/140;
  background: transparent; padding: 0;
  pointer-events: auto;
  animation: fireSpawn .35s cubic-bezier(.34,1.56,.64,1);
  will-change: transform;
}
@keyframes fireSpawn { from { transform: translate(-50%,-50%) scale(.2); opacity: 0 } to { transform: translate(-50%,-50%) scale(1); opacity: 1 } }
.fire-svg { width: 100%; height: 100%; display: block; }
.pop-enter-active, .pop-leave-active { transition: transform .25s ease, opacity .25s ease; }
.pop-enter, .pop-leave-to { transform: translate(-50%,-50%) scale(.2); opacity: 0; }

/* Bugs */
.bug {
  position: absolute;
  width: 7vmin; height: 7vmin;
  background: transparent; padding: 0;
  animation: bugSpawn .3s ease;
  cursor: crosshair;
  will-change: transform;
}
@keyframes bugSpawn { from { opacity: 0 } to { opacity: 1 } }
.bug svg { width: 100%; height: 100%; display: block; }
.bug:hover svg { transform: scale(1.06); transition: transform .1s; }

/* Life ring */
.life-ring { position: absolute; right: -6px; top: -6px; width: 28%; }
.bug-ring { right: -8px; top: -8px; width: 34%; }
.life-ring svg { width: 100%; height: auto; display: block; }

/* Hit effects */
.fx {
  position: absolute;
  width: 14vmin; height: 14vmin;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 90;
}
.fx svg { width: 100%; height: 100%; display: block; overflow: visible; }
.fx-explosion { animation: fxBoom .55s ease-out forwards; }
.fx-explosion .ex-core { transform-origin: center; animation: exCore .55s ease-out forwards; }
.fx-explosion .ex-smoke { transform-origin: center; animation: exSmoke .7s ease-out forwards; }
.fx-explosion .ex-debris { transform-origin: center; animation: exDebris .6s cubic-bezier(.2,.7,.3,1) forwards; }
@keyframes exCore {
  0%   { transform: scale(.2); opacity: 0; }
  25%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes exSmoke {
  0%   { transform: scale(.3); opacity: 0; }
  40%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.55); opacity: 0; }
}
@keyframes exDebris {
  0%   { transform: scale(.1); opacity: 0; }
  30%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}
.fx-water {
  width: 16vmin; height: 16vmin;
  animation: fxSplash .75s ease-out forwards;
}
@keyframes fxSplash {
  0%   { opacity: 0; transform: translate(-50%, -85%) scale(.5); }
  30%  { opacity: 1; transform: translate(-50%, -55%) scale(1); }
  70%  { opacity: .95; transform: translate(-50%, -45%) scale(1.15); }
  100% { opacity: 0; transform: translate(-50%, -40%) scale(1.3); }
}

/* Score popup */
.pop {
  position: absolute; transform: translate(-50%,-50%);
  font-weight: 900; font-size: 2.6vmin;
  text-shadow: 0 2px 8px rgba(0,0,0,.7), 0 0 12px currentColor;
  pointer-events: none;
  animation: popUp .9s ease-out forwards;
  z-index: 80;
  letter-spacing: .05em;
}
@keyframes popUp {
  0% { opacity: 0; transform: translate(-50%,-50%) scale(.5) }
  20% { opacity: 1; transform: translate(-50%,-90%) scale(1.15) }
  100% { opacity: 0; transform: translate(-50%,-170%) scale(.9) }
}

/* Pause — overlay must sit above bugs (z up to ~110) and pops (80) */
.pause-overlay { z-index: 300; }
.pause-card { text-align: center; padding: 5vmin 6vmin; width: min(56vmin, 90vw); }
.pause-icon { display: inline-flex; margin-bottom: 1.6vmin; color: #fde68a; }
.pause-icon svg { width: 6vmin; height: 6vmin; }
.pause-card h2 { font-size: 3.6vmin; margin-bottom: 1.6vmin; }
.pause-card p { color: #e2e8f0; margin-bottom: 3.4vmin; line-height: 1.7; font-size: 2.2vmin; }
.pause-actions { display: flex; gap: 1.6vmin; justify-content: center; }
.pause-actions .btn { padding: 1.1em 2.2em; font-size: 2.2vmin; min-width: 16vmin; }
</style>
