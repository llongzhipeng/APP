import { cp, mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

if (!process.argv[2]) {
  console.error('Usage: node export-assets.mjs /path/to/uni-app')
  process.exit(1)
}

const project = resolve(process.argv[2])
const destination = join(dirname(fileURLToPath(import.meta.url)), 'public', 'training-preview')
const h5 = join(project, 'dist', 'build', 'h5', 'static')
const { games, trainingCategories, catalogCategory } = await import(
  pathToFileURL(join(project, 'src', 'services', 'games.js')).href
)
const entries = games.map(game => ({
  gameType: game.key,
  title: game.title,
  category: catalogCategory(game),
  directory: game.directory,
  cover: 'covers/' + game.key + '.jpg',
}))
for (const game of entries) {
  await stat(join(h5, 'web', 'training', game.directory, 'index.html'))
  await stat(join(h5, game.cover))
}

await mkdir(destination, { recursive: true })
await cp(join(h5, 'web', 'training'), join(destination, 'games'), { recursive: true })
await cp(join(h5, 'covers'), join(destination, 'covers'), { recursive: true })
const manifest = {
  categories: trainingCategories.map(([key, label]) => ({ key, label })),
  games: entries,
}
await writeFile(join(destination, 'catalog.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log('Exported ' + entries.length + ' games.')
