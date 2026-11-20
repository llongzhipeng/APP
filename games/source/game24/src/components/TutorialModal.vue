<template>
  <div class="tutorial-overlay">
    <div class="tutorial-box">
      <h2 class="tutorial-title">{{ t.tutorialTitle }}</h2>
      <div class="step-dots">
        <span v-for="i in 4" :key="i" class="dot" :class="{ active: step === i - 1 }"></span>
      </div>
      <div class="demo-area">
        <!-- Step 0: target piece on left, tangram on right -->
        <div v-if="step === 0" class="demo-step">
          <div class="demo-layout">
            <div class="demo-left">
              <div class="demo-label">{{ lang === 'zh' ? '目标积木' : 'Target' }}</div>
              <div class="demo-tangram-target">
                <svg viewBox="-2 -2 44 64"><polygon points="0,0 40,0 40,60 0,60" fill="#E85C3A" stroke="#0a1428" stroke-width="0.6"/></svg>
              </div>
            </div>
            <div class="demo-arrow-right">→</div>
            <div class="demo-right">
              <div class="demo-label">{{ lang === 'zh' ? '右侧七巧板' : 'Tangram' }}</div>
              <div class="demo-tangram-board">
                <svg viewBox="-2 -2 104 104">
                  <polygon points="0,0 60,0 60,40 0,40" fill="#4A90D9" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="60,0 100,0 100,40 60,40" fill="#4CAF50" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="0,40 40,40 40,100 0,100" fill="#9C27B0" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="40,40 100,40 100,100 40,100" fill="#E8A838" stroke="#0a1428" stroke-width="0.6"/>
                </svg>
              </div>
            </div>
          </div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '观察左侧目标积木的形状' : 'Observe the target shape on the left' }}</p>
        </div>

        <!-- Step 1: identify the matching piece -->
        <div v-if="step === 1" class="demo-step">
          <div class="demo-layout">
            <div class="demo-left">
              <div class="demo-label">{{ lang === 'zh' ? '目标' : 'Target' }}</div>
              <div class="demo-tangram-target">
                <svg viewBox="-2 -2 44 64"><polygon points="0,0 40,0 40,60 0,60" fill="#9C27B0" stroke="#0a1428" stroke-width="0.6"/></svg>
              </div>
            </div>
            <div class="demo-arrow-right">→</div>
            <div class="demo-right">
              <div class="demo-label">{{ lang === 'zh' ? '在七巧板中找到它' : 'Find it in the tangram' }}</div>
              <div class="demo-tangram-board">
                <svg viewBox="-2 -2 104 104">
                  <polygon points="0,0 60,0 60,40 0,40" fill="#4A90D9" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="60,0 100,0 100,40 60,40" fill="#4CAF50" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="0,40 40,40 40,100 0,100" fill="#9C27B0" stroke="#fff" stroke-width="2" style="filter: brightness(1.3);"/>
                  <polygon points="40,40 100,40 100,100 40,100" fill="#E8A838" stroke="#0a1428" stroke-width="0.6"/>
                </svg>
              </div>
            </div>
          </div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '颜色不重要，只看形状和大小是否相同' : 'Color does not matter — only shape and size' }}</p>
        </div>

        <!-- Step 2: click & feedback -->
        <div v-if="step === 2" class="demo-step">
          <div class="demo-layout">
            <div class="demo-left">
              <div class="demo-label">{{ lang === 'zh' ? '目标' : 'Target' }}</div>
              <div class="demo-tangram-target">
                <svg viewBox="-2 -2 44 64"><polygon points="0,0 40,0 40,60 0,60" fill="#9C27B0" stroke="#0a1428" stroke-width="0.6"/></svg>
              </div>
            </div>
            <div class="demo-arrow-right">→</div>
            <div class="demo-right">
              <div class="demo-label">{{ lang === 'zh' ? '点击正确的方块' : 'Click the right piece' }}</div>
              <div class="demo-tangram-board">
                <svg viewBox="-2 -2 104 104">
                  <polygon points="0,0 60,0 60,40 0,40" fill="#4A90D9" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="60,0 100,0 100,40 60,40" fill="#4CAF50" stroke="#0a1428" stroke-width="0.6"/>
                  <polygon points="0,40 40,40 40,100 0,100" fill="#9C27B0" stroke="#86efac" stroke-width="3" style="filter: brightness(1.4) saturate(1.4);"/>
                  <polygon points="40,40 100,40 100,100 40,100" fill="#E8A838" stroke="#0a1428" stroke-width="0.6"/>
                  <text x="20" y="78" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">✓</text>
                </svg>
              </div>
            </div>
          </div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '点对了会变亮并显示 ✓' : 'Correct piece flashes green ✓' }}</p>
        </div>

        <!-- Step 3: Score -->
        <div v-if="step === 3" class="demo-step success-step">
          <div class="success-anim">🎉</div>
          <div class="score-preview">+{{ lang === 'zh' ? '5 分' : '5 pts' }}</div>
          <p class="demo-hint-text">{{ lang === 'zh' ? '答对得分！每60秒自动调整难度（共6级）' : 'Score earned! Difficulty auto-adjusts every 60s (6 levels)' }}</p>
        </div>
      </div>

      <div class="tutorial-nav">
        <button class="nav-btn" @click="$emit('skip')">{{ t.skip }}</button>
        <div class="nav-arrows">
          <button class="nav-btn arrow-btn" :disabled="step === 0" @click="step--">{{ t.prev }}</button>
          <button class="nav-btn arrow-btn primary" @click="onNext">
            {{ step === 3 ? t.skip : t.next }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import messages from '../i18n.js'
export default {
  props: { lang: String },
  emits: ['done', 'skip'],
  data() { return { step: 0, clickAnim: false } },
  computed: { t() { return messages[this.lang] || messages.zh } },
  methods: {
    onNext() {
      if (this.step < 3) { this.step++; this.clickAnim = false }
      else this.$emit('done')
    }
  }
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: #f3e8d9;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.tutorial-box {
  background: #fffdf7;
  border: 0.2vmin solid rgba(100,180,255,0.3);
  border-radius: 2vmin;
  padding: 3vmin 4vmin;
  width: min(70vmin, 92vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vmin;
  box-shadow: 0 2vmin 6vmin rgba(84,66,42,.18);
}
.tutorial-title { color: #2d4158; font-size: 3vmin; font-weight: 800; }
.step-dots { display: flex; gap: 1.2vmin; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: #d5c3a8; transition: background 0.3s; }
.dot.active { background: #4A90D9; }
.demo-area { width: 100%; min-height: 28vmin; display: flex; align-items: center; justify-content: center; }
.demo-step { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; width: 100%; }
.demo-layout { display: flex; align-items: center; gap: 2vmin; justify-content: center; }
.demo-left, .demo-right { display: flex; flex-direction: column; align-items: center; gap: 1vmin; }
.demo-label { font-size: 1.6vmin; color: #50637a; }
.demo-block { width: 10vmin; height: 10vmin; }
.target-block svg { width: 100%; height: 100%; filter: drop-shadow(0 0.3vmin 1vmin rgba(0,0,0,0.5)); }
.demo-arrow-right { font-size: 4vmin; color: #50637a; }
.demo-options-preview { display: flex; gap: 1vmin; }
.demo-options-preview.grid2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 1vmin; }
.demo-opt {
  width: 7vmin; height: 7vmin;
  border-radius: 1vmin;
  background: rgba(30,50,90,0.6);
  border: 0.2vmin solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; cursor: pointer;
  transition: all 0.3s;
}
.demo-opt svg { width: 85%; height: 85%; }
.demo-opt.opt-correct { background: rgba(46,125,50,0.7); border-color: rgba(76,175,80,0.6); }
.demo-opt.opt-wrong { background: rgba(198,40,40,0.7); border-color: rgba(244,67,54,0.6); }
.check-mark { position: absolute; font-size: 3vmin; color: #4caf50; font-weight: 900; }
.demo-hint-text { font-size: 2vmin; color: #3e5068; text-align: center; }
.success-step { gap: 2vmin; }
.success-anim { font-size: 8vmin; animation: pop 0.6s ease-out; }
@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
.score-preview { font-size: 4vmin; font-weight: 900; color: #815108; }
.tutorial-nav { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 1vmin; }
.nav-arrows { display: flex; gap: 1.5vmin; }
.nav-btn {
  padding: 1.2vmin 2.5vmin; font-size: 1.8vmin; border-radius: 1vmin; cursor: pointer;
  background: #f3e9db; border: 0.2vmin solid #e4d4bb;
  color: #2d4158; transition: all 0.2s; font-weight: 600;
}
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.arrow-btn.primary { color: #fff; background: linear-gradient(135deg, #2A5EA8, #4A90D9); border-color: rgba(100,180,255,0.4); }
.nav-btn.arrow-btn.primary:hover { background: linear-gradient(135deg, #3A70C0, #5AA8F0); }
</style>
