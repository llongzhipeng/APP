<template>
  <div class="tutorial">
    <div class="overlay"></div>
    <div class="modal">
      <div class="hdr">
        <h3>{{ t('tutorialTitle') }} <span class="step">{{ step+1 }} / 4</span></h3>
        <button class="skip" @click="$emit('skip')">{{ t('skip') }}</button>
      </div>

      <div class="demo">
        <!-- Mini classroom preview -->
        <div class="mini-board">
          <!-- Step 1: order — show numbers in shapes, highlight target arrow -->
          <template v-if="step === 0">
            <Shape kind="circle"   :n="3" :hi="tick===0" style="left:15%;top:28%" />
            <Shape kind="square"   :n="7" :hi="tick===1" style="left:45%;top:18%" />
            <Shape kind="triangle" :n="5" :hi="tick===2" style="left:75%;top:30%" />
          </template>

          <template v-else-if="step === 1">
            <Shape kind="triangle" :n="2" style="left:15%;top:30%" />
            <Shape kind="circle"   :n="6" :hi="tick%2===0" style="left:45%;top:18%" />
            <Shape kind="square"   :n="4" style="left:75%;top:30%" />
          </template>

          <template v-else-if="step === 2">
            <Shape kind="triangle" :n="8" :bad="tick%2===0" style="left:15%;top:30%" />
            <Shape kind="circle"   :n="1" :hi="tick%2===0" style="left:45%;top:18%" />
            <Shape kind="square"   :n="9" :hi="tick%2===0" style="left:75%;top:30%" />
          </template>

          <template v-else>
            <Shape kind="circle"   :n="4" style="left:20%;top:28%" />
            <Shape kind="square"   :n="2" style="left:60%;top:25%" />
            <div class="bird">
              <svg viewBox="0 0 64 32" width="100%" height="100%">
                <path fill="#111" d="M2 20 Q16 4 32 16 Q48 4 62 20 Q48 12 32 22 Q16 12 2 20 Z"/>
              </svg>
            </div>
          </template>
        </div>
        <!-- Caption outside board to avoid overlap with shapes -->
        <div class="caption">
          <template v-if="step === 0">{{ t('tutorialStep1') }}<br/><span>{{ t('tutorialStep1Desc') }}</span></template>
          <template v-else-if="step === 1">{{ t('tutorialStep2') }}<br/><span>{{ t('tutorialStep2Desc') }}</span></template>
          <template v-else-if="step === 2">{{ t('tutorialStep3') }}<br/><span>{{ t('tutorialStep3Desc') }}</span></template>
          <template v-else>{{ t('tutorialStep4') }}<br/><span>{{ t('tutorialStep4Desc') }}</span></template>
        </div>
        <!-- Mini keyboard -->
        <div class="mini-kb">
          <button v-for="n in 10" :key="n-1" :class="{tap: kbTap===n-1}">{{ n-1 }}</button>
        </div>
      </div>

      <div class="dots">
        <span v-for="i in 4" :key="i" :class="{on: step === i-1}"></span>
      </div>

      <div class="foot">
        <button class="btn btn-secondary" :disabled="step===0" @click="prev">{{ t('prev') }}</button>
        <button class="btn btn-primary" @click="next">{{ step===3 ? t('startNow') : t('next') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n'

/**
 * <summary>
 * 教程用迷你形状（SVG）
 * </summary>
 */
const Shape = {
  props: ['kind', 'n', 'hi', 'bad'],
  render(h) {
    const stroke = this.bad ? '#ff6b6b' : (this.hi ? '#ffd76a' : '#f5f5f5') // 描边色
    const glow = this.hi ? 'drop-shadow(0 0 12px #ffd76a)' : (this.bad ? 'drop-shadow(0 0 10px #ff6b6b)' : 'none') // 高亮滤镜
    const baseStyle = {
      position: 'absolute',
      width: '8vmin',
      height: '8vmin',
      filter: glow,
    }
    const posStyle = (this.$vnode.data && this.$vnode.data.staticStyle) || {}
    let el
    if (this.kind === 'circle')
      el = h('circle', { attrs: { cx: 32, cy: 32, r: 28, fill: 'none', stroke, 'stroke-width': 3 } })
    else if (this.kind === 'square')
      el = h('rect', { attrs: { x: 4, y: 4, width: 56, height: 56, rx: 4, fill: 'none', stroke, 'stroke-width': 3 } })
    else
      el = h('polygon', { attrs: { points: '32,4 60,58 4,58', fill: 'none', stroke, 'stroke-width': 3 } })
    const txt = h('text', {
      attrs: {
        x: 32, y: 40, 'text-anchor': 'middle', fill: '#fff',
        'font-size': 26, 'font-weight': 700, 'font-family': 'inherit',
      },
    }, [String(this.n)])
    return h('div', {
      class: 'shape',
      style: Object.assign({}, baseStyle, posStyle),
    }, [
      h('svg', { attrs: { viewBox: '0 0 64 64', width: '100%', height: '100%' } }, [el, txt]),
    ])
  },
}

export default {
  mixins: [i18nMixin],
  components: { Shape },
  data() { return { step: 0, tick: 0, kbTap: 0, timer: null } },
  mounted() {
    this.timer = setInterval(() => {
      this.tick = (this.tick + 1) % 3
      this.kbTap = (this.kbTap + 1) % 10
    }, 800)
  },
  beforeDestroy() { clearInterval(this.timer) },
  methods: {
    next() { this.step === 3 ? this.$emit('done') : this.step++ },
    prev() { if (this.step > 0) this.step-- },
  },
}
</script>

<style scoped>
.tutorial {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at top, #1a2436 0%, #0b1018 55%, #06090e 100%);
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: none;
}
.modal {
  position: relative;
  z-index: 1;
  width: min(70vmin, 92vw);
  max-height: 92vh;
  overflow: auto;
  background: linear-gradient(180deg, #1c2331 0%, #141822 100%);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 2.5vmin;
  padding: 4vmin;
  box-shadow: 0 3rem 6rem rgba(0,0,0,.5);
}
.hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5vmin; }
h3 { font-size: 3.2vmin; color: #fff; font-weight: 800; }
.step { font-size: 2vmin; color: #ffb347; margin-left: .5em; font-weight: 600; }
.skip { color: rgba(255,255,255,.6); font-size: 2vmin; font-weight: 600; padding: 1vmin 2vmin; border-radius: 999px; }
.skip:hover { color: #fff; background: rgba(255,255,255,.08); }

.demo {
  background: linear-gradient(180deg, #1e4633 0%, #0f2a1e 100%);
  border-radius: 1.5vmin;
  padding: 2vmin;
  border: 0.6vmin solid #6b4a1e;
  box-shadow: inset 0 0 40px rgba(0,0,0,.4);
}
.mini-board {
  position: relative;
  height: 28vmin;
  min-height: 140px;
  border-radius: .5rem;
  overflow: hidden;
}
.caption {
  position: relative;
  margin-top: 1.5vmin;
  text-align: center;
  color: #d5efd7;
  font-family: 'Comic Sans MS', 'PingFang SC', cursive;
  font-size: 2.2vmin;
  font-weight: 600;
  line-height: 1.45;
  min-height: 6vmin;
}
.caption span { color: rgba(255,255,255,.6); font-size: 1.8vmin; font-weight: 400; }

.bird {
  position: absolute; top: 20%; left: -10%; width: 8vmin; height: 4vmin;
  animation: fly 3s linear infinite;
  z-index: 1;
}
@keyframes fly {
  0% { left: -10%; transform: translateY(0); }
  50% { transform: translateY(-2vmin); }
  100% { left: 110%; transform: translateY(0); }
}

.mini-kb {
  display: grid; grid-template-columns: repeat(10, 1fr); gap: .8vmin;
  margin-top: 2vmin;
}
.mini-kb button {
  aspect-ratio: 1;
  border-radius: 1vmin;
  background: linear-gradient(180deg, #f5efdc, #e0d5b8);
  color: #4a3a1a; font-weight: 800; font-size: 2.4vmin;
  box-shadow: 0 .4vmin 0 rgba(0,0,0,.3);
  transition: all .1s;
  border: none;
  cursor: default;
}
.mini-kb button.tap {
  transform: translateY(.2vmin); box-shadow: 0 .1vmin 0 rgba(0,0,0,.3);
  background: linear-gradient(180deg, #ffd76a, #f5b93a);
}

.dots { display: flex; justify-content: center; gap: 1vmin; margin: 2.5vmin 0; }
.dots span {
  width: 1.2vmin; height: 1.2vmin; border-radius: 50%;
  background: rgba(255,255,255,.18); transition: all .3s;
}
.dots span.on { background: #ffb347; width: 3.5vmin; border-radius: 999px; }

.foot { display: flex; justify-content: space-between; gap: 2vmin; }
.foot .btn { flex: 1; font-size: 2.2vmin; padding: 1.6vmin 2vmin; font-weight: 700; }
.foot .btn:disabled { opacity: .4; cursor: not-allowed; }
</style>
