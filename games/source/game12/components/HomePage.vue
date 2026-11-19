<template>
  <div class="home-page">
    <!-- Language toggle button (top right) -->
    <button class="lang-btn" @click="$emit('toggle-language')">{{ t('langBtn') }}</button>

    <!-- Main content -->
    <div class="content">
      <div class="logo-area">
        <div class="icon-wrap">
          <svg viewBox="0 0 120 120" width="100%" height="100%">
            <circle cx="38" cy="60" r="28" fill="#FF7043" opacity="0.9"/>
            <circle cx="82" cy="60" r="18" fill="#5C6BC0" opacity="0.9"/>
          </svg>
        </div>
        <h1 class="game-title">{{ t('gameTitle') }}</h1>
        <p class="subtitle">{{ t('subtitle') }}</p>
      </div>

      <div class="btn-group">
        <button class="menu-btn primary" @click="$emit('start-game')">
          <span class="btn-icon">▶</span>
          {{ t('startGame') }}
        </button>
        <button class="menu-btn secondary" @click="$emit('show-rules')">
          <span class="btn-icon">☰</span>
          {{ t('rules') }}
        </button>
        <button class="menu-btn secondary" @click="$emit('show-history')">
          <span class="btn-icon">📋</span>
          {{ t('history') }}
        </button>
      </div>
    </div>

    <!-- Decorative background shapes -->
    <div class="bg-deco" aria-hidden="true">
      <div class="deco-shape deco-1"></div>
      <div class="deco-shape deco-2"></div>
      <div class="deco-shape deco-3"></div>
      <div class="deco-shape deco-4"></div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
export default {
  name: 'HomePage',
  props: {
    language: { type: String, required: true },
  },
  emits: ['start-game', 'show-rules', 'show-history', 'toggle-language'],
  methods: {
    t(key) { return t(this.language, key) },
  },
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
}

.lang-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 20px;
  background: white;
  border: 2px solid #4A90E2;
  border-radius: 20px;
  color: #4A90E2;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  z-index: 10;
}
.lang-btn:hover {
  background: #4A90E2;
  color: white;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-wrap {
  width: 100px;
  height: 100px;
}

.game-title {
  color: #333;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.menu-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}
.menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.menu-btn.primary {
  background: #4CAF50;
  color: white;
}
.menu-btn.secondary {
  background: white;
  color: #4A90E2;
  border: 2px solid #4A90E2;
}

.btn-icon {
  font-size: 18px;
}

.bg-deco {
  display: none;
}
</style>
