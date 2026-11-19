<template>
  <div class="dur-bg" :style="{backgroundImage:`url(${bgImage})`}">
    <div class="card">
      <h2>{{ lang==='zh'?'选择训练时长':'Select Duration' }}</h2>
      <div class="opts">
        <button v-for="m in [1,3,5]" :key="m" class="opt-btn" @click="$emit('select',m)">
          {{ m }}{{ lang==='zh'?'分钟':'min' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { bgImage } from '../../utils/images'

export default {
  props: ['lang'],
  data() { return { bgImage } },
}
</script>

<style scoped>
.dur-bg { width:100vw; height:100vh; background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; }
.card { background:rgba(0,20,60,0.78); backdrop-filter:blur(12px); border:0.2vmin solid rgba(100,200,255,0.3); border-radius:2.5vmin; padding:5vmin 7vmin; text-align:center; }
h2 { color:#7ee8ff; font-size:clamp(14px,3.5vmin,40px); margin-bottom:3vmin; }
.opts { display:flex; gap:2.5vmin; justify-content:center; }
.opt-btn { background:linear-gradient(135deg,#0077cc,#00c6ff); border:none; color:#fff; padding:2.5vmin 4vmin; border-radius:1.5vmin; font-size:clamp(13px,2.8vmin,32px); font-weight:700; cursor:pointer; transition:all 0.25s; box-shadow:0 4px 15px rgba(0,150,255,0.4); }
.opt-btn:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 8px 24px rgba(0,150,255,0.6); }
</style>
