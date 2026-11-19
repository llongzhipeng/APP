<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-title">{{ t('rulesTitle') }}</div>
      <div class="rules-body">
        <p v-for="(line, i) in t('rulesBody')" :key="i">{{ line }}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lv</th><th>Red</th><th>Gray</th><th>Speed</th><th>×</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in levels" :key="l.lv">
                <td>{{ l.lv }}</td><td>{{ l.r }}</td><td>{{ l.g }}</td><td>{{ l.s }}</td><td>{{ l.c }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <button class="btn primary" @click="$emit('close')">{{ t('close') }}</button>
    </div>
  </div>
</template>
<script>
import { t, store } from '../i18n'
export default {
  name: 'RulesModal',
  computed: {
    levels () {
      const S = store.lang === 'zh'
        ? ['慢','慢','中等','中等','较快','较快']
        : ['Slow','Slow','Mid','Mid','Fast','Fast']
      const rows = [
        [1,3,1,S[0],1],[2,4,2,S[1],1.5],[3,5,2,S[2],2],
        [4,6,3,S[3],2.5],[5,7,3,S[4],3],[6,8,4,S[5],3.5],
      ]
      return rows.map(r => ({ lv:r[0], r:r[1], g:r[2], s:r[3], c:r[4] }))
    },
  },
  methods: { t },
}
</script>
<style scoped>
@import './modal.css';
.rules-body p { color: #d0dae5; line-height: 1.9; font-size: 1.9vmin; }
.table-wrap { margin-top: 2vh; }
table { width: 100%; border-collapse: collapse; color: #e6efff; font-size: 1.8vmin; }
th, td { padding: 1vmin 1.4vmin; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
th { color: rgba(200, 220, 240, 0.7); font-weight: 500; font-size: 1.5vmin; text-transform: uppercase; letter-spacing: 0.12vmin; }
</style>
