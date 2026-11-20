import { bindTrainingLanguage } from '@/language.js'
// Simple reactive store shared across components
import Vue from 'vue'
import { dict } from './i18n'

const HISTORY_KEY = 'gf_history_v1'
const LANG_KEY = 'gf_lang'

function loadHistory () {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch (_) { return [] }
}

export const store = Vue.observable({
  view: 'home',
  lang: localStorage.getItem(LANG_KEY) || 'zh',
  duration: 60,
  lastResult: null,
  history: loadHistory()
})

export function t (key) {
  return (dict[store.lang] || dict.zh)[key]
}

export const actions = {
  go (v) { store.view = v },
  setLang (l) { store.lang = l; localStorage.setItem(LANG_KEY, l) },
  setDuration (s) { store.duration = s },
  saveResult (r) {
    store.lastResult = r
    store.history.unshift(r)
    if (store.history.length > 200) store.history.length = 200
    localStorage.setItem(HISTORY_KEY, JSON.stringify(store.history))
  },
  clearHistory () {
    store.history = []
    localStorage.removeItem(HISTORY_KEY)
  }
}

bindTrainingLanguage(() => store.lang, actions.setLang)
