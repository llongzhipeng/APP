<template>
  <div class="mask" @mousedown.self="$emit('close')">
    <div class="modal">
      <div class="mhead">
        <h2>{{ t.rulesTitle }}</h2>
        <button class="x" @click="$emit('close')">✕</button>
      </div>
      <div class="mbody">
        <div class="badge">
          <div class="dot"></div>
          <span>{{ t.appTitle }}</span>
        </div>
        <ol class="rules">
          <li v-for="(r,i) in t.rulesText" :key="i"><span class="num">{{ i+1 }}</span>{{ r }}</li>
        </ol>
        <div class="grid">
          <div class="card" v-for="(d,i) in diffTable" :key="i" :style="{ '--c': d.color }">
            <div class="lv">{{ (t.difficulty || 'L') }} {{ d.level }}</div>
            <div class="row"><span>{{ zh ? '桶数' : 'Bins' }}</span><b>{{ d.bins }}</b></div>
            <div class="row"><span>{{ zh ? '速度' : 'Speed' }}</span><b>{{ d.speed }}</b></div>
            <div class="row"><span>{{ zh ? '系数' : 'Factor' }}</span><b>×{{ d.factor }}</b></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RulesModal',
  props: ['t','lang'],
  computed: {
    zh() { return this.lang === 'zh' },
    diffTable() {
      const zh = this.zh
      return [
        { level: 1, bins: 2, speed: zh?'慢':'Slow',   factor: 1,   color: '#4facfe' },
        { level: 2, bins: 3, speed: zh?'中':'Medium', factor: 1.5, color: '#00f2fe' },
        { level: 3, bins: 4, speed: zh?'快':'Fast',   factor: 2,   color: '#7ed957' },
        { level: 4, bins: 2, speed: zh?'慢':'Slow',   factor: 2.5, color: '#ffd453' },
        { level: 5, bins: 2, speed: zh?'中':'Medium', factor: 3,   color: '#ff8a5b' },
        { level: 6, bins: 2, speed: zh?'快':'Fast',   factor: 3.5, color: '#b37feb' }
      ]
    }
  }
}
</script>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(3, 10, 22, .72); backdrop-filter: blur(8px);
  z-index: 100; display: flex; align-items: center; justify-content: center; animation: fade .2s ease; }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
.modal { width: min(720px, 92vw); max-height: 88vh; overflow: hidden; background: linear-gradient(180deg,#0e2447 0%,#061128 100%);
  border: 1px solid rgba(80,180,255,.35); border-radius: 20px; box-shadow: 0 30px 90px rgba(0,0,0,.6); color: #eaf4ff;
  display: flex; flex-direction: column; animation: pop .3s cubic-bezier(.2,.9,.3,1.2); }
@keyframes pop { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: scale(1) } }
.mhead { display: flex; align-items: center; justify-content: space-between; padding: 2.5vh 3vh;
  border-bottom: 1px solid rgba(80,180,255,.15); }
.mhead h2 { margin: 0; font-size: 2.6vh; letter-spacing: .08em; color: #7ff0ff; }
.x { width: 4vh; height: 4vh; min-width: 34px; min-height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.06); color: #eaf4ff; cursor: pointer; font-size: 1.6vh; }
.x:hover { background: rgba(255,80,80,.2); border-color: #ff6b6b; }
.mbody { padding: 2.5vh 3vh; overflow-y: auto; }
.badge { display: inline-flex; align-items: center; gap: 8px; padding: .6vh 1.4vh; border-radius: 999px;
  background: rgba(79,172,254,.15); border: 1px solid rgba(79,172,254,.4); font-size: 1.6vh; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #4facfe; box-shadow: 0 0 12px #4facfe; }

.rules { list-style: none; padding: 0; margin: 2vh 0; }
.rules li { display: flex; gap: 1.5vh; align-items: flex-start; padding: 1.4vh 0;
  border-bottom: 1px dashed rgba(120,200,255,.15); font-size: 1.9vh; line-height: 1.55; }
.num { flex: 0 0 auto; width: 3vh; height: 3vh; min-width: 28px; min-height: 28px; border-radius: 50%;
  background: linear-gradient(135deg,#4facfe,#00f2fe); color: #05203c; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center; font-size: 1.6vh; }

.grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 1.5vh; margin-top: 1vh; }
.card { padding: 1.6vh; border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  border: 1px solid rgba(120,200,255,.2); position: relative; overflow: hidden; }
.card::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 3px; background: var(--c); box-shadow: 0 0 20px var(--c); }
.lv { font-size: 1.6vh; letter-spacing: .1em; color: var(--c); font-weight: 700; margin-bottom: 1vh; }
.row { display: flex; justify-content: space-between; padding: .5vh 0; font-size: 1.6vh; color: #b0cde8; }
.row b { color: #eaf4ff; font-weight: 700; }
</style>
