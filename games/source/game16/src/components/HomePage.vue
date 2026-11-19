<template>
  <div class="home" :style="{backgroundImage:`url(${bgImage})`}">
    <button class="lang-btn" @click="$emit('toggleLang')">{{ lang==='zh'?'EN':'中文' }}</button>
    <div class="card">
      <h1 class="title">{{ t.title }}</h1>
      <p class="subtitle">{{ t.subtitle }}</p>
      <div class="btns">
        <button class="btn-primary" @click="$emit('start')">{{ t.start }}</button>
        <button class="btn-secondary" @click="$emit('rules')">{{ t.rules }}</button>
        <button class="btn-secondary" @click="$emit('history')">{{ t.history }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { bgImage } from '../../utils/images'

const I18N = {
  zh: { title:'图形推理', subtitle:'抽象维度 · 海洋探索', start:'开始游戏', rules:'规则介绍', history:'历史记录' },
  en: { title:'Pattern Reasoning', subtitle:'Abstract Dimension · Ocean', start:'Start Game', rules:'Rules', history:'History' }
}
export default {
  props: ['lang'],
  data() { return { bgImage } },
  computed: { t() { return I18N[this.lang] } }
}
</script>

<style scoped>
.home { width:100vw; height:100vh; background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; position:relative; }
.lang-btn { position:absolute; top:2vmin; right:2vmin; background:rgba(255,255,255,0.2); border:0.2vmin solid rgba(255,255,255,0.5); color:#fff; padding:0.8vmin 1.6vmin; border-radius:1vmin; font-size:1.8vmin; cursor:pointer; backdrop-filter:blur(6px); }
.lang-btn:hover { background:rgba(255,255,255,0.35); }
.card { background:rgba(0,20,60,0.72); backdrop-filter:blur(12px); border:0.2vmin solid rgba(100,200,255,0.3); border-radius:2.5vmin; padding:5vmin 6vmin; text-align:center; min-width:36vmin; }
.title { color:#7ee8ff; font-size:clamp(18px,4.5vmin,52px); font-weight:900; margin-bottom:1vmin; text-shadow:0 0 2vmin rgba(100,220,255,0.6); }
.subtitle { color:rgba(180,230,255,0.8); font-size:clamp(10px,2vmin,22px); margin-bottom:4vmin; }
.btns { display:flex; flex-direction:column; gap:1.8vmin; }
.btn-primary { background:linear-gradient(135deg,#0077cc,#00c6ff); border:none; color:#fff; padding:1.8vmin; border-radius:1.2vmin; font-size:clamp(12px,2.2vmin,24px); font-weight:700; cursor:pointer; transition:all 0.25s; box-shadow:0 4px 15px rgba(0,150,255,0.4); }
.btn-primary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 6px 20px rgba(0,150,255,0.6); }
.btn-secondary { background:rgba(255,255,255,0.1); border:0.2vmin solid rgba(100,200,255,0.4); color:#b0e8ff; padding:1.4vmin; border-radius:1.2vmin; font-size:clamp(11px,2vmin,22px); cursor:pointer; transition:all 0.25s; }
.btn-secondary:hover { background:rgba(100,200,255,0.2); transform:translateY(-1px); }
</style>
