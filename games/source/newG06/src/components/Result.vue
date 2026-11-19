<template>
  <div class="result-mask">
    <div class="panel">
      <h2>{{ t.result }}</h2>
      <div class="stats">
        <div class="stat"><span>{{ t.totalScore }}</span><b>{{ record.score }}</b></div>
        <div class="stat"><span>{{ t.totalRounds }}</span><b>{{ record.total }}</b></div>
        <div class="stat"><span>{{ t.succeed }}</span><b>{{ record.success }}</b></div>
        <div class="stat"><span>{{ t.fail }}</span><b>{{ record.fail }}</b></div>
        <div class="stat"><span>{{ t.successRate }}</span><b>{{ record.rate }}%</b></div>
        <div class="stat"><span>{{ t.avgReact }}</span><b>{{ record.avgReact }}{{ t.ms }}</b></div>
      </div>
      <button class="menu-btn primary" @click="$emit('home')">{{ t.backHome }}</button>
    </div>
  </div>
</template>

<script>
export default { name: 'Result', props: { t: Object, record: Object } }
</script>

<style scoped>
.result-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.8);
  display: flex; align-items: center; justify-content: center; z-index: 250;
}
.panel {
  background: #1f1850; border: 1px solid #5d4cae; border-radius: 2vmin;
  padding: 4vmin 6vmin; color: #fff; text-align: center; min-width: 60vmin;
}
.panel h2 {
  font-size: 4vmin; margin-bottom: 3vmin;
  background: linear-gradient(180deg, #ffe9a8, #d4a341);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2vmin;
  margin-bottom: 3vmin;
}
.stat {
  display: flex; flex-direction: column; gap: .5vmin;
  background: rgba(255,255,255,.08); border-radius: 1vmin; padding: 1.5vmin;
}
.stat span { font-size: 1.8vmin; opacity: .8; }
.stat b { font-size: 2.6vmin; color: #f6c04a; }
.menu-btn {
  padding: 2vmin 4vmin; font-size: 2.4vmin; border-radius: 1.5vmin;
  border: none; cursor: pointer;
  background: linear-gradient(180deg, #f6c04a, #c98212); color: #2a1a05; font-weight: bold;
}

@media (orientation: portrait) {
  .panel {
    width: 92vw; max-width: 92vw; min-width: 0;
    padding: 6vmin 5vmin;
    padding-top: calc(6vmin + env(safe-area-inset-top));
    padding-bottom: calc(6vmin + env(safe-area-inset-bottom));
  }
  .panel h2 { font-size: max(6vmin, 24px); margin-bottom: 4vmin; }
  .stats { grid-template-columns: repeat(2, 1fr); gap: 3vmin; }
  .stat { padding: 2.5vmin; border-radius: 12px; }
  .stat span { font-size: max(3.2vmin, 13px); }
  .stat b { font-size: max(5vmin, 20px); }
  .menu-btn {
    width: 80%;
    padding: 18px 24px;
    font-size: max(5vmin, 18px);
    border-radius: 14px;
  }
}
</style>
