import zh from './zh'
import en from './en'
import { reactive } from '@vue/composition-api'

const messages = { zh, en }

export function createI18n() {
  const state = reactive({
    locale: localStorage.getItem('memory_painter_locale') || 'zh'
  })

  const i18n = {
    get locale() {
      return state.locale
    },

    t(key) {
      const keys = key.split('.')
      let value = messages[state.locale]

      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k]
        } else {
          return key
        }
      }

      return value || key
    },

    setLocale(locale) {
      if (messages[locale]) {
        state.locale = locale
        localStorage.setItem('memory_painter_locale', locale)
        return true
      }
      return false
    },

    getLocale() {
      return state.locale
    }
  }

  return i18n
}
