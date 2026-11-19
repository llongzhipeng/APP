<template>
  <div class="duration">
    <button class="back-btn" @click="$emit('back')">
      <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      <span>{{ t('back') }}</span>
    </button>

    <div class="content">
      <h1>{{ t('chooseDuration') }}</h1>
      <p class="subtitle">{{ lang==='zh' ? '选择你的训练时长' : 'Pick your training duration' }}</p>

      <div class="cards">
        <button v-for="opt in options" :key="opt.value"
                class="card"
                :class="{ active: selected === opt.value }"
                @click="selected = opt.value">
          <div class="card-value">{{ opt.label }}</div>
          <div class="check" v-if="selected===opt.value">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
        </button>
      </div>

      <button class="start-btn" :disabled="!selected" @click="startGame">
        <span>{{ t('startGame') }}</span>
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
import { i18n, t } from '../i18n.js'
export default {
  name: 'DurationSelect',
  data() { return { selected: 60 } },
  computed: {
    lang() { return i18n.lang },
    options() {
      const zh = i18n.lang === 'zh'
      return [
        { value: 60,  label: zh?'1 分钟':'1 Minute'   },
        { value: 180, label: zh?'3 分钟':'3 Minutes'  },
        { value: 300, label: zh?'5 分钟':'5 Minutes'  }
      ]
    }
  },
  methods: {
    t,
    startGame() {
      if (this.selected) this.$emit('start', this.selected)
    }
  }
}
</script>

<style scoped>
.duration {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0b1020 60%, #05070f 100%);
  display: flex; flex-direction: column;
  padding: 3vmin 4vmin;
}
.back-btn {
  align-self: flex-start;
  display: flex; align-items: center; gap: 1vmin;
  padding: 1.4vmin 2.4vmin; border-radius: 999px;
  background: rgba(255,255,255,0.08); color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 2vmin;
}
.back-btn svg { width: 2.4vmin; height: 2.4vmin; min-width: 18px; min-height: 18px; }
.back-btn:hover { background: rgba(255,255,255,0.15); }

.content {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4vmin;
}
h1 {
  font-size: 6vmin; font-weight: 800;
  background: linear-gradient(90deg, #fff, #fbbf24);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle {
  font-size: 2.4vmin; color: rgba(255,255,255,0.6);
  letter-spacing: 0.1em;
}

.cards {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 4vmin;
  width: 100%; max-width: 130vmin;
}
.card {
  position: relative;
  padding: 8vmin 3vmin; border-radius: 3vmin;
  background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 2px solid rgba(255,255,255,0.1);
  color: #fff; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.card:hover { transform: translateY(-1vmin); border-color: rgba(251, 191, 36, 0.4); }
.card.active {
  background: linear-gradient(160deg, rgba(251, 191, 36, 0.15), rgba(239, 68, 68, 0.1));
  border-color: #fbbf24;
  box-shadow: 0 15px 40px rgba(251, 191, 36, 0.3);
  transform: translateY(-0.6vmin);
}
.card-value { font-size: 5vmin; font-weight: 800; letter-spacing: 0.05em; }
.check {
  position: absolute; top: 1.5vmin; right: 1.5vmin;
  width: 4vmin; height: 4vmin; min-width: 28px; min-height: 28px; border-radius: 50%;
  background: #fbbf24; color: #000;
  display: flex; align-items: center; justify-content: center;
  animation: pop 0.3s ease;
}
.check svg { width: 2.4vmin; height: 2.4vmin; min-width: 16px; min-height: 16px; }
@keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

.start-btn {
  display: flex; align-items: center; gap: 1.5vmin;
  padding: 2.2vmin 5vmin; border-radius: 999px; border: 0;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff; font-size: 3vmin; font-weight: 700;
  box-shadow: 0 15px 40px rgba(239, 68, 68, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.05em;
}
.start-btn svg { width: 3vmin; height: 3vmin; min-width: 20px; min-height: 20px; }
.start-btn:hover:not(:disabled) { transform: translateY(-0.6vmin); box-shadow: 0 20px 50px rgba(239,68,68,0.6); }
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 600px) {
  .cards { grid-template-columns: 1fr; }
}
</style>
