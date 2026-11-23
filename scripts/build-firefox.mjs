import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUTPUT = path.join(ROOT, 'dist', 'firefox')
const SHARED_ENTRIES = ['LICENSE', 'icons', 'src']

const FIREFOX_SETTINGS = {
  gecko: {
    id: 'pinprompt@local',
    strict_min_version: '142.0',
    data_collection_permissions: { required: ['none'] },
  },
}

const chromeManifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'))
const firefoxManifest = {
  ...chromeManifest,
  background: { scripts: [chromeManifest.background.service_worker] },
  browser_specific_settings: FIREFOX_SETTINGS,
}

fs.rmSync(OUTPUT, { recursive: true, force: true })
fs.mkdirSync(OUTPUT, { recursive: true })
for (const entry of SHARED_ENTRIES) {
  fs.cpSync(path.join(ROOT, entry), path.join(OUTPUT, entry), { recursive: true })
}
fs.rmSync(path.join(OUTPUT, 'icons', 'source'), { recursive: true, force: true })
fs.writeFileSync(path.join(OUTPUT, 'manifest.json'), JSON.stringify(firefoxManifest, null, 2) + '\n')

console.log(`Firefox build ready: ${path.join(OUTPUT, 'manifest.json')}`)
