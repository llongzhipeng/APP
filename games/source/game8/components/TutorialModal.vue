<template>
  <div class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">{{ t('tutorialTitle') }}</span>
        <span class="slide-indicator">{{ t('slide') }}{{ currentSlide + 1 }}{{ t('slideOf') }}</span>
      </div>

      <!-- Slide content -->
      <div class="slide-area">
        <!-- Slide 0: Introduction -->
        <div v-if="currentSlide === 0" class="slide">
          <div class="slide-icon">🧠</div>
          <h3 class="slide-title">{{ t('tut1Title') }}</h3>
          <p class="slide-text">{{ t('tut1Content') }}</p>
          <div class="sample-cards-row">
            <div class="mini-card" v-for="c in sampleCards4" :key="c.id">
              <svg viewBox="0 0 40 40" class="mini-shape" xmlns="http://www.w3.org/2000/svg">
                <circle v-if="c.shape==='circle'" cx="20" cy="20" r="17" :fill="colorOf(c.color)"/>
                <polygon v-else-if="c.shape==='triangle'" points="20,4 37,36 3,36" :fill="colorOf(c.color)"/>
                <rect v-else-if="c.shape==='square'" x="4" y="4" width="32" height="32" :fill="colorOf(c.color)"/>
                <polygon v-else-if="c.shape==='star'" points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9" :fill="colorOf(c.color)"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Slide 1: How to Play -->
        <div v-else-if="currentSlide === 1" class="slide">
          <div class="slide-icon">🃏</div>
          <h3 class="slide-title">{{ t('tut2Title') }}</h3>
          <p class="slide-text">{{ t('tut2Content') }}</p>
          <div class="demo-area">
            <div class="demo-label demo-label-top">{{ t('difficulty') }} 1 — {{ t('ruleColor') }}</div>
            <div class="sample-cards-row">
              <div
                class="mini-card"
                :class="{ 'mini-correct': i === 0 }"
                v-for="(c, i) in sampleCards4"
                :key="c.id"
              >
                <svg viewBox="0 0 40 40" class="mini-shape">
                  <circle v-if="c.shape==='circle'" cx="20" cy="20" r="17" :fill="colorOf(c.color)"/>
                  <polygon v-else-if="c.shape==='triangle'" points="20,4 37,36 3,36" :fill="colorOf(c.color)"/>
                  <rect v-else-if="c.shape==='square'" x="4" y="4" width="32" height="32" :fill="colorOf(c.color)"/>
                  <polygon v-else-if="c.shape==='star'" points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9" :fill="colorOf(c.color)"/>
                </svg>
              </div>
            </div>
            <div class="arrow-down">↓ {{ t('targetLabel') }}</div>
            <div class="mini-card mini-target">
              <!-- Target: red square (matches card0 by color=red) -->
              <svg viewBox="0 0 40 40" class="mini-shape"><rect x="4" y="4" width="32" height="32" fill="#E53935"/></svg>
              <svg viewBox="0 0 40 40" class="mini-shape"><rect x="4" y="4" width="32" height="32" fill="#E53935"/></svg>
              <svg viewBox="0 0 40 40" class="mini-shape"><rect x="4" y="4" width="32" height="32" fill="#E53935"/></svg>
            </div>
          </div>
        </div>

        <!-- Slide 2: Difficulty -->
        <div v-else-if="currentSlide === 2" class="slide">
          <div class="slide-icon">⚡</div>
          <h3 class="slide-title">{{ t('tut3Title') }}</h3>
          <p class="slide-text">{{ t('tut3Content') }}</p>
          <div class="diff-table">
            <div class="diff-row diff-header">
              <span>Lv</span><span>{{ t('rulesRule') }}</span><span>{{ t('rulesTime') }}</span><span>{{ t('rulesCoeff') }}</span>
            </div>
            <div class="diff-row" v-for="d in diffRows" :key="d.lv">
              <span>{{ d.lv }}</span>
              <span>{{ d.rule }}</span>
              <span>{{ d.time }}s</span>
              <span>{{ d.coeff }}</span>
            </div>
          </div>
        </div>

        <!-- Slide 3: Scoring -->
        <div v-else-if="currentSlide === 3" class="slide">
          <div class="slide-icon">🏆</div>
          <h3 class="slide-title">{{ t('tut4Title') }}</h3>
          <p class="slide-text">{{ t('tut4Content') }}</p>
          <div class="score-examples">
            <div class="score-ex" v-for="ex in scoreExamples" :key="ex.lv">
              <span class="score-lv">Lv {{ ex.lv }}</span>
              <span class="score-pts">+{{ ex.pts }} pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dots -->
      <div class="dots">
        <span
          v-for="i in 4"
          :key="i"
          class="dot"
          :class="{ active: currentSlide === i - 1 }"
          @click="currentSlide = i - 1"
        />
      </div>

      <!-- Navigation buttons -->
      <div class="modal-footer">
        <button class="btn-skip" @click="$emit('skip')">{{ t('skip') }}</button>
        <div class="nav-btns">
          <button class="btn-nav" @click="prev" :disabled="currentSlide === 0">{{ t('prev') }}</button>
          <button v-if="currentSlide < 3" class="btn-nav btn-next" @click="next">{{ t('next') }}</button>
          <button v-else class="btn-nav btn-start" @click="$emit('done')">{{ t('startNow') }} ▶</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../utils/i18n.js'
