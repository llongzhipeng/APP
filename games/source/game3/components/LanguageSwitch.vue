<template>
  <div class="language-switch" :class="{ 'in-game': hideInGame }">
    <button
      @click="toggleLanguage"
      class="lang-btn"
      :disabled="hideInGame"
    >
      {{ language === 'zh' ? 'English' : '中文' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'LanguageSwitch',
  props: {
    language: {
      type: String,
      required: true
    },
    hideInGame: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle'],
  methods: {
    toggleLanguage() {
      if (!this.hideInGame) {
        this.$emit('toggle');
      }
    }
  }
}
</script>

<style scoped>
.language-switch {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  transition: opacity 0.3s;
}

.language-switch.in-game {
  opacity: 0;
  pointer-events: none;
}

.lang-btn {
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.lang-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.lang-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
