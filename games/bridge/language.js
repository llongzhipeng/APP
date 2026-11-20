// Each embedded game has its own Vue instance and may use "cn" for Chinese.
const requested = new URLSearchParams(location.search).get('lang')
let read
let apply

export function trainingLanguage() {
  const value = read ? read() : requested
  return value === 'en' ? 'en' : 'zh'
}

export function bindTrainingLanguage(getLanguage, setLanguage, chinese = 'zh') {
  read = getLanguage
  apply = () => {
    if (requested !== 'en' && requested !== 'zh') return
    const target = requested === 'en' ? 'en' : chinese
    if (getLanguage() !== target) setLanguage(target)
  }
  apply()
}

export function bindComponentLanguage(vm, chinese) {
  if (read) return
  if (vm.i18n?.setLocale) {
    bindTrainingLanguage(() => vm.i18n.locale, value => vm.i18n.setLocale(value))
  } else if (vm.i18n?.state && vm.i18n.setLang) {
    bindTrainingLanguage(() => vm.i18n.state.lang, value => vm.i18n.setLang(value))
  } else if (vm.i18n?.set) {
    bindTrainingLanguage(() => vm.i18n.lang, value => vm.i18n.set(value))
  } else {
    const key = typeof vm.lang === 'string' ? 'lang' : 'language'
    if (typeof vm[key] !== 'string') return
    bindTrainingLanguage(() => vm[key], value => {
      vm[key] = value
    }, chinese)
  }
}

export function finishLanguageSetup() {
  // Some original games restore a saved preference in their mounted hook.
  apply?.()
  document.documentElement.lang = trainingLanguage() === 'en' ? 'en' : 'zh-CN'
}
