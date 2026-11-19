// Pre-generate MP3 audio for every word in src/words.js using Microsoft Edge
// Read-Aloud voices (Yunyang for Chinese, Guy for English).
// Files land in public/audio/{lang}/{urlencoded-word}.mp3

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { WORDS } from '../src/words.js'
import fs from 'node:fs/promises'
import fss from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_ZH = path.join(ROOT, 'public', 'audio', 'zh')
const OUT_EN = path.join(ROOT, 'public', 'audio', 'en')

const VOICE_ZH = 'zh-CN-YunyangNeural'
const VOICE_EN = 'en-US-GuyNeural'

await fs.mkdir(OUT_ZH, { recursive: true })
await fs.mkdir(OUT_EN, { recursive: true })

function fileNameFor(word) {
  return encodeURIComponent(word) + '.mp3'
}

async function synth(voice, text, outFile) {
  if (fss.existsSync(outFile) && fss.statSync(outFile).size > 512) {
    console.log(`  skip (exists): ${path.basename(outFile)}`)
    return
  }
  const tts = new MsEdgeTTS()
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
  const tmpDir = path.dirname(outFile)
  const { audioFilePath } = await tts.toFile(tmpDir, text, { rate: -8, pitch: 0, volume: 0 })
  tts.close()
  // toFile writes with a random filename; rename to our target name
  if (audioFilePath !== outFile) {
    await fs.rename(audioFilePath, outFile)
  }
  const size = fss.statSync(outFile).size
  console.log(`  ✓ ${path.basename(outFile)} (${size} bytes)`)
}

const zhWords = new Set()
const enWords = new Set()
for (const cat of Object.values(WORDS.zh)) cat.forEach(w => zhWords.add(w))
for (const cat of Object.values(WORDS.en)) cat.forEach(w => enWords.add(w))

console.log(`ZH: ${zhWords.size} words, EN: ${enWords.size} words`)

console.log(`\n== Generating Chinese (${VOICE_ZH}) ==`)
for (const w of zhWords) {
  try { await synth(VOICE_ZH, w, path.join(OUT_ZH, fileNameFor(w))) }
  catch (e) { console.error(`  ✗ ${w}: ${e.message}`) }
}

console.log(`\n== Generating English (${VOICE_EN}) ==`)
for (const w of enWords) {
  try { await synth(VOICE_EN, w, path.join(OUT_EN, fileNameFor(w))) }
  catch (e) { console.error(`  ✗ ${w}: ${e.message}`) }
}

console.log('\nDone.')
