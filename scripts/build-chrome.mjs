import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUTPUT = path.join(ROOT, 'dist', 'chrome')
const SHARED_ENTRIES = ['manifest.json', 'LICENSE', 'icons', 'src']

fs.rmSync(OUTPUT, { recursive: true, force: true })
fs.mkdirSync(OUTPUT, { recursive: true })
for (const entry of SHARED_ENTRIES) {
  fs.cpSync(path.join(ROOT, entry), path.join(OUTPUT, entry), { recursive: true })
}
fs.rmSync(path.join(OUTPUT, 'icons', 'source'), { recursive: true, force: true })

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'))
const zipPath = path.join(ROOT, 'dist', `pinprompt-chrome-${version}.zip`)
fs.rmSync(zipPath, { force: true })
execFileSync('zip', ['-r', '-X', zipPath, '.'], { cwd: OUTPUT, stdio: 'ignore' })

console.log(`Chrome package ready: ${zipPath}`)
