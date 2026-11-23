import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

createRequire(import.meta.url)('../src/content/format.js')
const format = globalThis.__pinpromptFormat

const saveButton = {
  comment: 'Make it   bigger',
  intent: 'change',
  url: 'http://localhost:5173/settings?tab=a',
  target: { tagName: 'button', accessibleName: 'Save', selector: '#save', text: 'Save changes', source: 'src/Settings.tsx:42' },
}

test('returns an empty string without annotations', () => {
  assert.equal(format([]), '')
})

test('renders one page in the Orca design feedback layout', () => {
  assert.equal(format([saveButton]), [
    '## Design Feedback: /settings?tab=a',
    '',
    '**URL:** http://localhost:5173/settings?tab=a',
    '',
    '### 1. button "Save"',
    '**Intent:** change',
    '**Selector:** `#save`',
    '**Source:** src/Settings.tsx:42',
    '**Text:** "Save changes"',
    '**Feedback:** Make it bigger',
  ].join('\n'))
})

test('groups annotations by page and keeps global numbering', () => {
  const heading = { comment: 'Smaller', intent: 'question', url: 'http://localhost:5173/home', target: { tagName: 'h1', selector: 'main > h1', text: 'Welcome' } }
  const output = format([saveButton, heading])
  assert.ok(output.startsWith('## Design Feedback across pages'))
  assert.match(output, /## Design Feedback: \/home\n\n\*\*URL:\*\* `http:\/\/localhost:5173\/home`/)
  assert.match(output, /### 2\. h1 "Welcome"\n\*\*Intent:\*\* question/)
})

test('fences selectors that contain backticks', () => {
  const output = format([{ ...saveButton, target: { tagName: 'div', selector: 'div[title="a`b"]' } }])
  assert.match(output, /\*\*Selector:\*\* ``div\[title="a`b"\]``/)
})
