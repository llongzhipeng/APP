// Voice prompt playback. Plays role clip then item clip sequentially for each question.

const ROLE_INDEX = { whoSelf: 1, charA: 2, charB: 3, charC: 4 }
const ITEM_INDEX = {
  itemApple: 1, itemCup: 2, itemBook: 3, itemPhone: 4,
  itemKey: 5, itemPen: 6, itemClock: 7, itemPlant: 8,
}

class VoicePlayer {
  constructor() {
    this._audio = null
    this._token = 0 // used to cancel in-flight sequences
  }
  _url(lang, kind, i) {
    const langDir = lang === 'en' ? 'english' : 'chinese'
    return `voice/${langDir}/${kind}/${i}.mp3`
  }
  stop() {
    this._token += 1
    if (this._audio) {
      try { this._audio.pause() } catch (_) {}
      this._audio.src = ''
      this._audio = null
    }
  }
  _playOne(url) {
    return new Promise((resolve) => {
      const a = new Audio(url)
      this._audio = a
      const done = () => { a.removeEventListener('ended', done); a.removeEventListener('error', done); resolve() }
      a.addEventListener('ended', done)
      a.addEventListener('error', done)
      const p = a.play()
      if (p && typeof p.catch === 'function') p.catch(() => resolve())
    })
  }
  async playQuestion(lang, roleKey, itemKey) {
    this.stop()
    const my = ++this._token
    const roleIdx = ROLE_INDEX[roleKey]
    const itemIdx = ITEM_INDEX[itemKey]
    if (roleIdx) {
      await this._playOne(this._url(lang, 'role', roleIdx))
      if (my !== this._token) return
    }
    if (itemIdx) {
      await this._playOne(this._url(lang, 'item', itemIdx))
    }
  }
}

export const voice = new VoicePlayer()
