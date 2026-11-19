<template>
  <div class="duration">
    <button class="back" @click="$emit('back')">
      <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/></svg>
      {{ t('back') }}
    </button>
    <div class="content">
      <h2>{{ t('selectDuration') }}</h2>
      <div class="cards">
        <button v-for="d in choices" :key="d.sec" class="card" :class="{active: sel===d.sec}" @click="sel=d.sec">
          <div class="num">{{ d.n }}</div>
          <div class="unit">min</div>
          <div class="label">{{ t(d.k) }}</div>
        </button>
      </div>
      <button class="btn btn-primary go" :disabled="!sel" @click="$emit('select', sel)">
        {{ t('startNow') }}
        <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n'
export default {
  mixins: [i18nMixin],
  data() { return { sel: 60, choices: [
    { sec: 60,  n: 1, k: 'min1' },
    { sec: 180, n: 3, k: 'min3' },
    { sec: 300, n: 5, k: 'min5' },
  ]}},
}
</script>

<style scoped>
.duration {
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at top, #1a2436 0%, #0b1018 55%, #06090e 100%);
}
.back {
  position: absolute; top: 3vmin; left: 3vmin;
  display: inline-flex; align-items: center; gap: .5em;
  padding: 1.4vmin 2.4vmin; border-radius: 999px;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); color: #fff;
  font-size: 2.2vmin; font-weight: 700;
}
.back:hover { background: rgba(255,255,255,.2); }
.content { text-align: center; padding: 4vmin; max-width: 92vw; }
h2 {
  font-size: 6vmin; margin-bottom: 6vmin;
  background: linear-gradient(180deg, #fff, #ffb347);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  font-weight: 900;
}
.cards { display: flex; gap: 3vmin; justify-content: center; margin-bottom: 5vmin; flex-wrap: wrap; }
.card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 20vmin; height: 20vmin; border-radius: 2.5vmin;
  background: rgba(255,255,255,.05); border: 3px solid rgba(255,255,255,.12);
  color: #fff; transition: all .25s ease;
}
.card:hover { transform: translateY(-6px); background: rgba(255,255,255,.1); border-color: rgba(255,179,71,.5); }
.card.active {
  background: linear-gradient(135deg, rgba(255,179,71,.25), rgba(255,122,61,.18));
  border-color: #ffb347; box-shadow: 0 1.5vmin 3.5vmin rgba(255,179,71,.4);
}
.num { font-size: 8vmin; font-weight: 900; line-height: 1;
  background: linear-gradient(180deg, #fff, #ffb347);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.unit { font-size: 2vmin; color: rgba(255,255,255,.6); margin-top: -.4em; letter-spacing: .2em; }
.label { margin-top: 2vmin; font-weight: 700; font-size: 2.4vmin; letter-spacing: .05em; }
.go { font-size: 2.6vmin; padding: 1.8vmin 5vmin; font-weight: 800; }
.go:disabled { opacity: .5; cursor: not-allowed; }
</style>
