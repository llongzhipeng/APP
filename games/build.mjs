import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import vue2 from '@vitejs/plugin-vue2'
import { build } from 'vite'
import { installCueHooks } from './cue-hooks.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const bridge = join(root, 'bridge')
const require = createRequire(import.meta.url)
const platform = process.argv[2]
if (!['app', 'h5'].includes(platform)) throw new Error('Pass app or h5')
const source = join(root, 'source')
const output = resolve(root, platform === 'app' ? '../src/hybrid/html/training' : '../src/static/web/training')
const sdkFile = 'uni.webview.1.5.8.js'
const assetURL = (path) => './' + path.split('/public/')[1]

function adaptOriginalFiles(game, directory, cueStats) {
  return {
    name: 'original-game-compatibility',
    enforce: 'pre',
    transform(code, id) {
      if (!id.startsWith(game + '/') || !/\.(vue|js)$/.test(id)) return
      // The original Vue CLI projects load these files through Webpack require.
      // These original wrappers pass an average in milliseconds to their shared helper.
      const usesMillisecondAverages = directory.startsWith('newG') && Number(directory.slice(4)) <= 21
      const source = usesMillisecondAverages ? code.replace(/\btoPbGameSeconds\b/g, 'msToPbGameSeconds') : code
      const adapted = installCueHooks(source, id, directory, cueStats)
      return adapted
        .replace(/@import url\(['"]https:\/\/fonts\.googleapis\.com\/[^'"]+['"]\);/g, '')
        .replace(/url\(~@\/views\/game\/[^/]+\/public\//g, 'url(./')
        .replace(/require\.context\((['"])(\.\.\/(?:public\/)?[^'"]+)\1, (?:true|false), \/[^\n]+?\/[a-z]*\)/g,
          (_, quote, folder) => `key => ${JSON.stringify('./' + folder.replace(/^\.\.\/(?:public\/)?/, ''))} + '/' + key.replace(/^\\.\\//, '')`)
        .replace(/require\((['"])(\.{1,2}\/public\/[^'"]+)\1\)/g,
          (_, quote, path) => JSON.stringify(assetURL(path)))
        .replace(/require\(`\.\.\/public\/([^\x60]+)`\)/g, (_, path) => '`./' + path + '`')
    },
  }
}

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
if (platform === 'app') await cp(join(bridge, sdkFile), join(output, sdkFile))
await cp(join(bridge, 'audio/clips'), join(output, 'training-audio'), { recursive: true })
const directories = (await readdir(source)).filter(name => /^(?:game\d+|newG\d+)$/.test(name))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
for (const directory of directories) {
  const newGame = directory.startsWith('newG')
  const cueStats = new Set()
  const game = join(source, directory)
  const outDir = join(output, directory)
  const app = join(game, newGame ? 'src/App.vue' : 'App.vue')
  await mkdir(outDir, { recursive: true })
  const entry = join(root, 'training-game-entry.js')
  const virtualId = '\0training-game-entry'
  const virtualEntry = {
    name: 'original-game-entry',
    resolveId(id) { if (id === entry) return virtualId },
    load(id) {
      if (id !== virtualId) return
      return `import Vue from 'vue';
        import App from ${JSON.stringify(app)};
        import { initializeGameBridge } from ${JSON.stringify(join(bridge, 'session.js'))};
        import { initializeTrainingAudio } from ${JSON.stringify(join(bridge, 'audio/cues.js'))};
        import { installGameControls } from ${JSON.stringify(join(bridge, 'controls.js'))};
        import { initializeTutorialReading } from ${JSON.stringify(join(bridge, 'tutorial-reading.js'))};
        import { bindComponentLanguage, finishLanguageSetup } from ${JSON.stringify(join(bridge, 'language.js'))};
        App.mixins = [...(App.mixins || []), { beforeMount() { bindComponentLanguage(this, ${JSON.stringify(['newG23', 'newG44', 'newG45'].includes(directory) ? 'cn' : 'zh')}) } }];
        Vue.config.productionTip = false;
        initializeTrainingAudio(${JSON.stringify(directory)});
        initializeTutorialReading(${JSON.stringify(directory)});
        initializeGameBridge();
        new Vue({ render: h => h(App) }).$mount('#app');
        finishLanguageSetup();
        installGameControls();
      `
    },
  }
  await build({
    root,
    configFile: false,
    publicDir: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    base: './',
    logLevel: 'error',
    resolve: {
      alias: [
        { find: '@vue/composition-api', replacement: require.resolve('vue/dist/vue.runtime.esm.js') },
        { find: 'vue', replacement: require.resolve('vue/dist/vue.runtime.esm.js') },
        { find: '@', replacement: bridge },
      ],
    },
    plugins: [adaptOriginalFiles(game, directory, cueStats), vue2(), virtualEntry],
    build: {
      target: 'es2018',
      outDir,
      emptyOutDir: false,
      lib: { entry, name: 'TrainingGame', formats: ['iife'], fileName: () => 'game.js' },
    },
  })
  const publicDir = join(game, 'public')
  if (existsSync(publicDir)) {
    for (const item of await readdir(publicDir)) {
      if (item !== 'index.html') await cp(join(publicDir, item), join(outDir, item), { recursive: true })
    }
  }
  // One supplied game keeps its images alongside public rather than inside it.
  const images = join(game, 'images')
  if (existsSync(images)) await cp(images, join(outDir, 'images'), { recursive: true })
  const css = (await readdir(outDir)).filter(file => file.endsWith('.css'))
  const links = css.map(file => `<link rel="stylesheet" href="./${file}">`).join('')
  const sdk = platform === 'app' ? `<script src="../${sdkFile}"></script>` : ''
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>训练游戏</title>${links}</head>
<body><div id="app"></div><script src="./game.js"></script>${sdk}</body></html>`
  await writeFile(join(outDir, 'index.html'), html)
  if (!existsSync(join(outDir, 'game.js'))) throw new Error('Missing game bundle ' + directory)
  console.log('Built ' + directory + ' · cues: ' + [...cueStats].sort().join(', '))
}
