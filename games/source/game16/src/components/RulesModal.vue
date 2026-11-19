<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="box">
      <h2>{{ lang==='zh'?'游戏规则':'Game Rules' }}</h2>
      <ul>
        <li v-for="r in (lang==='zh'?rulesZh:rulesEn)" :key="r">{{ r }}</li>
      </ul>
      <button class="close-btn" @click="$emit('close')">{{ lang==='zh'?'关闭':'Close' }}</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['lang'],
  data() {
    return {
      rulesZh: [
        '屏幕显示10个连续圆圈，每个圆圈内有海洋动物图案',
        '部分圆圈为空白，根据规律推断空白处的动物',
        '从选项中选择正确答案，答完自动跳转下一题',
        '难度1-2：2种动物；难度3-4：3种；难度5-6：4种',
        '每60秒统计正确率，90%以上升级，70%以下降级',
        '答对得分 = 5 × 难度系数'
      ],
      rulesEn: [
        '10 circles shown, each with a sea creature pattern',
        'Some circles are blank — deduce the missing animal',
        'Select the correct answer; auto-advances to next question',
        'Level 1-2: 2 types; Level 3-4: 3 types; Level 5-6: 4 types',
        'Every 60s: >90% accuracy = level up, <70% = level down',
        'Score per correct = 5 × difficulty coefficient'
      ]
    }
  }
}
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:200; }
.box { background:linear-gradient(160deg,#001a3a,#002a5a); border:0.2vmin solid rgba(100,200,255,0.4); border-radius:2vmin; padding:4vmin 5vmin; max-width:60vmin; width:90%; }
h2 { color:#7ee8ff; font-size:clamp(14px,3vmin,34px); margin-bottom:2.5vmin; text-align:center; }
ul { list-style:none; display:flex; flex-direction:column; gap:1.2vmin; margin-bottom:3vmin; }
li { color:#b0e8ff; font-size:clamp(10px,1.8vmin,20px); padding-left:1.5vmin; border-left:0.3vmin solid #00c6ff; }
.close-btn { display:block; margin:0 auto; background:linear-gradient(135deg,#0077cc,#00c6ff); border:none; color:#fff; padding:1.2vmin 4vmin; border-radius:1vmin; font-size:clamp(11px,2vmin,22px); cursor:pointer; }
.close-btn:hover { opacity:0.85; }
</style>
