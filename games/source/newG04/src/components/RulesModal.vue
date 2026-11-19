<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ T.rulesTitle }}</h2>
      <ul class="rules-list">
        <li v-for="(r,i) in T.rulesContent" :key="i">{{ r }}</li>
      </ul>
      <table class="diff-table">
        <thead><tr><th v-for="h in T.diffTable" :key="h">{{ h }}</th></tr></thead>
        <tbody>
          <tr v-for="l in levels" :key="l.level">
            <td>{{ l.level }}</td><td>{{ l.blocks }}</td><td>{{ l.colors }}</td>
            <td>{{ l.memTime }}s</td><td>{{ l.coeff }}</td>
          </tr>
        </tbody>
      </table>
      <button class="btn-close" @click="$emit('close')">{{ T.close }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { LEVELS } from '../gameConfig.js'
export default {
  props: ['lang'],
  computed: { T() { return t[this.lang] }, levels() { return LEVELS } },
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #16213e; border-radius: 2vmin; padding: 3vmin 4vmin;
  max-width: 80vmin; width: 90vw; max-height: 90vh; overflow-y: auto;
  display: flex; flex-direction: column; gap: 2vmin;
}
h2 { font-size: 3vmin; color: #7eb8f7; text-align: center; }
.rules-list { padding-left: 3vmin; }
.rules-list li { font-size: 1.8vmin; line-height: 2.4; color: #c5d8f5; }
.diff-table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
.diff-table th, .diff-table td { border: 1px solid #2a3f6f; padding: 1vmin; text-align: center; }
.diff-table th { background: #1e2f5a; color: #7eb8f7; }
.diff-table td { color: #c5d8f5; }
.btn-close {
  align-self: center; background: #3a7bd5; color: #fff;
  padding: 1.2vmin 4vmin; border-radius: 1.2vmin; font-size: 2vmin; font-weight: 600;
}
.btn-close:hover { background: #4e8fe0; }

/* ===== Portrait (mobile / WeChat web-view) ===== */
@media (orientation: portrait) {
  .modal {
    width: 92vw; max-width: 92vw;
    padding: 5vw 5vw;
    border-radius: 4vw;
    gap: 4vw;
  }
  h2 { font-size: max(6vw, 22px); }
  .rules-list { padding-left: 5vw; }
  .rules-list li { font-size: max(3.8vw, 14px); line-height: 1.7; margin-bottom: 2vw; }

  /* Turn the difficulty table into stacked cards */
  .diff-table, .diff-table thead, .diff-table tbody,
  .diff-table tr, .diff-table th, .diff-table td { display: block; }
  .diff-table thead { display: none; }
  .diff-table tr {
    border: 1px solid #2a3f6f; border-radius: 3vw;
    padding: 3vw 4vw; margin-bottom: 2.5vw;
    background: rgba(255,255,255,.03);
  }
  .diff-table td {
    border: none; padding: 1.4vw 0; text-align: left;
    display: flex; justify-content: space-between;
    font-size: max(3.8vw, 14px);
  }
  .diff-table td:nth-child(1)::before { content: '#'; color: #7a9abc; margin-right: 2vw; }
  .btn-close {
    padding: max(3vw, 12px) max(8vw, 32px);
    border-radius: 3vw;
    font-size: max(4.4vw, 16px);
  }
}
</style>
