<template>
  <div class="home-page">
    <div class="home-content">
      <!-- Logo / Icon area -->
      <div class="logo-area">
        <svg viewBox="0 0 80 80" class="logo-svg" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
          <!-- Brain-like chain icon -->
          <rect x="18" y="28" width="14" height="10" rx="3" fill="white" opacity="0.9"/>
          <rect x="34" y="22" width="14" height="10" rx="3" fill="white" opacity="0.9"/>
          <rect x="18" y="44" width="14" height="10" rx="3" fill="white" opacity="0.7"/>
          <rect x="34" y="44" width="14" height="10" rx="3" fill="white" opacity="0.7"/>
          <!-- connectors -->
          <line x1="32" y1="33" x2="34" y2="27" stroke="white" stroke-width="2" opacity="0.6"/>
          <line x1="32" y1="49" x2="34" y2="49" stroke="white" stroke-width="2" opacity="0.6"/>
          <line x1="25" y1="38" x2="25" y2="44" stroke="white" stroke-width="2" opacity="0.6"/>
          <line x1="41" y1="32" x2="41" y2="44" stroke="white" stroke-width="2" opacity="0.6"/>
        </svg>
      </div>

      <h1 class="game-title">{{ t('gameTitle') }}</h1>
      <p class="game-subtitle">{{ t('gameSubtitle') }}</p>

      <div class="btn-group">
        <button class="btn btn-primary" @click="$emit('start-game')">
          <span class="btn-icon">▶</span>
          {{ t('startGame') }}
        </button>
        <button class="btn btn-secondary" @click="$emit('show-rules')">
          <span class="btn-icon">📋</span>
          {{ t('rulesIntro') }}
        </button>
        <button class="btn btn-secondary" @click="$emit('show-history')">
          <span class="btn-icon">📊</span>
          {{ t('historyRecord') }}
        </button>
      </div>
    </div>

    <!-- Decorative cards at bottom -->
    <div class="deco-cards">
      <div class="deco-card deco-c1">
        <svg viewBox="0 0 40 40" class="deco-shape"><circle cx="20" cy="20" r="15" fill="#E53935" opacity="0.85"/></svg>
      </div>
      <div class="deco-card deco-c2">
        <svg viewBox="0 0 40 40" class="deco-shape"><polygon points="20,5 35,35 5,35" fill="#1E88E5" opacity="0.85"/></svg>
        <svg viewBox="0 0 40 40" class="deco-shape"><polygon points="20,5 35,35 5,35" fill="#1E88E5" opacity="0.85"/></svg>
      </div>
      <div class="deco-card deco-c3">
        <svg viewBox="0 0 40 40" class="deco-shape"><rect x="8" y="8" width="24" height="24" fill="#F9A825" opacity="0.85"/></svg>
        <svg viewBox="0 0 40 40" class="deco-shape"><rect x="8" y="8" width="24" height="24" fill="#F9A825" opacity="0.85"/></svg>
        <svg viewBox="0 0 40 40" class="deco-shape"><rect x="8" y="8" width="24" height="24" fill="#F9A825" opacity="0.85"/></svg>
      </div>
      <div class="deco-card deco-c4">
        <svg viewBox="0 0 40 40" class="deco-shape">
          <polygon points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9" fill="#43A047" opacity="0.85"/>
        </svg>
        <svg viewBox="0 0 40 40" class="deco-shape">
          <polygon points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9" fill="#43A047" opacity="0.85"/>
        </svg>
        <svg viewBox="0 0 40 40" class="deco-shape">
          <polygon points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9" fill="#43A047" opacity="0.85"/>
        </svg>
        <svg viewBox="0 0 40 40" class="deco-shape">
          <polygon points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9" fill="#43A047" opacity="0.85"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../utils/i18n.js'

export default {
  name: 'HomePage',
  emits: ['start-game', 'show-rules', 'show-history'],
  methods: { t },
}
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(155deg, #4A90E2 0%, #357abd 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vmin;
  z-index: 2;
}

.logo-area {
  margin-bottom: 0.5vmin;
}

.logo-svg {
  width: 11vmin;
  height: 11vmin;
}

.game-title {
  font-size: 5.5vmin;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.15em;
  text-shadow: 0 0.3vmin 1.5vmin rgba(0,0,0,0.3);
  margin: 0;
}

.game-subtitle {
  font-size: 2vmin;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.2em;
  margin: 0;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 1.8vmin;
  margin-top: 1.5vmin;
  width: 38vmin;
}

.btn {
  padding: 1.8vmin 3vmin;
  font-size: 2.2vmin;
  font-weight: 600;
  border: none;
  border-radius: 1.2vmin;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1vmin;
  transition: transform 0.12s, box-shadow 0.12s;
  letter-spacing: 0.05em;
}

.btn:hover {
  transform: translateY(-0.25vmin);
  box-shadow: 0 0.8vmin 2vmin rgba(0,0,0,0.25);
}

.btn:active {
  transform: translateY(0.1vmin);
}

.btn-primary {
  background: #fff;
  color: #4A90E2;
  box-shadow: 0 0.4vmin 1.5vmin rgba(0,0,0,0.2);
}

.btn-secondary {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 0.2vmin solid rgba(255,255,255,0.35);
}

.btn-icon {
  font-size: 1.8vmin;
}

/* Decorative cards at bottom */
.deco-cards {
  position: absolute;
  bottom: -2vmin;
  display: flex;
  gap: 2.5vmin;
  opacity: 0.18;
  pointer-events: none;
}

.deco-card {
  background: white;
  border-radius: 1vmin;
  width: 10vmin;
  height: 14vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5vmin;
  padding: 0.8vmin;
}

.deco-shape {
  width: 3.5vmin;
  height: 3.5vmin;
}
</style>
