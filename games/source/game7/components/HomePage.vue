<template>
  <div class="home-page">
    <div class="home-content">
      <div class="logo-area">
        <div class="logo-icon">
          <span class="dot" style="color:#E57373">●</span>
          <span class="dot" style="color:#81C784">●</span>
          <span class="dot" style="color:#64B5F6">●</span>
          <span class="dot" style="color:#FFD54F">●</span>
        </div>
        <h1 class="title">{{ t('title') }}</h1>
        <p class="subtitle">{{ t('subtitle') }}</p>
      </div>

      <div class="btn-group">
        <button class="menu-btn primary" @click="$emit('start')">
          {{ t('startGame') }}
        </button>
        <button class="menu-btn secondary" @click="$emit('rules')">
          {{ t('rules') }}
        </button>
        <button class="menu-btn secondary" @click="$emit('history')">
          {{ t('history') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { translations } from '../i18n.js'
export default {
  name: 'HomePage',
  props: { lang: String },
  emits: ['start', 'rules', 'history'],
  setup(props) {
    const t = (key) => translations[props.lang][key] || key
    return { t }
  },
}
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vmin;
  width: 80%;
  max-width: 500px;
}

.logo-area {
  text-align: center;
}

.logo-icon {
  font-size: 6vmin;
  letter-spacing: 1vmin;
  margin-bottom: 2vmin;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.title {
  font-size: 6vmin;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.3vmin;
  margin-bottom: 1vmin;
}

.subtitle {
  font-size: 2vmin;
  color: #666;
  letter-spacing: 0.2vmin;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 2.5vmin;
  width: 100%;
}

.menu-btn {
  width: 100%;
  padding: 2.2vmin 0;
  font-size: 2.5vmin;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  letter-spacing: 0.2vmin;
}
.menu-btn:hover { transform: translateY(-2px); }
.menu-btn:active { transform: translateY(0); }

.menu-btn.primary {
  background: #4A90E2;
  color: #fff;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}
.menu-btn.primary:hover {
  background: #357abd;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.menu-btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}
.menu-btn.secondary:hover { background: #e9e9e9; }
</style>
