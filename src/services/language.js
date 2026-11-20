const key = 'training.language'

export function getTrainingLanguage() {
  return uni.getStorageSync(key) === 'en' ? 'en' : 'zh'
}

export function setTrainingLanguage(language) {
  uni.setStorageSync(key, language === 'en' ? 'en' : 'zh')
}
