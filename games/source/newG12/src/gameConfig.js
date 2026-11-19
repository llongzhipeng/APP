import { resolveImage } from './assets'
export const EMOTIONS = [
  { key: 'happy',    folder: 'happy',    images: 10, zh: '高兴', en: 'Happy' },
  { key: 'sad',      folder: 'Sadness',  images: 10, zh: '悲伤', en: 'Sad' },
  { key: 'anger',    folder: 'Anger',    images: 10, zh: '愤怒', en: 'Angry' },
  { key: 'calmness', folder: 'calmness', images: 4,  zh: '平静', en: 'Calm' }
]

export const DIFFICULTIES = [
  { level: 1, faces: 1, displayTime: 5, options: 2, coefficient: 1   },
  { level: 2, faces: 1, displayTime: 5, options: 3, coefficient: 1.5 },
  { level: 3, faces: 1, displayTime: 3, options: 3, coefficient: 2   },
  { level: 4, faces: 1, displayTime: 3, options: 4, coefficient: 2.5 },
  { level: 5, faces: 2, displayTime: 5, options: 4, coefficient: 3   },
  { level: 6, faces: 2, displayTime: 3, options: 4, coefficient: 3.5 }
]

export const MAX_ANSWER_TIME = 15
export const DIFFICULTY_WINDOW = 60
export const FEEDBACK_TIME = 800

export function imagePath(emotionKey, index) {
  const e = EMOTIONS.find(x => x.key === emotionKey)
  return resolveImage(`/images/${e.folder}/${index}.png`)
}

export function randomEmotion() {
  return EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
}

export function randomImageIndex(emotion) {
  return 1 + Math.floor(Math.random() * emotion.images)
}

export function pickOptions(correctKey, count) {
  const others = EMOTIONS.filter(e => e.key !== correctKey)
  const shuffled = others.sort(() => Math.random() - 0.5)
  const options = [
    EMOTIONS.find(e => e.key === correctKey),
    ...shuffled.slice(0, count - 1)
  ]
  return options.sort(() => Math.random() - 0.5)
}
