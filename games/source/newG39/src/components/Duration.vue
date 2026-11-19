<template>
  <div class="duration">
    <div class="card panel">
      <button class="back" @click="$emit('back')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        {{ t('back') }}
      </button>
      <h2>{{ t('chooseDuration') }}</h2>
      <div class="options">
        <button v-for="o in options" :key="o.sec"
                class="opt" :class="{active: sel===o.sec}" @click="sel=o.sec">
          <div class="opt-num">{{ o.n }}</div>
          <div class="opt-unit">{{ o.label }}</div>
        </button>
      </div>
      <button class="btn go" @click="$emit('start', sel)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        {{ t('startGame') }}
      </button>
    </div>
  </div>
</template>

<script>
import { store, t } from '../store'
export default {
  data () { return { store, sel: 60 } },
  computed: {
    t () { const _ = this.store.lang; return t },
    options () {
      const _ = this.store.lang
      return [
        { sec: 60,  n: '1', label: t('min1').replace('1','').trim() },
        { sec: 180, n: '3', label: t('min3').replace('3','').trim() },
        { sec: 300, n: '5', label: t('min5').replace('5','').trim() }
      ]
    }
  }
}
</script>

<style scoped>
.duration { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 4vmin; }
.panel { padding: 6vmin 7vmin; text-align: center; width: min(90vmin, 96vw); position: relative; }
.back { position: absolute; top: 3vmin; left: 3vmin; padding: 1.2vmin 2.2vmin; border-radius: 999px; color:#fff; background: rgba(255,255,255,.1); display: inline-flex; align-items: center; gap: .8vmin; font-size: 2vmin; font-weight: 700; }
.back:hover { background: rgba(255,255,255,.2); }
.back svg { width: 2.2vmin; height: 2.2vmin; }
h2 { font-size: 4vmin; margin-bottom: 5vmin; letter-spacing: .06em; }
.options { display: grid; grid-template-columns: repeat(3,1fr); gap: 2.6vmin; margin-bottom: 5vmin; }
.opt {
  padding: 5vmin 1.2vmin 3.6vmin;
  border-radius: 2.4vmin;
  background: linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  border: 3px solid rgba(255,255,255,.12);
  color: #fff; transition: .2s;
  cursor: pointer;
}
.opt:hover { transform: translateY(-6px); border-color: rgba(236,72,153,.5); }
.opt.active { border-color: #ec4899; background: linear-gradient(160deg, rgba(236,72,153,.25), rgba(236,72,153,.05)); box-shadow: 0 20px 44px -14px rgba(236,72,153,.55); }
.opt-num { font-size: 9vmin; font-weight: 900; line-height: 1; background: linear-gradient(135deg,#fde68a,#fbcfe8); -webkit-background-clip: text; background-clip: text; color: transparent; }
.opt-unit { font-size: 2.6vmin; letter-spacing: .2em; margin-top: 1.4vmin; color: #e2e8f0; font-weight: 700; }
.go { width: 100%; padding: 1.2em; font-size: 2.8vmin; }
.go svg { margin-right: .5em; width: 1.1em; height: 1.1em; }
</style>
