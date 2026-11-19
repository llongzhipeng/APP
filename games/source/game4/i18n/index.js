/**
 * 国际化配置模块
 */
import { reactive } from '@vue/composition-api';
import zh from './zh';
import en from './en';

const languages = {
  zh,
  en
};

// 默认语言
const DEFAULT_LANGUAGE = 'zh';

// 从localStorage读取语言设置
const savedLanguage = localStorage.getItem('game_language') || DEFAULT_LANGUAGE;

// 响应式语言状态
export const i18nState = reactive({
  currentLanguage: savedLanguage,
  messages: languages[savedLanguage]
});

/**
 * 切换语言
 * @param {string} lang - 语言代码 ('zh' | 'en')
 */
export function setLanguage(lang) {
  if (languages[lang]) {
    i18nState.currentLanguage = lang;
    i18nState.messages = languages[lang];
    localStorage.setItem('game_language', lang);
  }
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键，如 'common.start'
 * @returns {string} 翻译后的文本
 */
export function t(key) {
  const keys = key.split('.');
  let value = i18nState.messages;

  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }

  return value;
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
export function getCurrentLanguage() {
  return i18nState.currentLanguage;
}

export default {
  state: i18nState,
  setLanguage,
  t,
  getCurrentLanguage
};
