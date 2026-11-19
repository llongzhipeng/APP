<template>
  <div class="overlay">
    <div class="box">
      <div class="step-indicator">{{ step+1 }} / {{ steps.length }}</div>
      <div class="demo">
        <div class="circles-row">
          <div v-for="(c,i) in steps[step].circles" :key="i" class="circle" :class="{blank:c.blank, highlight:c.highlight}">
            <img v-if="!c.blank" :src="c.img" />
            <span v-else class="q">?</span>
          </div>
        </div>
        <div class="arrow">↓</div>
        <div class="options-row">
          <div v-for="(o,i) in steps[step].options" :key="i" class="opt" :class="{correct:o.correct, wrong:o.wrong}" @click="selectOpt(i)">
            <img :src="o.img" />
          </div>
        </div>
        <div class="hint">{{ lang==='zh' ? steps[step].hintZh : steps[step].hintEn }}</div>
      </div>
      <div class="nav">
        <button class="nav-btn" :disabled="step===0" @click="step--">{{ lang==='zh'?'上一步':'Prev' }}</button>
        <button class="skip-btn" @click="$emit('skip')">{{ lang==='zh'?'跳过':'Skip' }}</button>
        <button class="nav-btn" v-if="step<steps.length-1" @click="step++">{{ lang==='zh'?'下一步':'Next' }}</button>
        <button class="nav-btn done" v-else @click="$emit('done')">{{ lang==='zh'?'开始':'Start' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { animalImage } from '../../utils/images'

const ANIMALS = ['fishi','sea_horse','starfish','sea_turtle','hirm']

function img(type, n) { return animalImage(type, n) }

export default {
  props: ['lang'],
  data() {
    return {
      step: 0,
      steps: [
        {
          // Step 1: show pattern ABAB, blank at position 4 = B
          circles: [
            {img:img('fishi',1)},{img:img('sea_horse',1)},{img:img('fishi',2)},{blank:true,highlight:true}
          ],
          options: [{img:img('fishi',1),wrong:false},{img:img('sea_horse',1),correct:true},{img:img('starfish',1),wrong:false}],
          hintZh:'观察规律：鱼→海马→鱼→？',
          hintEn:'Pattern: fish→seahorse→fish→?'
        },
        {
          // Step 2: ABCABC, blank at position 6 = C
          circles: [
            {img:img('fishi',1)},{img:img('sea_horse',1)},{img:img('starfish',1)},
            {img:img('fishi',2)},{img:img('sea_horse',2)},{blank:true,highlight:true}
          ],
          options: [{img:img('fishi',1),wrong:false},{img:img('sea_horse',1),wrong:false},{img:img('starfish',1),correct:true}],
          hintZh:'三种动物循环出现，找出空白处',
          hintEn:'3 animals cycle — find the blank'
        },
        {
          // Step 3: blank in middle
          circles: [
            {img:img('fishi',1)},{img:img('sea_horse',1)},{blank:true,highlight:true},
            {img:img('fishi',2)},{img:img('sea_horse',2)},{img:img('starfish',2)}
          ],
          options: [{img:img('starfish',1),correct:true},{img:img('fishi',1),wrong:false},{img:img('sea_turtle',1),wrong:false}],
          hintZh:'空白可能在中间，同样按规律推断',
          hintEn:'Blank can be in the middle — same logic'
        }
      ]
    }
  },
  methods: {
    selectOpt(i) {
      const opts = this.steps[this.step].options
      opts.forEach((o,j) => { o.wrong = false; o.correct = j===i ? o.correct : false })
      if (!opts[i].correct) opts[i].wrong = true
    }
  }
}
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,10,30,0.88); display:flex; align-items:center; justify-content:center; z-index:300; }
.box { background:linear-gradient(160deg,#001a3a,#002a5a); border:0.2vmin solid rgba(100,200,255,0.4); border-radius:2.5vmin; padding:4vmin 5vmin; max-width:70vmin; width:95%; display:flex; flex-direction:column; gap:2.5vmin; align-items:center; }
.step-indicator { color:rgba(100,200,255,0.7); font-size:clamp(10px,1.8vmin,18px); }
.demo { display:flex; flex-direction:column; align-items:center; gap:1.5vmin; width:100%; }
.circles-row { display:flex; gap:1.2vmin; flex-wrap:wrap; justify-content:center; }
.circle { width:8vmin; height:8vmin; border-radius:50%; border:0.3vmin solid rgba(100,200,255,0.5); background:rgba(0,40,80,0.6); display:flex; align-items:center; justify-content:center; overflow:hidden; }
.circle.highlight { border-color:#ffd700; box-shadow:0 0 1.5vmin rgba(255,215,0,0.6); }
.circle img { width:80%; height:80%; object-fit:contain; }
.q { color:#ffd700; font-size:3vmin; font-weight:900; }
.arrow { color:rgba(100,200,255,0.6); font-size:3vmin; }
.options-row { display:flex; gap:2vmin; justify-content:center; }
.opt { width:9vmin; height:9vmin; border-radius:1.2vmin; border:0.3vmin solid rgba(100,200,255,0.4); background:rgba(0,40,80,0.6); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; overflow:hidden; }
.opt:hover { border-color:#7ee8ff; transform:scale(1.05); }
.opt.correct { border-color:#22c55e; background:rgba(34,197,94,0.2); box-shadow:0 0 1.5vmin rgba(34,197,94,0.5); }
.opt.wrong { border-color:#ef4444; background:rgba(239,68,68,0.2); }
.opt img { width:80%; height:80%; object-fit:contain; }
.hint { color:#b0e8ff; font-size:clamp(10px,1.8vmin,20px); text-align:center; }
.nav { display:flex; gap:2vmin; align-items:center; }
.nav-btn { background:linear-gradient(135deg,#0077cc,#00c6ff); border:none; color:#fff; padding:1.2vmin 3vmin; border-radius:1vmin; font-size:clamp(11px,2vmin,22px); cursor:pointer; transition:all 0.2s; }
.nav-btn:disabled { opacity:0.35; cursor:default; }
.nav-btn:not(:disabled):hover { transform:translateY(-2px); }
.nav-btn.done { background:linear-gradient(135deg,#16a34a,#22c55e); }
.skip-btn { background:transparent; border:0.2vmin solid rgba(100,200,255,0.4); color:rgba(150,210,255,0.7); padding:1.2vmin 2.5vmin; border-radius:1vmin; font-size:clamp(10px,1.8vmin,20px); cursor:pointer; }
.skip-btn:hover { border-color:#7ee8ff; color:#7ee8ff; }
</style>
