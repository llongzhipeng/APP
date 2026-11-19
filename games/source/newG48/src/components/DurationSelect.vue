<template>
  <div class="duration">
    <button class="back-btn" @click="$emit('back')">{{ t('back') }}</button>

    <div class="content">
      <h1>{{ t('chooseDuration') }}</h1>
      <p class="subtitle">{{ t('chooseDurationSub') }}</p>

      <div class="cards">
        <button v-for="opt in options" :key="opt.value"
                class="card"
                :class="{ active: selected === opt.value }"
                @click="selected = opt.value">
          <div class="card-value">{{ opt.label }}</div>
        </button>
      </div>

      <button class="start-btn" :disabled="!selected" @click="startGame">{{ t('startNow') }}</button>
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
    startGame() { if (this.selected) this.$emit('start', this.selected) }
  }
}
</script>

<style scoped>
.duration {
  position: absolute; inset: 0;
  background: #faf6ef;
  display: flex; flex-direction: column;
  padding: 3vmin 4vmin;
  color: #2c2721;
}
.back-btn {
  align-self: flex-start;
  padding: 1.4vmin 2.8vmin; border-radius: 999px;
  background: #ffffff; color: #2c2721;
  border: 1px solid #e5ddce;
  font-size: 2.4vmin;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 0.4vmin 1.2vmin rgba(122,90,44,.1);
}
.back-btn:hover { border-color: #d97757; color: #d97757; }

.content {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5vmin;
}
h1 {
  font-size: 6.5vmin; font-weight: 800;
  color: #2c2721;
  letter-spacing: 0.04em;
}
.subtitle {
  font-size: 2.6vmin; color: #7a7266;
  letter-spacing: 0.15em;
  margin-top: -3vmin;
}

.cards {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 3.5vmin;
  width: 100%; max-width: 120vmin;
  margin-top: 2vmin;
}
.card {
  padding: 9vmin 2vmin; border-radius: 2.4vmin;
  background: #ffffff;
  border: 0.3vmin solid #f0eadf;
  color: #2c2721; cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  min-height: 22vmin;
  box-shadow: 0 0.6vmin 1.6vmin rgba(122,90,44,.08);
}
.card:hover { border-color: #d97757; transform: translateY(-0.5vmin); }
.card.active {
  background: #fdf2ea;
  border-color: #d97757;
  color: #d97757;
  box-shadow: 0 0.8vmin 2vmin rgba(217,119,87,.2);
}
.card-value { font-size: 5vmin; font-weight: 700; letter-spacing: 0.03em; }

.start-btn {
  padding: 2.4vmin 6vmin;
  border-radius: 999px; border: 0;
  background: #d97757;
  color: #fff;
  font-size: 3.2vmin;
  font-weight: 600;
  transition: all 0.2s ease;
  letter-spacing: 0.05em;
  margin-top: 2vmin;
  box-shadow: 0 0.8vmin 2vmin rgba(217,119,87,.25);
}
.start-btn:hover:not(:disabled) { background: #c5674a; transform: translateY(-0.4vmin); }
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 600px) {
  .cards { grid-template-columns: 1fr; }
}
</style>
