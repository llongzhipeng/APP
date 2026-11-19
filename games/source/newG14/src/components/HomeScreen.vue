<template>
  <div class="home-screen">
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>

    <button
      v-if="showLangBtn"
      class="lang-btn"
      @click="$emit('toggle-lang')"
    >{{ t.langBtn }}</button>

    <div class="home-content">
      <div class="title-block">
        <div class="badge-onair">
          <span class="dot"></span>
          <span>{{ t.onAir }}</span>
        </div>
        <h1 class="game-title">{{ t.title }}</h1>
        <p class="game-subtitle">{{ t.subtitle }}</p>
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" @click="$emit('start')">{{ t.startGame }}</button>
        <button class="btn btn-secondary" @click="$emit('show-rules')">{{ t.rules }}</button>
        <button class="btn btn-secondary" @click="$emit('show-history')">{{ t.history }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveImage } from '../assets'
export default {
  name: 'HomeScreen',
  props: {
    t: { type: Object, required: true },
    showLangBtn: { type: Boolean, default: true }
  },
  emits: ['start', 'show-rules', 'show-history', 'toggle-lang']
}
</script>

<style scoped>
.home-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0a0e27;
}

.bg-image {
  position: absolute;
  inset: 0;
  background: url(~@/views/game/newG14/public/images/1.png) center/cover no-repeat;
  filter: brightness(0.55) saturate(1.05);
  transform: scale(1.02);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(0, 212, 255, 0.15), transparent 60%),
    linear-gradient(180deg, rgba(10,14,39,0.55) 0%, rgba(10,14,39,0.75) 100%);
}

.lang-btn {
  position: absolute;
  top: 3%;
  right: 3%;
  background: rgba(0, 212, 255, 0.15);
  border: 0.1rem solid #00d4ff;
  color: #00d4ff;
  padding: 0.55rem 1.2rem;
  border-radius: 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  z-index: 10;
  backdrop-filter: blur(0.3rem);
}
.lang-btn:hover {
  background: rgba(0, 212, 255, 0.3);
}

.home-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  z-index: 2;
}

.title-block {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.badge-onair {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 0.1rem solid rgba(248, 113, 113, 0.6);
  padding: 0.4rem 1.1rem;
  border-radius: 2rem;
  color: #fca5a5;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}
.badge-onair .dot {
  width: 0.6rem; height: 0.6rem;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0.6rem #ef4444;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.game-title {
  font-size: 4.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.05em;
  text-shadow: 0 0 2rem rgba(0, 212, 255, 0.7), 0 0 4rem rgba(0, 212, 255, 0.3);
  margin: 0;
  line-height: 1.1;
}

.game-subtitle {
  font-size: 1.3rem;
  color: rgba(0, 212, 255, 0.9);
  margin-top: 0.5rem;
  letter-spacing: 0.15em;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 20rem;
}

.btn {
  padding: 1.1rem 2rem;
  border-radius: 0.6rem;
  border: none;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  letter-spacing: 0.05em;
  font-family: inherit;
}
.btn:hover {
  transform: translateY(-0.1rem);
  box-shadow: 0 0.4rem 1.2rem rgba(0,0,0,0.3);
}
.btn:active {
  transform: translateY(0.05rem);
}

.btn-primary {
  background: linear-gradient(135deg, #00d4ff, #0078ff);
  color: #fff;
  box-shadow: 0 0.2rem 1rem rgba(0, 212, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 0.1rem solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(0.3rem);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (orientation: portrait) {
  .lang-btn {
    top: calc(2% + env(safe-area-inset-top));
    right: 4%;
    font-size: max(3.6vmin, 14px);
    padding: 0.6rem 1.2rem;
  }
  .home-content { gap: 6vh; padding: 0 5%; width: 100%; }
  .badge-onair { font-size: max(3vmin, 12px); }
  .game-title {
    font-size: max(10vmin, 34px);
    letter-spacing: 0.04em;
  }
  .game-subtitle {
    font-size: max(4vmin, 15px);
    letter-spacing: 0.12em;
  }
  .btn-group {
    width: 82%;
    max-width: 24rem;
    gap: 1.4rem;
  }
  .btn {
    font-size: max(4.6vmin, 18px);
    padding: 1.2rem 1.6rem;
    border-radius: 0.9rem;
  }
}
</style>
