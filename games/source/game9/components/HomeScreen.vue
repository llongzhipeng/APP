<template>
  <div class="home-screen">
    <button
      v-if="showLangBtn"
      class="lang-btn"
      @click="$emit('toggle-lang')"
    >{{ t.langBtn }}</button>

    <div class="home-content">
      <div class="title-block">
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
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0d1b4b 100%);
}

.lang-btn {
  position: absolute;
  top: 3%;
  right: 3%;
  background: rgba(0, 212, 255, 0.15);
  border: 0.1rem solid #00d4ff;
  color: #00d4ff;
  padding: 0.4rem 0.9rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.lang-btn:hover {
  background: rgba(0, 212, 255, 0.3);
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6vh;
}

.title-block {
  text-align: center;
}

.game-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.05em;
  text-shadow: 0 0 2rem rgba(0, 212, 255, 0.7), 0 0 4rem rgba(0, 212, 255, 0.3);
  margin: 0;
  line-height: 1.1;
}

.game-subtitle {
  font-size: 1rem;
  color: rgba(0, 212, 255, 0.7);
  margin-top: 0.5rem;
  letter-spacing: 0.15em;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 16rem;
}

.btn {
  padding: 0.9rem 2rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
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
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 0.1rem solid rgba(255, 255, 255, 0.2);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
}
</style>
