<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <div class="modal-title">{{ t('rulesTitle') }}</div>
      <div class="modal-body">
        <ul class="rule-list">
          <li v-for="(line, i) in t('rulesContent')" :key="i">
            <span class="dot"/>
            <span>{{ line }}</span>
          </li>
        </ul>

        <div class="tbl-title">{{ t('difficultyTable') }}</div>
        <div class="tbl-wrap">
          <div class="tbl">
            <div class="th">
              <div v-for="(h,i) in t('diffColHead')" :key="i">{{ h }}</div>
            </div>
            <div class="tr" v-for="(row,ri) in t('diffRows')" :key="ri">
              <div v-for="(c,ci) in row" :key="ci">
                <span v-if="ci===0" class="badge" :class="'b'+row[0]">{{ c }}</span>
                <span v-else>{{ c }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="ok-btn" @click="$emit('close')">{{ t('close') }}</button>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default { name: 'Rules', methods: { t } }
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(74,58,30,0.35); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  font-size: 1em;
}
.modal-card {
  width: min(48em, 90vw); max-height: 85vh; overflow-y: auto;
  padding: 2em;
  background: #fff8e8;
  border: 1px solid #d9c9a3;
  border-radius: 1.2em;
  box-shadow: 0 1em 3em rgba(74,58,30,.2);
  color: #3a2f1f;
  position: relative;
}
.close-btn {
  position: absolute; top: 1em; right: 1em;
  width: 2em; height: 2em; border-radius: 50%;
  background: #f6efe0; border: 1px solid #d9c9a3; color: #6b5a3a; font-size: 0.95em; cursor: pointer;
  transition: all .2s;
}
.close-btn:hover { background: #e8c8b8; color: #7a1f10; }

.modal-title {
  font-size: 1.7em; font-weight: 700; letter-spacing: 0.15em;
  color: #4a3a1e;
  margin-bottom: 1.2em;
}

.modal-body { font-size: 1em; line-height: 1.7; }
.rule-list { list-style: none; padding: 0; margin: 0 0 1.4em 0; }
.rule-list li { display: flex; gap: 0.7em; margin-bottom: 0.7em; color: #4a3a1e; }
.dot { flex-shrink: 0; width: 0.5em; height: 0.5em; border-radius: 50%; background: #c99a4b; margin-top: 0.7em; }

.tbl-title { font-size: 1.2em; font-weight: 700; color: #4a3a1e; margin: 1em 0 0.8em; letter-spacing: 0.1em; }
.tbl-wrap { border-radius: 0.7em; overflow: hidden; border: 1px solid #d9c9a3; }
.tbl { display: grid; grid-template-columns: 1fr; }
.th, .tr { display: grid; grid-template-columns: 1.2fr 1.4fr 1.4fr 1.4fr; gap: 0; }
.th { background: #f6e6c1; font-weight: 700; color: #4a3a1e; letter-spacing: 0.06em; }
.th > div, .tr > div { padding: 0.75em 1em; color: #4a3a1e; }
.tr { border-top: 1px solid #e5d5ad; }
.badge {
  display: inline-block; width: 2em; text-align: center;
  border-radius: 999px; padding: 0.1em 0;
  color: #fff; font-weight: 700;
}
.b1 { background: #6b8e5a; }
.b2 { background: #8ba86e; }
.b3 { background: #c99a4b; }
.b4 { background: #b98738; }
.b5 { background: #a1683a; }
.b6 { background: #7a4a2a; }

.ok-btn {
  display: block; margin: 1.5em auto 0;
  padding: 0.8em 2.6em;
  background: #c99a4b;
  border: none; border-radius: 999px;
  color: #fff; font-weight: 600; letter-spacing: 0.15em; font-size: 1.05em;
  cursor: pointer;
  transition: background .2s;
}
.ok-btn:hover { background: #b98738; }
</style>
