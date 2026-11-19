<template>
  <div class="mask">
    <div class="modal">
      <div class="mhead">
        <h2>{{ t.tutorialTitle }} <span class="idx">{{ step+1 }} / {{ steps.length }}</span></h2>
        <button class="skip" @click="$emit('done')">{{ t.skip }}</button>
      </div>

      <div class="mbody">
        <div class="stage">
          <!-- 上方规则显示屏 -->
          <div class="rule-screen">
            <div class="rs-label">RULE</div>
            <div class="rs-content">
              <span v-if="step===0" class="hint">{{ t.tutorialSteps[0] }}</span>
              <span v-else>
                <span class="rp">{{ t.rulePrefix }}</span>
                <span class="chip" :style="{ background: demoBin.color }">{{ t[demoBin.key] }}</span>
                <span class="rs">{{ t.ruleSuffix }}</span>
              </span>
            </div>
          </div>

          <!-- 演示区 -->
          <div class="demo">
            <div class="conveyor">
              <div class="belt"></div>
              <div class="demo-item" :class="{ moving: step===1, dropping: step===2 }">
                <div class="di-shape" :style="{ background: demoBin.color }"></div>
              </div>
              <div v-if="step===1" class="finger">👆</div>
            </div>
            <div class="bins">
              <div class="bin" v-for="b in demoBins" :key="b.id"
                :class="{ 'bin-target': step===2 && b.id===demoBin.id, 'bin-hit': step===2 && b.id===demoBin.id }"
                :style="{ '--bg': b.color }">
                <div class="lid"></div>
                <div class="body"><span>{{ t[b.key] }}</span></div>
              </div>
            </div>
            <div v-if="step===2" class="ok-flash">✓ {{ t.correct }}</div>
          </div>

          <div class="tip">{{ t.tutorialSteps[step] }}</div>
        </div>
      </div>

      <div class="mfoot">
        <button class="btn" :disabled="step===0" @click="step--">‹ {{ t.prev }}</button>
        <div class="dots">
          <span v-for="(_,i) in steps" :key="i" :class="{ active: i===step }"></span>
        </div>
        <button v-if="step<steps.length-1" class="btn primary" @click="step++">{{ t.next }} ›</button>
        <button v-else class="btn primary" @click="$emit('done')">{{ t.startNow }} ▶</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TutorialModal',
  props: ['t'],
  data() {
    return {
      step: 0,
      steps: [0,1,2],
      demoBin: { id: 'green', key: 'binGreen', color: '#52c41a' },
      demoBins: [
        { id: 'red',   key: 'binRed',   color: '#ff4d4f' },
        { id: 'green', key: 'binGreen', color: '#52c41a' },
        { id: 'blue',  key: 'binBlue',  color: '#1890ff' }
      ],
      timer: null
    }
  },
  mounted() {
    this.timer = setInterval(() => { this.step = (this.step + 1) % 3 }, 3500)
  },
  beforeDestroy() { clearInterval(this.timer) },
  watch: {
    step() { clearInterval(this.timer); this.timer = setInterval(() => { this.step = (this.step + 1) % 3 }, 3500) }
  }
}
</script>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(3,10,22,.75); backdrop-filter: blur(10px);
  z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { width: min(760px, 94vw); max-height: 92vh; background: linear-gradient(180deg,#0e2447,#061128);
  border: 1px solid rgba(80,180,255,.35); border-radius: 20px; box-shadow: 0 30px 90px rgba(0,0,0,.6); color: #eaf4ff;
  display: flex; flex-direction: column; overflow: hidden; }
.mhead { display: flex; justify-content: space-between; align-items: center; padding: 2.2vh 3vh;
  border-bottom: 1px solid rgba(80,180,255,.2); }
.mhead h2 { margin: 0; font-size: 2.4vh; color: #7ff0ff; letter-spacing: .08em; }
.idx { margin-left: 1.2vh; font-size: 1.6vh; color: #7ea6d0; font-weight: 400; }
.skip { padding: 1vh 2vh; background: transparent; color: #a0c4e8; border: 1px solid rgba(120,200,255,.35);
  border-radius: 8px; cursor: pointer; font-size: 1.6vh; transition: .2s; }
.skip:hover { color: #fff; background: rgba(120,200,255,.15); }

.mbody { padding: 3vh 3vh 2vh; }
.stage { display: flex; flex-direction: column; gap: 2.2vh; }

.rule-screen { background: linear-gradient(180deg,#082044,#031029); border: 1px solid rgba(80,180,255,.4);
  border-radius: 14px; padding: 2vh; position: relative;
  box-shadow: 0 0 30px rgba(79,172,254,.15) inset; }
.rs-label { position: absolute; top: .8vh; left: 1.2vh; font-size: 1.2vh; letter-spacing: .3em; color: #4facfe; opacity: .8; }
.rs-content { text-align: center; font-size: 2.2vh; color: #eaf4ff; letter-spacing: .05em; }
.chip { display: inline-block; margin: 0 .6vh; padding: .4vh 1.2vh; border-radius: 8px; color: #fff; font-weight: 700;
  box-shadow: 0 6px 16px rgba(0,0,0,.3); }
.hint { color: #7ff0ff; font-style: italic; }

.demo { position: relative; padding: 2vh 0 2vh; background: rgba(255,255,255,.02); border-radius: 14px; border: 1px solid rgba(120,200,255,.1); }
.conveyor { position: relative; height: 8vh; margin: 0 3vh; background: linear-gradient(180deg,#1c3050,#0a1729);
  border-radius: 10px; overflow: hidden; border: 1px solid rgba(100,180,255,.25); }
.belt { position: absolute; inset: 20% 0; background:
  repeating-linear-gradient(90deg,#2a4a7a 0 24px,#1a3560 24px 48px); animation: slide 1.5s linear infinite; }
@keyframes slide { from { background-position: 0 0 } to { background-position: 48px 0 } }

.demo-item { position: absolute; top: 50%; left: 20%; transform: translate(-50%,-50%); width: 6vh; height: 6vh; }
.demo-item.moving { animation: move 2.5s ease-in-out; }
@keyframes move { 0% { left: 10% } 100% { left: 60% } }
.demo-item.dropping { animation: drop 1.5s ease-in forwards; }
@keyframes drop {
  0% { left: 60%; top: 50%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
  60% { left: 50%; top: 300%; opacity: 1; transform: translate(-50%,-50%) scale(.8); }
  100% { left: 50%; top: 300%; opacity: 0; transform: translate(-50%,-50%) scale(.5); }
}
.di-shape { width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 8px 20px rgba(0,0,0,.4), inset 0 -6px 10px rgba(0,0,0,.2), inset 0 6px 10px rgba(255,255,255,.3); }
.finger { position: absolute; top: 50%; left: 30%; font-size: 4vh; transform: translate(-50%,10%);
  animation: point 2.5s ease-in-out; }
@keyframes point { 0% { left: 20% } 100% { left: 60% } }

.bins { display: flex; justify-content: space-around; padding: 3vh 3vh 2vh; gap: 2vh; }
.bin { flex: 1; max-width: 120px; text-align: center; position: relative; transition: transform .3s; }
.bin-target { transform: scale(1.05); }
.bin.bin-hit .body { animation: hit .5s ease; }
@keyframes hit { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
.lid { height: 12px; background: var(--bg); border-radius: 6px 6px 2px 2px; filter: brightness(1.2);
  box-shadow: 0 4px 10px rgba(0,0,0,.3); margin: 0 -6px; }
.body { height: 8vh; background: var(--bg); border-radius: 4px 4px 10px 10px;
  display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1.7vh;
  box-shadow: 0 12px 24px rgba(0,0,0,.4), inset 0 -12px 20px rgba(0,0,0,.25); text-shadow: 0 2px 4px rgba(0,0,0,.4); }
.ok-flash { position: absolute; top: 46%; left: 50%; transform: translate(-50%,-50%);
  font-size: 3.2vh; color: #7ed957; font-weight: 900; text-shadow: 0 0 20px rgba(126,217,87,.7); animation: pop .6s ease; }
@keyframes pop { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.3) } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1) } }

.tip { text-align: center; padding: 1.6vh; font-size: 1.8vh; color: #a0c4e8; letter-spacing: .04em; }

.mfoot { display: flex; align-items: center; justify-content: space-between; padding: 2vh 3vh;
  border-top: 1px solid rgba(80,180,255,.2); }
.btn { padding: 1.3vh 2.4vh; background: rgba(255,255,255,.08); color: #eaf4ff;
  border: 1px solid rgba(120,200,255,.35); border-radius: 10px; cursor: pointer; font-size: 1.8vh; font-weight: 600; transition: .2s; }
.btn:hover:not(:disabled) { background: rgba(80,180,255,.2); }
.btn:disabled { opacity: .3; cursor: not-allowed; }
.btn.primary { background: linear-gradient(90deg,#4facfe,#00c8ff); color: #05203c; border: none; font-weight: 800;
  padding: 1.5vh 3vh; box-shadow: 0 10px 24px rgba(79,172,254,.55), 0 0 0 1px rgba(255,255,255,.25) inset; }
.btn.primary:hover:not(:disabled) { background: linear-gradient(90deg,#5ec0ff,#22d6ff);
  box-shadow: 0 14px 32px rgba(79,172,254,.7), 0 0 0 1px rgba(255,255,255,.35) inset; transform: translateY(-1px); }
.dots { display: flex; gap: 8px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(120,200,255,.3); transition: .3s; }
.dots span.active { background: #4facfe; box-shadow: 0 0 10px #4facfe; width: 24px; border-radius: 4px; }
</style>
