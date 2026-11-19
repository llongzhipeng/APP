<template>
  <div class="language-switcher">
    <button
      class="lang-toggle-btn"
      :disabled="disabled"
      :class="{ disabled: disabled }"
      @click="toggleLanguage"
    >
      {{ currentLang === 'zh' ? 'EN' : '中' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'LanguageSwitcher',
  inject: ['i18n'],
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentLang() {
      return this.i18n.getLocale()
    }
  },
  methods: {
    toggleLanguage() {
      if (this.disabled) return
      const newLang = this.currentLang === 'zh' ? 'en' : 'zh'
      this.i18n.setLocale(newLang)
      this.$emit('language-changed', newLang)
    }
  }
}
</script>

<style scoped>
.language-switcher {
  display: flex;
}

.lang-toggle-btn {
  padding: 8px 16px;
  border: 2px solid #4CAF50;
  background-color: #fff;
  color: #4CAF50;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 50px;
}

.lang-toggle-btn:hover:not(:disabled) {
  background-color: #4CAF50;
  color: #fff;
  transform: scale(1.05);
}

.lang-toggle-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.lang-toggle-btn:disabled,
.lang-toggle-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: #ccc;
  color: #999;
}

.lang-toggle-btn:disabled:hover,
.lang-toggle-btn.disabled:hover {
  background-color: #fff;
  color: #999;
  transform: none;
}
</style>
