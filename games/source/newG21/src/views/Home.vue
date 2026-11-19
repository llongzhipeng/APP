<template>
  <div class="home">
    <h1 class="title">{{ t('gameTitle') }}</h1>
    <div class="btns">
      <button class="g-btn big" @click="$emit('start')">{{ t('startGame') }}</button>
      <button class="g-btn big secondary" @click="$emit('rules')">{{ t('rules') }}</button>
      <button class="g-btn big secondary" @click="$emit('history')">{{ t('history') }}</button>
    </div>

    <!-- 装饰性星星 -->
    <img class="deco s1" :src="resolveImage('/images/1.png')" />
    <img class="deco s2" :src="resolveImage('/images/1.png')" />
    <img class="deco s3" :src="resolveImage('/images/1.png')" />
    <img class="deco s4" :src="resolveImage('/images/1.png')" />
  </div>
</template>

<script setup>
import { resolveImage } from '../assets'
import { useI18n } from '../i18n.js'
const { t } = useI18n()
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.title {
  font-size: 9vmin;
  font-weight: bold;
  color: #ffe066;
  text-shadow: 0 0 3vmin rgba(255, 224, 100, 0.75), 0 0.6vmin 2vmin rgba(0, 0, 0, 0.6);
  letter-spacing: 0.6vmin;
  margin-bottom: 8vmin;
}
.btns {
  display: flex;
  flex-direction: column;
  gap: 3vmin;
  z-index: 2;
}
.big {
  min-width: 40vmin;
  font-size: 3.2vmin;
  padding: 2.2vmin 4vmin;
}
.deco {
  position: absolute;
  pointer-events: none;
  filter: drop-shadow(0 0 1.5vmin rgba(255, 240, 150, 0.7));
  animation: twinkle 2.4s ease-in-out infinite;
}
.deco.s1 { width: 8vmin; top: 12%; left: 14%; animation-delay: 0s; }
.deco.s2 { width: 6vmin; top: 20%; right: 12%; animation-delay: 0.6s; }
.deco.s3 { width: 7vmin; bottom: 15%; left: 18%; animation-delay: 1.1s; }
.deco.s4 { width: 5vmin; bottom: 22%; right: 16%; animation-delay: 1.6s; }
@keyframes twinkle {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

/* 竖屏适配 */
@media (orientation: portrait) {
  .home {
    padding-top: calc(6vmin + env(safe-area-inset-top));
    padding-bottom: calc(4vmin + env(safe-area-inset-bottom));
  }
  .title {
    font-size: max(11vmin, 32px);
    margin-bottom: 10vmin;
    letter-spacing: 0.4vmin;
  }
  .btns {
    gap: 4vmin;
    width: 80%;
    align-items: stretch;
  }
  .big {
    width: 100%;
    min-width: 0;
    font-size: max(4.2vmin, 18px);
    padding: max(3vmin, 14px) max(4vmin, 20px);
    border-radius: max(2vmin, 12px);
  }
  .deco.s1 { width: max(10vmin, 40px); }
  .deco.s2 { width: max(8vmin, 34px); }
  .deco.s3 { width: max(9vmin, 36px); }
  .deco.s4 { width: max(7vmin, 30px); }
}
</style>