import { CARD_DECK, COLOR_VALUES, DIFFICULTIES } from '../utils/gameData.js'

export default {
  name: 'TutorialModal',
  emits: ['done', 'skip'],
  data() {
    return {
      currentSlide: 0,
      sampleCards4: CARD_DECK.slice(0, 4),
      diffRows: DIFFICULTIES.map(d => ({
        lv: d.level,
        rule: d.rule === 'color' ? '颜色/Color' : d.rule === 'quantity' ? '数量/Qty' : '形状/Shape',
        time: d.timeLimit,
        coeff: d.coefficient,
      })),
      scoreExamples: DIFFICULTIES.map(d => ({
        lv: d.level,
        pts: 5 * d.coefficient,
      })),
    }
  },
  methods: {
    t,
    colorOf(c) { return COLOR_VALUES[c] },
    prev() { if (this.currentSlide > 0) this.currentSlide-- },
    next() { if (this.currentSlide < 3) this.currentSlide++ },
  },
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #fff;
  border-radius: 2vmin;
  width: min(88vw, 70vmin);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.35);
}

.modal-header {
  background: #4A90E2;
  color: white;
  padding: 2vmin 3vmin;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 2.4vmin;
  font-weight: 700;
}

.slide-indicator {
  font-size: 1.6vmin;
  opacity: 0.8;
}

.slide-area {
  flex: 1;
  overflow-y: auto;
  padding: 2.5vmin 3vmin;
}

.slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5vmin;
}

.slide-icon {
  font-size: 5vmin;
}

.slide-title {
  font-size: 2.4vmin;
  font-weight: 700;
  color: #4A90E2;
  margin: 0;
}

.slide-text {
  font-size: 1.8vmin;
  color: #444;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* Sample card row */
.sample-cards-row {
  display: flex;
  gap: 1.5vmin;
  margin-top: 1vmin;
}

.mini-card {
  background: #fff;
  border: 0.3vmin solid #ddd;
  border-radius: 0.8vmin;
  width: 9vmin;
  height: 12vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3vmin;
  padding: 0.5vmin;
  box-shadow: 0 0.2vmin 0.8vmin rgba(0,0,0,0.1);
}

.mini-correct {
  border-color: #43A047;
  background: #E8F5E9;
  box-shadow: 0 0 0 0.25vmin rgba(67,160,71,0.5);
}

.mini-target {
  border-color: #4A90E2;
  border-width: 0.35vmin;
  border-style: dashed;
  width: 9vmin;
  height: 12vmin;
}

.mini-shape {
  width: 4vmin;
  height: 4vmin;
}

.demo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vmin;
  background: #f5f7ff;
  border-radius: 1.2vmin;
  padding: 1.5vmin 2vmin;
  width: 100%;
}

.demo-label {
  font-size: 1.4vmin;
  color: #4A90E2;
  font-weight: 600;
}

.arrow-down {
  font-size: 1.5vmin;
  color: #888;
}

/* Difficulty table */
.diff-table {
  width: 100%;
  border-radius: 1vmin;
  overflow: hidden;
  border: 0.2vmin solid #e0e0e0;
  font-size: 1.6vmin;
}

.diff-row {
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr 1fr;
  gap: 0.5vmin;
  padding: 0.8vmin 1.2vmin;
  border-bottom: 0.15vmin solid #e0e0e0;
}

.diff-row:last-child { border-bottom: none; }

.diff-header {
  background: #4A90E2;
  color: white;
  font-weight: 600;
}

.diff-row:nth-child(even) { background: #f5f7ff; }

/* Score examples */
.score-examples {
  display: flex;
  gap: 1.5vmin;
  flex-wrap: wrap;
  justify-content: center;
}

.score-ex {
  background: #f5f7ff;
  border: 0.2vmin solid #4A90E2;
  border-radius: 1vmin;
  padding: 1vmin 1.5vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3vmin;
}

.score-lv {
  font-size: 1.5vmin;
  color: #888;
}

.score-pts {
  font-size: 2.2vmin;
  font-weight: 700;
  color: #4A90E2;
}

/* Dots */
.dots {
  display: flex;
  justify-content: center;
  gap: 1vmin;
  padding: 1.2vmin 0;
}

.dot {
  width: 1.2vmin;
  height: 1.2vmin;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: background 0.2s;
}

.dot.active {
  background: #4A90E2;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5vmin 3vmin;
  border-top: 0.15vmin solid #eee;
}

.btn-skip {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.8vmin;
  cursor: pointer;
  padding: 0.5vmin 1vmin;
}

.btn-skip:hover { color: #666; }

.nav-btns {
  display: flex;
  gap: 1.2vmin;
}

.btn-nav {
  padding: 0.9vmin 2.2vmin;
  font-size: 1.8vmin;
  border-radius: 0.8vmin;
  border: 0.2vmin solid #4A90E2;
  background: #fff;
  color: #4A90E2;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}

.btn-nav:hover:not(:disabled) {
  background: #e3f0ff;
}

.btn-nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.btn-nav.btn-next {
  background: #4A90E2;
  color: white;
}

.btn-nav.btn-next:hover:not(:disabled) {
  background: #357abd;
}

.btn-nav.btn-next:focus {
  background: #4A90E2;
  outline: none;
}

.btn-start {
  background: #43A047;
  border-color: #43A047;
  color: white;
}

.btn-start:hover {
  background: #2e7d32;
}
</style>
