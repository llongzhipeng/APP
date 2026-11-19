<template>
  <div class="mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="head">
        <h2>📖 {{ t.ruleTitle }}</h2>
        <button class="close" @click="$emit('close')">✕</button>
      </div>
      <div class="body">
        <div class="rule" v-for="(r, i) in t.ruleContent" :key="i">
          <div class="num">{{ i + 1 }}</div>
          <div class="text">{{ r }}</div>
        </div>
        <div class="tbl-wrap">
          <div class="tbl-title">▬ 难度分级 / DIFFICULTY LEVELS ▬</div>
          <table>
            <thead><tr>
              <th>{{ t.level }}</th><th>网格 / Grid</th><th>颜色 / Colors</th>
              <th>目标 / Targets</th><th>时间 / Time</th><th>系数 / Coef</th>
            </tr></thead>
            <tbody>
              <tr v-for="d in diff" :key="d.level" :class="'lv-'+d.level">
                <td><span class="badge">Lv.{{ d.level }}</span></td>
                <td>{{ d.gridR }} × {{ d.gridC }}</td>
                <td>{{ d.colors }}</td>
                <td>{{ d.targetCount }}</td>
                <td>{{ d.maxTime }}{{ t.seconds }}</td>
                <td><b>×{{ d.coef }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="foot">
        <button class="btn primary" @click="$emit('close')">{{ t.back }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { DIFFICULTY } from '../utils/config'
export default { name: 'RulesModal', props: ['t'], data() { return { diff: DIFFICULTY } } }
</script>

<style scoped>
.mask {
  position: fixed; inset: 0; z-index: 100;
  background: radial-gradient(ellipse at center, rgba(20,5,15,.85), rgba(0,0,0,.95));
  backdrop-filter: blur(1vmin);
  display: flex; align-items: center; justify-content: center; padding: 3vmin;
}
.modal {
  width: min(92vw, 100vmin); max-height: 92vh;
  background: linear-gradient(160deg, #241028, #150818);
  border: 0.3vmin solid rgba(255,60,80,.35);
  border-radius: 2.5vmin; color: #fff;
  box-shadow: 0 3vmin 8vmin rgba(0,0,0,.7);
  display: flex; flex-direction: column; overflow: hidden;
}
.head {
  padding: 2.5vmin 3.5vmin;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 0.15vmin solid rgba(255,255,255,.08);
  background: linear-gradient(180deg, rgba(255,60,80,.12), transparent);
}
.head h2 { font-size: 3.4vmin; letter-spacing: 0.3vmin; font-weight: 900; }
.close {
  width: 4vmin; height: 4vmin; border-radius: 50%; border: none;
  background: rgba(255,255,255,.1); color: #fff; cursor: pointer; font-size: 2vmin;
  display: flex; align-items: center; justify-content: center;
}
.close:hover { background: #ff3b4c; }
.body { padding: 2.5vmin 3.5vmin; overflow: auto; flex: 1; }
.rule {
  display: flex; gap: 2vmin; align-items: flex-start; padding: 1.5vmin 0;
  border-bottom: 0.1vmin solid rgba(255,255,255,.05);
}
.num {
  min-width: 4vmin; height: 4vmin; border-radius: 50%;
  background: linear-gradient(135deg, #ff3b4c, #b8102a);
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 2vmin;
  box-shadow: 0 0.5vmin 1vmin rgba(255,60,80,.4);
}
.text { color: rgba(255,255,255,.85); line-height: 1.7; font-size: 2vmin; padding-top: 0.3vmin; }
.tbl-wrap { margin-top: 3vmin; }
.tbl-title { color: #ff8a99; letter-spacing: 0.4vmin; font-size: 1.8vmin; text-align: center; margin-bottom: 1.5vmin; font-weight: 800; }
table { width: 100%; border-collapse: collapse; font-size: 1.9vmin;
  background: rgba(0,0,0,.25); border-radius: 1.2vmin; overflow: hidden;
}
th, td { padding: 1.4vmin 1vmin; text-align: center; }
thead { background: linear-gradient(180deg, rgba(255,60,80,.2), rgba(255,60,80,.08));
  color: #fff; font-weight: 800; letter-spacing: 0.2vmin;
}
tbody tr { border-top: 0.1vmin solid rgba(255,255,255,.05); transition: background .2s; }
tbody tr:hover { background: rgba(255,255,255,.04); }
.badge {
  display: inline-block; padding: 0.4vmin 1.2vmin;
  background: linear-gradient(135deg, #ff3b4c, #b8102a);
  border-radius: 99px; font-weight: 800; font-size: 1.6vmin;
}
tbody td b { color: #ffd166; font-size: 2.2vmin; }
.foot { padding: 2vmin 3.5vmin; text-align: right; border-top: 0.15vmin solid rgba(255,255,255,.08); }
.btn {
  padding: 1.6vmin 4vmin; border-radius: 1vmin; border: 0.2vmin solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.06); color: #fff; cursor: pointer;
  font-size: 2.2vmin; font-weight: 700; letter-spacing: 0.3vmin;
}
.btn.primary { background: linear-gradient(135deg, #ff3b4c, #b8102a); border-color: transparent;
  box-shadow: 0 0.8vmin 2vmin rgba(255,60,80,.4); }
.btn:hover { transform: translateY(-0.2vmin); }
</style>
