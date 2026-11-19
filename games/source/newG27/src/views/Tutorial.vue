<template>
  <div class="overlay">
    <div class="modal">
      <div class="header">
        <h2>{{ t('tutorialTitle') }}</h2>
        <div class="dots">
          <span v-for="i in 4" :key="i" :class="{ active: i === step }"></span>
        </div>
      </div>
      <div class="body">
        <transition name="fade" mode="out-in">
          <div class="step" :key="step">
            <div class="demo">
              <!-- 步骤1: 房间高亮 -->
              <div v-if="step === 1" class="room-demo">
                <Room :scene="demoScene" :highlights="['vase']" />
                <div class="demo-label">👀 {{ tut1() }}</div>
              </div>
              <!-- 步骤2: 房间消失 -->
              <div v-else-if="step === 2" class="room-demo">
                <Room :scene="demoScene" :highlights="['vase']" :fading="true" />
                <div class="demo-label pulse">⏱ {{ tut2() }}</div>
              </div>
              <!-- 步骤3: 答题 -->
              <div v-else-if="step === 3" class="quiz-demo">
                <div class="q">{{ demoQuestion }}</div>
                <div class="opts">
                  <div class="opt" v-for="(o, i) in ['红色', '蓝色', '绿色', '黄色']" :key="i" :class="{ hint: i === 0 }">
                    <span class="color-dot" :style="{ background: ['#e74c3c','#3498db','#2ecc71','#f1c40f'][i] }"></span>
                    {{ store.lang === 'zh' ? o : ['Red','Blue','Green','Yellow'][i] }}
                  </div>
                </div>
              </div>
              <!-- 步骤4: 得分 -->
              <div v-else class="score-demo">
                <div class="score-badge">
                  <div class="big">+5</div>
                  <div class="lbl">{{ t('correct') }}!</div>
                </div>
                <div class="stats">
                  <div><span>{{ t('score') }}</span><b>25</b></div>
                  <div><span>{{ t('difficulty') }}</span><b>Lv.2 ↑</b></div>
                </div>
              </div>
            </div>
            <div class="desc">
              <h3>{{ t(['tutStep1','tutStep2','tutStep3','tutStep4'][step - 1]) }}</h3>
              <p>{{ t(['tutStep1Desc','tutStep2Desc','tutStep3Desc','tutStep4Desc'][step - 1]) }}</p>
            </div>
          </div>
        </transition>
      </div>
      <div class="footer">
        <button class="btn ghost" @click="$emit('done')">{{ t('skipTutorial') }}</button>
        <div class="spacer"></div>
        <button class="btn" @click="step--" :disabled="step === 1">← {{ t('prev') }}</button>
        <button v-if="step < 4" class="btn primary" @click="step++">{{ t('next') }} →</button>
        <button v-else class="btn primary" @click="$emit('done')">{{ t('startNow') }} ✓</button>
      </div>
    </div>
  </div>
</template>
<script>
import { t as trans } from '../i18n.js'
import { store } from '../store.js'
import Room from '../components/Room.vue'
export default {
  name: 'Tutorial',
  components: { Room },
  data() {
    return {
      store,
      step: 1,
      demoScene: {
        clock: { hour: 10, minute: 15 },
        books: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }],
        vase: { color: 'red' },
        shirt: { color: 'blue' },
        pants: { color: 'purple' },
        skirt: { color: 'pink' }
      }
    }
  },
  computed: {
    demoQuestion() {
      return trans(store.lang, 'qColor', { item: trans(store.lang, 'vase') })
    }
  },
  methods: {
    t(k) { return trans(store.lang, k) },
    tut1() { return store.lang === 'zh' ? '注意黄色光晕物品' : 'Notice the glowing item' },
    tut2() { return store.lang === 'zh' ? '房间即将消失…' : 'Room fading…' }
  }
}
</script>
<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(10,10,30,0.85); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 4vh 4vw; }
.modal { width: min(120vmin, 96vw); max-height: 92vh; background: linear-gradient(180deg, #2d1b5e, #1a1a3e); border-radius: 3vmin; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 3vmin 8vmin rgba(0,0,0,0.6); color: #fff; overflow: hidden; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 3vmin 4vmin; border-bottom: 1px solid rgba(255,255,255,0.1); }
.header h2 { font-size: 3.4vmin; background: linear-gradient(135deg, #ffd166, #ef476f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.dots { display: flex; gap: 1vmin; }
.dots span { width: 4vmin; height: 0.9vmin; border-radius: 0.5vmin; background: rgba(255,255,255,0.2); transition: all .3s; }
.dots span.active { background: linear-gradient(90deg, #ffd166, #ef476f); width: 5.5vmin; }
.body { flex: 1; overflow: auto; padding: 3vmin 4vmin; }
.step { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4vmin; align-items: center; }
@media (max-width: 720px) { .step { grid-template-columns: 1fr; } }
.demo { aspect-ratio: 4/3; position: relative; border-radius: 2vmin; overflow: hidden; background: #000; }
.room-demo { width: 100%; height: 100%; position: relative; }
.demo-label { position: absolute; top: 1.5vmin; left: 1.5vmin; background: rgba(0,0,0,0.7); padding: 1.2vmin 2vmin; border-radius: 999px; font-size: 2vmin; z-index: 10; font-weight: 600; }
.demo-label.pulse { animation: p 1s ease infinite; }
@keyframes p { 50% { transform: scale(1.05); background: rgba(239, 71, 111, 0.9); } }
.quiz-demo, .score-demo { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 3vmin; background: linear-gradient(135deg, #34497a, #1a1a3e); gap: 2vmin; }
.q { font-size: 2.4vmin; text-align: center; margin-bottom: 1vmin; font-weight: 600; }
.opts { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5vmin; width: 100%; }
.opt { display: flex; align-items: center; gap: 1.2vmin; padding: 1.8vmin 2vmin; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.15); border-radius: 1.4vmin; font-size: 2vmin; }
.opt.hint { border-color: #6ee7ff; box-shadow: 0 0 3vmin rgba(110, 231, 255, 0.5); }
.color-dot { width: 3vmin; height: 3vmin; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.score-badge { text-align: center; }
.score-badge .big { font-size: 8vmin; font-weight: 900; background: linear-gradient(135deg, #ffd166, #ef476f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.score-badge .lbl { font-size: 3vmin; color: #6ee7ff; }
.stats { display: flex; gap: 4vmin; }
.stats > div { text-align: center; }
.stats span { display: block; opacity: .7; font-size: 1.8vmin; margin-bottom: 0.4vmin; }
.stats b { font-size: 3vmin; }
.desc h3 { font-size: 3vmin; margin-bottom: 1.5vmin; color: #ffd166; }
.desc p { line-height: 1.7; opacity: 0.9; font-size: 2.2vmin; }
.footer { padding: 2.5vmin 4vmin; display: flex; align-items: center; gap: 1.5vmin; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.25); }
.spacer { flex: 1; }
.btn { padding: 1.6vmin 3vmin; border: 2px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.1); color: #fff; border-radius: 1.4vmin; cursor: pointer; font-size: 2.2vmin; font-weight: 600; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }
.btn.primary { background: linear-gradient(135deg, #ef476f, #ffd166); border-color: transparent; font-weight: 700; }
.btn.ghost { background: transparent; }
.fade-enter-active, .fade-leave-active { transition: all .3s; }
.fade-enter, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
