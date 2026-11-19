<template>
  <div class="home">
    <div class="lang-btn-wrap">
      <button class="lang-btn" @click="$emit('toggle-lang')">
        {{ lang === 'zh' ? 'EN' : '中文' }}
      </button>
    </div>
    <div class="hero">
      <h1 class="title">{{ t.title }}</h1>
      <p class="subtitle">{{ t.subtitle }}</p>
    </div>
    <div class="menu">
      <button class="menu-btn primary" @click="$emit('start')">{{ t.start }}</button>
      <button class="menu-btn" @click="showRules = true">{{ t.rules }}</button>
      <button class="menu-btn" @click="showHistory = true">{{ t.history }}</button>
    </div>

    <div v-if="showRules" class="modal-mask" @click.self="showRules = false">
      <div class="modal">
        <h2>{{ t.rules }}</h2>
        <ul class="rules-list">
          <li v-for="(line, i) in t.rulesContent" :key="i">{{ line }}</li>
        </ul>
        <div class="modal-footer">
          <button class="menu-btn primary" @click="showRules = false">{{ t.yes }}</button>
        </div>
      </div>
    </div>

    <div v-if="showHistory" class="modal-mask" @click.self="showHistory = false">
      <div class="modal wide">
        <h2>{{ t.history }}</h2>
        <div v-if="!records.length" class="empty">{{ t.noHistory }}</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t.th.time }}</th><th>{{ t.th.project }}</th><th>{{ t.th.level }}</th>
                <th>{{ t.th.duration }}</th><th>{{ t.th.total }}</th><th>{{ t.th.succeed }}</th>
                <th>{{ t.th.fail }}</th><th>{{ t.th.rate }}</th>
                <th>{{ t.th.avg }}</th><th>{{ t.th.score }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in records" :key="i">
                <td :data-label="t.th.time">{{ r.time }}</td>
                <td :data-label="t.th.project">{{ t.projectName }}</td>
                <td :data-label="t.th.level">{{ r.level }}</td>
                <td :data-label="t.th.duration">{{ r.duration }}{{ t.sec }}</td>
                <td :data-label="t.th.total">{{ r.total }}</td>
                <td :data-label="t.th.succeed">{{ r.success }}</td>
                <td :data-label="t.th.fail">{{ r.fail }}</td>
                <td :data-label="t.th.rate">{{ r.rate }}%</td>
                <td :data-label="t.th.avg">{{ r.avgReact }}{{ t.ms }}</td>
                <td :data-label="t.th.score">{{ r.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="menu-btn primary" @click="showHistory = false">{{ t.yes }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: { t: Object, lang: String, records: Array },
  data: () => ({ showRules: false, showHistory: false }),
}
</script>

<style scoped>
.home {
  position: relative;
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(circle at 30% 20%, #3a2a6b 0%, #1a1140 60%, #0a0820 100%);
  color: #fff;
}
.lang-btn-wrap { position: absolute; top: 2vmin; right: 2vmin; }
.lang-btn {
  padding: 1vmin 2vmin; font-size: 2vmin; border-radius: 1vmin;
  background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3);
  cursor: pointer;
}
.lang-btn:hover { background: rgba(255,255,255,.25); }
.hero { text-align: center; margin-bottom: 6vmin; }
.title {
  font-size: 8vmin; letter-spacing: .4vmin;
  background: linear-gradient(180deg, #ffe9a8, #d4a341);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 .3vmin 1vmin rgba(0,0,0,.5);
}
.subtitle { margin-top: 1vmin; font-size: 2.6vmin; opacity: .8; }
.menu { display: flex; flex-direction: column; gap: 2vmin; }
.menu-btn {
  min-width: 28vmin; padding: 2vmin 4vmin; font-size: 2.4vmin;
  border-radius: 1.5vmin; border: 1px solid rgba(255,255,255,.3);
  background: rgba(255,255,255,.1); color: #fff; cursor: pointer;
  transition: transform .15s, background .15s;
}
.menu-btn:hover { transform: translateY(-.4vmin); background: rgba(255,255,255,.2); }
.menu-btn.primary {
  background: linear-gradient(180deg, #f6c04a, #c98212); border-color: #f6c04a;
  color: #2a1a05; font-weight: bold;
}

.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #1f1850; border: 1px solid #5d4cae; border-radius: 2vmin;
  padding: 3vmin 4vmin; min-width: 50vmin; max-width: 90vmin; color: #fff;
  box-shadow: 0 1vmin 3vmin rgba(0,0,0,.5);
}
.modal.wide { min-width: 80vmin; }
.modal h2 { font-size: 3vmin; margin-bottom: 2vmin; text-align: center; }
.rules-list { list-style: none; padding: 0; }
.rules-list li { padding: 1vmin 0; font-size: 2.2vmin; border-bottom: 1px dashed rgba(255,255,255,.15); }
.modal-footer { margin-top: 2vmin; display: flex; justify-content: center; }
.table-wrap { max-height: 50vh; overflow: auto; }
table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
th, td { padding: 1vmin; border-bottom: 1px solid rgba(255,255,255,.2); text-align: center; }
th { background: rgba(255,255,255,.1); }
.empty { text-align: center; padding: 4vmin; opacity: .7; }

@media (orientation: portrait) {
  .lang-btn-wrap {
    top: calc(2vmin + env(safe-area-inset-top));
    right: calc(2vmin + env(safe-area-inset-right));
  }
  .lang-btn {
    padding: 10px 16px; font-size: max(3.2vmin, 15px); border-radius: 12px;
  }
  .hero { margin-bottom: 8vmin; padding: 0 4vmin; }
  .title { font-size: max(10vmin, 32px); }
  .subtitle { font-size: max(4vmin, 16px); }
  .menu { width: 80%; gap: 3vmin; }
  .menu-btn {
    width: 100%; min-width: 0;
    padding: 18px 24px;
    font-size: max(4.5vmin, 18px);
    border-radius: 16px;
  }
  .modal {
    min-width: 0; width: 90vw; max-width: 90vw;
    padding: 5vmin 4vmin;
    max-height: 85vh; overflow: auto;
  }
  .modal.wide { min-width: 0; width: 92vw; max-width: 92vw; }
  .modal h2 { font-size: max(4.5vmin, 20px); }
  .rules-list li { font-size: max(3.6vmin, 15px); padding: 1.6vmin 0; }
  .modal-footer { padding-bottom: env(safe-area-inset-bottom); }
  /* Table → card style */
  .table-wrap { max-height: 60vh; }
  table, thead, tbody, tr, th, td { display: block; width: 100%; }
  thead { display: none; }
  tbody tr {
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 12px;
    margin-bottom: 12px; padding: 10px 12px;
  }
  tbody td {
    border: none; text-align: left; padding: 4px 0;
    font-size: max(3.4vmin, 14px);
    display: flex; justify-content: space-between; gap: 8px;
  }
  tbody td::before {
    content: attr(data-label);
    opacity: .7; margin-right: 8px;
  }
}
</style>
