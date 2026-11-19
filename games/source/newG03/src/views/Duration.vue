<template>
  <div class="dur-screen">
    <div class="dur-card">
      <h2>{{ t('selectDuration') }}</h2>
      <div class="dur-btns">
        <button v-for="s in options" :key="s" class="dur-btn" @click="$emit('selected', s)">
          {{ s===60 ? t('min1') : s===180 ? t('min3') : t('min5') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
import { t } from '../i18n.js'
export default {
  props: ['lang'],
  data() { return { options: [60, 180, 300] } },
  methods: { t(k) { return t(this.lang, k) } }
}
</script>

<style scoped>
.dur-screen {
  width: 100%; height: 100%;
  background: url(~@/views/game/newG03/public/images/bacground.png) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
}
.dur-card {
  background: rgba(255,255,255,0.92); border-radius: 3vmin;
  padding: 5vmin 7vmin; display: flex; flex-direction: column;
  align-items: center; gap: 4vmin;
  box-shadow: 0 1vmin 5vmin rgba(0,0,0,0.25);
}
.dur-card h2 { font-size: 4vmin; color: #1a5ca8; font-weight: 900; }
.dur-btns { display: flex; flex-direction: column; gap: 3vmin; width: 40vmin; }
.dur-btn {
  padding: 2vmin 0; font-size: 3vmin; font-weight: 700;
  background: #f5a623; color: #fff; border: none; border-radius: 4vmin;
  cursor: pointer; transition: transform 0.15s, background 0.2s;
  margin-bottom: 2.5vmin;
}
.dur-btn:last-child { margin-bottom: 0; }
.dur-btn:hover { background: #e0921a; transform: scale(1.04); }

/* ---------- Portrait (mobile / WeChat web-view) ---------- */
@media (orientation: portrait) {
  .dur-card {
    width: 84vw;
    padding: 8vmin 6vmin;
    padding-top: calc(8vmin + env(safe-area-inset-top));
    padding-bottom: calc(8vmin + env(safe-area-inset-bottom));
    border-radius: 5vmin;
    gap: 6vmin;
  }
  .dur-card h2 { font-size: max(6vmin, 22px); }
  .dur-btns { width: 100%; gap: 4vmin; }
  .dur-btn {
    padding: 3.4vmin 0;
    font-size: max(5vmin, 20px);
    border-radius: 6vmin;
  }
}
</style>
