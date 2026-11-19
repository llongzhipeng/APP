<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2 class="modal-title">{{ t.rulesTitle }}</h2>
      <div class="rules-content">
        <p v-if="lang === 'zh'">
          <b>游戏玩法：</b>左侧显示一把挂锁，锁体上有 1–3 个形状镂空的锁孔；右侧是若干把钥匙，钥匙底部齿板上也有形状镂空。请选出齿板形状与锁孔完全一致的那把钥匙，选对后锁梁会自动弹开。<br><br>
          <b>记忆阶段：</b>每题开始时锁孔形状只显示 <b>5 秒</b>，期间钥匙隐藏为问号。5 秒后锁孔变为问号，钥匙选项才会显示，请凭记忆作答。<br><br>
          <b>形状库（共 9 种）：</b>圆形 / 正方形 / 长方形 / 三角形 / 四边形 / 菱形 / 五角星 / 六边形 / 八边形<br><br>
          <b>相似干扰：</b>难度提高时，错误选项会从相似形状中挑选（视觉上更易混淆）：<br>
          · 正方形 ↔ 长方形<br>
          · 三角形 ↔ 四边形 ↔ 菱形<br>
          · 五角星 ↔ 六边形 ↔ 八边形<br><br>
          <b>难度说明：</b><br>
          难度 1：1 个形状，2 个选项<br>
          难度 2：1 个形状，3 个选项（含相似干扰）<br>
          难度 3：2 个形状组合，3 个选项（多为相似干扰）<br>
          难度 4：2 个形状组合，4 个选项<br>
          难度 5：3 个形状组合，4 个选项<br>
          难度 6：3 个形状组合，4 个选项（仅差 1 个相似形状，最难）<br><br>
          <b>智能调难：</b>每 60 秒结算窗口期，正确率 ≥ 90% 升级，≤ 70% 降级（Lv1–Lv6）<br><br>
          <b>计分：</b>答对得分 = 5 × 难度系数（Lv1=1.0，每升一级 +0.5，最高 Lv6=3.5），答错不扣分<br><br>
          <b>结束条件：</b>倒计时归 0 时游戏结束并显示统计
        </p>
        <p v-else>
          <b>Gameplay:</b> A padlock with 1–3 shape keyholes appears on the left; keys with matching cutouts on their bits appear on the right. Pick the key whose bit exactly matches the lock — the shackle will pop open on a correct pick.<br><br>
          <b>Memorize phase:</b> Each round shows the keyholes for <b>5 seconds only</b>, with the key options hidden as question marks. After 5s the keyholes hide and the keys appear — answer from memory.<br><br>
          <b>Shape pool (9 total):</b> circle / square / rectangle / triangle / quadrilateral / diamond / 5-pt star / hexagon / octagon<br><br>
          <b>Similar distractors:</b> at higher difficulty, wrong options are drawn from visually similar shapes:<br>
          · square ↔ rectangle<br>
          · triangle ↔ quadrilateral ↔ diamond<br>
          · 5-pt star ↔ hexagon ↔ octagon<br><br>
          <b>Difficulty:</b><br>
          Lv1: 1 shape, 2 options<br>
          Lv2: 1 shape, 3 options (with similar distractors)<br>
          Lv3: 2-shape combo, 3 options (mostly similar distractors)<br>
          Lv4: 2-shape combo, 4 options<br>
          Lv5: 3-shape combo, 4 options<br>
          Lv6: 3-shape combo, 4 options (off by only 1 similar shape — hardest)<br><br>
          <b>Auto-adjust:</b> Each 60s window — ≥90% accuracy levels up, ≤70% levels down (Lv1–Lv6)<br><br>
          <b>Scoring:</b> Correct = 5 × difficulty coefficient (Lv1=1.0, +0.5/level, Lv6=3.5). Wrong = no penalty.<br><br>
          <b>End:</b> Game ends when the countdown reaches 0 and statistics are shown.
        </p>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ t.close }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/composition-api'
import messages from '../i18n.js'
const props = defineProps({ lang: String })
defineEmits(['close'])
const t = computed(() => messages[props.lang] || messages.zh)
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: linear-gradient(135deg, #1e0a3c, #2d1060);
  border: 1px solid rgba(168,85,247,0.4);
  border-radius: 2vmin;
  padding: 4vmin;
  width: min(90vw, 560px);
  max-height: 80vh;
  overflow-y: auto;
  color: #e8d5ff;
  box-shadow: 0 0 4vmin rgba(168,85,247,0.3);
}
.modal-title {
  font-size: 3vmin;
  font-weight: 800;
  color: #c084fc;
  margin-bottom: 3vmin;
  text-align: center;
}
.rules-content { font-size: 1.8vmin; line-height: 2; color: #d8c5f0; }
.close-btn {
  display: block;
  margin: 3vmin auto 0;
  padding: 1.2vmin 4vmin;
  background: linear-gradient(135deg, #6b21a8, #a855f7);
  color: #fff;
  border: none;
  border-radius: 1vmin;
  font-size: 2vmin;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.close-btn:hover { opacity: 0.85; }
</style>
