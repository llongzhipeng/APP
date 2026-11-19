<template>
  <div class="rules">
    <button class="back" @click="$emit('back')">
      <svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/></svg>
      {{ t('back') }}
    </button>
    <div class="panel">
      <h2>{{ t('rulesTitle') }}</h2>
      <ol>
        <li v-for="(r,i) in t('rulesBody')" :key="i">{{ r }}</li>
      </ol>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>{{ t('difficulty') }}</th><th>{{ lang==='zh' ? '干扰项' : 'Interference' }}</th><th>{{ lang==='zh' ? '最长答题(秒)' : 'Max Time (s)' }}</th><th>{{ lang==='zh' ? '难度系数' : 'Coef' }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r,lv) in rows" :key="lv">
              <td><span class="lv" :data-lv="lv+1">{{ lv+1 }}</span></td>
              <td>{{ r.interferer ? (lang==='zh' ? '飞鸟飞过' : 'Bird flying') : (lang==='zh' ? '无' : 'None') }}</td>
              <td>{{ r.maxTime }}</td>
              <td>× {{ r.coef }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nMixin } from '../i18n'
import { LEVELS } from '../game'
export default {
  mixins: [i18nMixin],
  computed: { rows() { return [1,2,3,4,5,6].map(l => LEVELS[l]) } },
}
</script>

<style scoped>
.rules {
  position: relative; width: 100%; height: 100%; overflow: auto;
  background: radial-gradient(ellipse at top, #1a2436 0%, #0b1018 55%, #06090e 100%);
  padding: 4rem 2rem 2rem;
}
.back {
  position: absolute; top: 1.5rem; left: 1.5rem;
  display: inline-flex; align-items: center; gap: .4em;
  padding: .6em 1.2em; border-radius: 999px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: #fff;
}
.back:hover { background: rgba(255,255,255,.16); }
.panel {
  max-width: 55rem; margin: 0 auto;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
  border-radius: 1.5rem; padding: 2.5rem;
  backdrop-filter: blur(20px);
}
h2 { font-size: 2rem; margin-bottom: 1.5rem; color: #ffb347; }
ol { padding-left: 1.5rem; }
li { padding: .5rem 0; line-height: 1.7; color: rgba(255,255,255,.85); }
.table-wrap { margin-top: 2rem; overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0; }
th, td { padding: .8rem 1rem; text-align: center; }
th { background: rgba(255,255,255,.06); color: rgba(255,255,255,.7); font-weight: 600; }
tbody tr:nth-child(odd) td { background: rgba(255,255,255,.02); }
tbody tr:hover td { background: rgba(255,179,71,.08); }
.lv {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2em; height: 2em; border-radius: 50%; font-weight: 700;
  background: linear-gradient(135deg, #ffb347, #ff7a3d); color: #fff;
}
</style>
