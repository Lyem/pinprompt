const extensionApi = globalThis.browser ?? globalThis.chrome

const CONTENT_FILES = ['src/content/format.js', 'src/content/styles.js', 'src/content/overlay.js']
const BADGE_COLOR = '#2563eb'

async function runInTab(tabId, options) {
  const [injection] = await extensionApi.scripting.executeScript({ target: { tabId }, ...options })
  return injection?.result
}

async function showSelectionBadge(tabId, selecting) {
  await extensionApi.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR })
  await extensionApi.action.setBadgeText({ tabId, text: selecting ? 'ON' : '' })
}

async function toggleSelection(tab) {
  if (!tab?.id) return
  try {
    const overlayReady = await runInTab(tab.id, { func: () => typeof globalThis.__pinprompt?.toggle === 'function' })
    if (!overlayReady) await runInTab(tab.id, { files: CONTENT_FILES })
    const selecting = await runInTab(tab.id, { func: () => globalThis.__pinprompt.toggle() })
    await showSelectionBadge(tab.id, selecting === true)
  } catch (error) {
    console.warn('[pinprompt] this page cannot be annotated:', String(error))
  }
}

extensionApi.action.onClicked.addListener(toggleSelection)

extensionApi.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'pinprompt:selection' || !sender.tab?.id) return
  showSelectionBadge(sender.tab.id, message.selecting === true).catch(() => {})
})
