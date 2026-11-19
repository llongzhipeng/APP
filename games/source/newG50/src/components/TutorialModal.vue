<template>
  <div class="tutorial-overlay">
    <div class="tutorial-card">
      <div class="tut-head">
        <div class="tut-title">{{ t('tutorialTitle') }}</div>
        <div class="tut-step">{{ t('tutorialStep', {current: step+1, total: steps.length}) }}</div>
      </div>

      <div class="tut-body">
        <div class="tut-heading">{{ t(current.titleKey) }}</div>
        <div class="tut-hint">{{ current.mode === 'input' ? t('hintType') : t('hintPick') }}</div>

        <!-- Idiom demo -->
        <div class="idiom-row">
          <div
            v-for="(ch, i) in idiomChars"
            :key="i"
            class="idiom-tile"
            :class="{
              blank: isBlank(i) && !isFilled(i),
              focus: isBlank(i) && animPhase === 1 && current.blanks.indexOf(i) === current.blanks.findIndex(b => !filled[b]),
              correct: isBlank(i) && isFilled(i)
            }"
          >
            <template v-if="isBlank(i) && !isFilled(i)">
              <span class="dash"></span>
            </template>
            <template v-else>{{ isBlank(i) ? filled[i] : ch }}</template>
          </div>
        </div>

        <!-- Choices (for pick mode) -->
        <div v-if="current.mode === 'pick'" class="choices">
          <div
            v-for="(c, i) in current.choices"
            :key="i"
            class="choice"
            :class="{
              highlight: highlightChoice === i,
              rightChoice: highlightChoice === i && current.answers.includes(c)
            }"
          >{{ c }}</div>
        </div>

        <!-- Keyboard input demo -->
        <div v-else class="input-demo">
          <div class="fake-input">
            <span class="typed">{{ typedText }}</span>
            <span v-if="!typedText" class="caret">|</span>
          </div>
          <div class="input-tip">{{ t('hintType') }}</div>
        </div>

        <div class="example-tag">{{ t('example') }}</div>
      </div>

      <div class="tut-foot">
        <button class="mini-btn" @click="prev" :disabled="step === 0">{{ t('prev') }}</button>
        <button class="mini-btn skip" @click="$emit('skip')">{{ t('skip') }}</button>
        <button class="mini-btn primary" @click="next">
          {{ step === steps.length - 1 ? t('startNow') : t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../data/i18n.js'

export default {
  name: 'TutorialScreen',
  props: ['lang'],
  data() {
    return {
      step: 0,
      animPhase: 0,
      highlightChoice: -1,
      filled: {},
      typedText: '',
      timer: null,
      steps: [
        {
          mode: 'pick', titleKey: 'tut1Title',
          idiom: '一心一意', blanks: [3], answers: ['意'],
          choices: ['意', '思']
        },
        {
          mode: 'pick', titleKey: 'tut2Title',
          idiom: '五颜六色', blanks: [1], answers: ['颜'],
          choices: ['眼', '颜', '光']
        },
        {
          mode: 'pick', titleKey: 'tut3Title',
          idiom: '守株待兔', blanks: [1, 3], answers: ['株', '兔'],
          choices: ['株', '兔', '木', '狗']
        },
        {
          mode: 'input', titleKey: 'tut4Title',
          idiom: '画蛇添足', blanks: [2, 3], answers: ['添', '足'],
          choices: []
        }
      ]
    }
  },
  computed: {
    current() { return this.steps[this.step] },
    idiomChars() { return this.current.idiom.split('') }
  },
  methods: {
    t(k, p) { return t(this.lang, k, p) },
    isBlank(i) { return this.current.blanks.includes(i) },
    isFilled(i) { return this.filled[i] != null },
    resetAnim() {
      this.animPhase = 0
      this.highlightChoice = -1
      this.filled = {}
      this.typedText = ''
    },
    startAnim() {
      this.resetAnim()
      const s = this.current
      if (s.mode === 'input') {
        // 输入模式: 逐字打字
        this.timer = setTimeout(() => {
          const ans = s.answers.join('')
          let i = 0
          const typeStep = () => {
            if (i < ans.length) {
              this.typedText = ans.slice(0, i + 1)
              i++
              this.timer = setTimeout(typeStep, 600)
            } else {
              // 填入成语
              this.timer = setTimeout(() => {
                s.blanks.forEach((b, idx) => { this.$set(this.filled, b, s.answers[idx]) })
                this.scheduleLoop()
              }, 700)
            }
          }
          typeStep()
        }, 600)
        return
      }
      // pick 模式: 依次高亮每个正确答案并填入
      let ansIdx = 0
      const doNext = () => {
        if (ansIdx >= s.answers.length) { this.scheduleLoop(); return }
        this.animPhase = 1
        const target = s.answers[ansIdx]
        const cIdx = s.choices.indexOf(target)
        this.timer = setTimeout(() => {
          this.highlightChoice = cIdx
          this.timer = setTimeout(() => {
            this.$set(this.filled, s.blanks[ansIdx], target)
            this.highlightChoice = -1
            ansIdx++
            doNext()
          }, 700)
        }, 700)
      }
      doNext()
    },
    scheduleLoop() {
      this.timer = setTimeout(() => this.startAnim(), 2200)
    },
    next() {
      if (this.step === this.steps.length - 1) this.$emit('done')
      else this.step++
    },
    prev() { if (this.step > 0) this.step-- }
  },
  watch: {
    step() { clearTimeout(this.timer); this.startAnim() }
  },
  mounted() { this.startAnim() },
  beforeDestroy() { clearTimeout(this.timer) }
}
</script>

<style scoped>
.tutorial-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #f6f2ea 0%, #e8ddc8 100%);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
  padding: 4vmin;
}
.tutorial-card {
  width: 78vmin;
  max-height: 92vmin;
  background: #fdf9f0;
  border-radius: 3vmin;
  border: 0.3vmin solid #b08b4f;
  padding: 4vmin;
  display: flex; flex-direction: column;
  box-shadow: 0 1.5vmin 4vmin rgba(122,90,44,.25);
}
.tut-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 3vmin;
  padding-bottom: 2vmin;
  border-bottom: 0.15vmin dashed #d0b48a;
}
.tut-title { font-size: 3.2vmin; font-weight: 700; color: #7a3a1e; letter-spacing: 0.2vmin; }
.tut-step {
  font-size: 2vmin;
  color: #fff;
  background: linear-gradient(135deg, #d97742, #b04e1e);
  padding: 0.6vmin 1.6vmin;
  border-radius: 2vmin;
  font-weight: 600;
}
.tut-body {
  flex: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: 2vmin;
  padding: 2vmin 0;
  position: relative;
}
.tut-heading { font-size: 3vmin; font-weight: 700; color: #7a3a1e; }
.tut-hint { font-size: 2.3vmin; color: #8a6a3a; }
.idiom-row { display: flex; gap: 1.5vmin; margin: 2vmin 0; }
.idiom-tile {
  width: 11vmin; height: 11vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 1.5vmin;
  font-size: 6vmin; font-weight: 700;
  color: #333;
  transition: all .35s;
  font-family: 'STSong', 'Noto Serif SC', serif;
}
.idiom-tile.blank {
  background: #fff8ec;
  border-style: dashed;
  border-color: #b08b4f;
}
.idiom-tile.blank .dash {
  display: block;
  width: 50%; height: 0.4vmin;
  background: #b08b4f;
  border-radius: 0.2vmin;
  opacity: .6;
}
.idiom-tile.focus {
  border-color: #d97742;
  border-style: solid;
  box-shadow: 0 0 0 0.5vmin rgba(217,119,66,.25);
  transform: translateY(-0.5vmin);
}
.idiom-tile.correct {
  background: #e0f5df;
  border-color: #58a058;
  color: #2b7a2b;
  border-style: solid;
}

.choices { display: flex; gap: 2vmin; margin-top: 1vmin; flex-wrap: wrap; justify-content: center; }
.choice {
  width: 9vmin; height: 9vmin;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 0.3vmin solid #d0b48a;
  border-radius: 1.2vmin;
  font-size: 4.5vmin; font-weight: 700;
  color: #333;
  transition: all .3s;
  font-family: 'STSong', 'Noto Serif SC', serif;
}
.choice.highlight {
  transform: scale(1.12);
  box-shadow: 0 0 0 0.5vmin rgba(255,180,60,.6);
  border-color: #d97742;
}
.choice.rightChoice { background: #e0f5df; border-color: #58a058; color: #2b7a2b; }

.input-demo { display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; margin-top: 1vmin; }
.fake-input {
  width: 22vmin; height: 8vmin;
  background: #fff;
  border: 0.3vmin solid #b08b4f;
  border-radius: 1vmin;
  display: flex; align-items: center; justify-content: center;
  font-size: 5vmin; font-weight: 700;
  color: #2b7a2b;
  font-family: 'STSong', serif;
}
.caret { color: #999; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }
.input-tip { font-size: 2vmin; color: #888; }

.example-tag {
  position: absolute; top: 0; right: 0;
  background: #b08b4f; color: #fff;
  padding: 0.5vmin 1.5vmin;
  border-radius: 1vmin;
  font-size: 1.8vmin;
  font-weight: 600;
}

.tut-foot {
  display: flex; justify-content: space-between; margin-top: 2vmin; gap: 1.5vmin;
  padding-top: 2vmin;
  border-top: 0.15vmin dashed #d0b48a;
}
.mini-btn {
  flex: 1;
  padding: 1.6vmin 2vmin;
  font-size: 2.2vmin;
  background: #fff;
  border: 0.25vmin solid #b08b4f;
  border-radius: 1.2vmin;
  color: #7a5a2c;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
}
.mini-btn:hover:not(:disabled) { background: #fff8ec; }
.mini-btn:disabled { opacity: .4; cursor: not-allowed; }
.mini-btn.skip { color: #888; border-color: #ccc; }
.mini-btn.primary { background: linear-gradient(135deg, #d97742, #b04e1e); color: #fff; border-color: #a34418; }
.mini-btn.primary:hover { background: linear-gradient(135deg, #e28855, #bd5a24); }
</style>
