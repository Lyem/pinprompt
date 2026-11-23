;(() => {
  if (globalThis.__pinprompt) return

  const extensionApi = globalThis.browser ?? globalThis.chrome
  const STORAGE_KEY = 'pinprompt:annotations'
  const COMMENT_MAX_LENGTH = 4000
  const MARKER_SIZE = 24
  const CARD_OFFSET = 10
  const VIEWPORT_PADDING = 12
  const COPIED_FEEDBACK_MS = 1400
  const TOAST_MS = 1400
  const INTENTS = [
    { value: 'change', label: 'Change' },
    { value: 'question', label: 'Question' },
  ]
  const MODIFIER_LABEL = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
  const ICONS = {
    change: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>',
    question: '<svg viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    enter: '<svg viewBox="0 0 24 24"><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    pencil: '<svg viewBox="0 0 24 24"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  }

  const state = {
    selecting: false,
    pending: null,
    annotations: loadAnnotations(),
    trayCollapsed: false,
    editing: null,
    copied: false,
  }

  for (const stale of document.querySelectorAll('[data-pinprompt-host]')) stale.remove()
  const host = document.createElement('div')
  host.dataset.pinpromptHost = ''
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;'
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = globalThis.__pinpromptCss
  shadow.appendChild(style)
  document.documentElement.appendChild(host)
  for (const type of ['keydown', 'keyup', 'keypress', 'input', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'focusin', 'focusout']) {
    host.addEventListener(type, (event) => event.stopPropagation())
  }

  const highlight = createElement('div', 'highlight')
  const hoverLabel = createElement('div', 'hover-label')
  const markerLayer = createElement('div', 'markers')
  const tray = createElement('div', 'tray')
  const toast = createElement('div', 'toast')
  toast.setAttribute('role', 'status')
  let card = null
  let toastTimer = 0
  let copiedTimer = 0
  let frameRequest = 0

  function createElement(tag, className, parent = shadow) {
    const element = document.createElement(tag)
    if (className) element.className = className
    parent.appendChild(element)
    return element
  }

  const svgParser = new DOMParser()

  function icon(name) {
    return document.importNode(svgParser.parseFromString(ICONS[name].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '), 'image/svg+xml').documentElement, true)
  }

  function textSpan(text, className = '') {
    const span = document.createElement('span')
    if (className) span.className = className
    span.textContent = text
    return span
  }

  function button(className, content, label, onClick) {
    const element = document.createElement('button')
    element.type = 'button'
    element.className = className
    element.append(...[content].flat())
    if (label) {
      element.setAttribute('aria-label', label)
      element.title = label
    }
    element.addEventListener('click', (event) => {
      event.preventDefault()
      onClick(event)
    })
    return element
  }

  function loadAnnotations() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(stored) ? stored : []
    } catch {
      return []
    }
  }

  function saveAnnotations() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.annotations))
    } catch {
      showToast('Could not save annotations on this page')
    }
  }

  function showToast(message) {
    toast.textContent = message
    toast.classList.add('visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('visible'), TOAST_MS)
  }

  function isOwnEvent(event) {
    return event.composedPath().includes(host)
  }

  function eventElement(event) {
    const target = event.composedPath()[0]
    if (!(target instanceof Element) || target === document.documentElement || target === document.body) return null
    return target
  }

  function normalizedText(element, maxLength) {
    return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
  }

  function accessibleName(element) {
    const labelledBy = element.getAttribute('aria-labelledby')
    const labelledText = labelledBy
      ? labelledBy.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ')
      : ''
    const fieldLabel = element.labels?.[0]?.textContent || ''
    const name = element.getAttribute('aria-label') || labelledText || element.getAttribute('alt') ||
      element.getAttribute('title') || fieldLabel || element.getAttribute('placeholder') || ''
    return name.replace(/\s+/g, ' ').trim().slice(0, 120)
  }

  function sourceHint(element) {
    const carrier = element.closest('[data-astro-source-file],[data-insp-path],[data-source-file]')
    if (!carrier) return ''
    if (carrier.dataset.astroSourceFile) {
      return carrier.dataset.astroSourceFile + (carrier.dataset.astroSourceLoc ? ':' + carrier.dataset.astroSourceLoc : '')
    }
    return carrier.dataset.inspPath || carrier.dataset.sourceFile || ''
  }

  function matchesOnce(selector) {
    try {
      return document.querySelectorAll(selector).length === 1
    } catch {
      return false
    }
  }

  function stableId(element) {
    return element.id && !/[:]|\d{3,}|[0-9a-f]{8,}/i.test(element.id) ? element.id : ''
  }

  function uniqueSelector(element) {
    const parts = []
    let node = element
    while (node && node.nodeType === Node.ELEMENT_NODE && node !== document.documentElement) {
      const id = stableId(node)
      if (id) {
        parts.unshift('#' + CSS.escape(id))
        if (matchesOnce(parts.join(' > '))) return parts.join(' > ')
      } else {
        let part = node.localName
        const testId = node.getAttribute('data-testid')
        if (testId) part += `[data-testid="${CSS.escape(testId)}"]`
        const siblings = node.parentElement ? [...node.parentElement.children].filter(sibling => sibling.localName === node.localName) : []
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`
        parts.unshift(part)
        if (matchesOnce(parts.join(' > '))) return parts.join(' > ')
      }
      node = node.parentElement
    }
    return parts.join(' > ')
  }

  function describeTarget(element) {
    return {
      tagName: element.localName,
      selector: uniqueSelector(element),
      accessibleName: accessibleName(element),
      text: normalizedText(element, 300),
      source: sourceHint(element),
    }
  }

  function hoverText(element, rect) {
    const parts = [element.localName]
    const role = element.getAttribute('role')
    if (role) parts.push('role=' + role)
    let text = normalizedText(element, 41)
    if (text.length > 40) text = text.slice(0, 37) + '...'
    if (text) parts.push(`"${text}"`)
    parts.push(`${Math.round(rect.width)}x${Math.round(rect.height)}`)
    return parts.join('  ')
  }

  function showHighlight(element, withLabel) {
    if (!element?.isConnected) {
      hideHighlight()
      return
    }
    const rect = element.getBoundingClientRect()
    Object.assign(highlight.style, {
      display: 'block', left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px',
    })
    if (!withLabel) {
      hoverLabel.style.display = 'none'
      return
    }
    hoverLabel.textContent = hoverText(element, rect)
    const labelTop = rect.bottom + 6 + 28 > innerHeight ? rect.top - 28 : rect.bottom + 6
    Object.assign(hoverLabel.style, { display: 'block', left: Math.max(4, rect.left) + 'px', top: labelTop + 'px' })
  }

  function hideHighlight() {
    highlight.style.display = 'none'
    hoverLabel.style.display = 'none'
  }

  function onPointerMove(event) {
    if (!state.selecting || state.pending) return
    if (isOwnEvent(event)) {
      hideHighlight()
      return
    }
    showHighlight(eventElement(event), true)
  }

  function onPointerDown(event) {
    if (!state.selecting || isOwnEvent(event) || event.button !== 0) return
    const element = eventElement(event)
    if (!element) return
    event.preventDefault()
    event.stopImmediatePropagation()
    openCard(element)
  }

  function swallowPageClick(event) {
    if (!state.selecting || isOwnEvent(event)) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape' || !state.selecting || isOwnEvent(event)) return
    event.preventDefault()
    if (state.pending) closeCard()
    else setSelecting(false)
  }

  function intentGroup(current, onChange) {
    const group = document.createElement('div')
    group.className = 'intent'
    group.setAttribute('role', 'radiogroup')
    group.setAttribute('aria-label', 'Annotation intent')
    const paint = (value) => {
      for (const option of group.children) option.setAttribute('aria-checked', String(option.dataset.intent === value))
    }
    for (const intent of INTENTS) {
      const option = button('', [icon(intent.value), textSpan(intent.label)], intent.label, () => {
        paint(intent.value)
        onChange(intent.value)
      })
      option.dataset.intent = intent.value
      option.setAttribute('role', 'radio')
      group.appendChild(option)
    }
    paint(current)
    return group
  }

  function isSubmitShortcut(event) {
    return event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.isComposing
  }

  function openCard(element) {
    closeCard()
    state.pending = { element, target: describeTarget(element), intent: 'change' }
    showHighlight(element, false)
    card = createElement('div', 'card')
    card.setAttribute('role', 'dialog')
    card.setAttribute('aria-label', 'Add browser annotation')

    const targetRow = createElement('div', 'card-target', card)
    targetRow.title = state.pending.target.selector
    createElement('span', 'tag-chip', targetRow).textContent = state.pending.target.tagName
    createElement('span', 'card-name', targetRow).textContent =
      state.pending.target.accessibleName || state.pending.target.text || state.pending.target.selector

    const comment = createElement('textarea', '', card)
    comment.placeholder = 'Describe what the agent should change here...'
    comment.maxLength = COMMENT_MAX_LENGTH
    comment.setAttribute('aria-label', 'Annotation comment')

    card.appendChild(intentGroup('change', (value) => { state.pending.intent = value }))

    const actions = createElement('div', 'card-actions', card)
    const shortcut = textSpan('', 'shortcut')
    shortcut.append(textSpan(MODIFIER_LABEL), icon('enter'))
    const add = button('button primary', [icon('plus'), textSpan('Add'), shortcut], '', () => addPendingAnnotation(comment.value))
    add.disabled = true
    actions.append(button('button ghost', 'Cancel', '', closeCard), add)

    comment.addEventListener('input', () => { add.disabled = !comment.value.trim() })
    comment.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCard()
      } else if (isSubmitShortcut(event)) {
        event.preventDefault()
        addPendingAnnotation(comment.value)
      }
    })
    positionCard()
    comment.focus()
  }

  function closeCard() {
    card?.remove()
    card = null
    state.pending = null
    hideHighlight()
  }

  function positionCard() {
    if (!card || !state.pending) return
    const element = state.pending.element
    if (element.isConnected) showHighlight(element, false)
    const rect = element.isConnected ? element.getBoundingClientRect() : highlight.getBoundingClientRect()
    const width = card.offsetWidth
    const height = card.offsetHeight
    const room = { bottom: innerHeight - rect.bottom, top: rect.top, right: innerWidth - rect.right, left: rect.left }
    const needed = {
      bottom: height + CARD_OFFSET + VIEWPORT_PADDING,
      top: height + CARD_OFFSET + VIEWPORT_PADDING,
      right: width + CARD_OFFSET + VIEWPORT_PADDING,
      left: width + CARD_OFFSET + VIEWPORT_PADDING,
    }
    const side = ['bottom', 'top', 'right', 'left'].find(name => room[name] >= needed[name]) ?? (room.bottom >= room.top ? 'bottom' : 'top')
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const position = {
      bottom: { x: centerX - width / 2, y: rect.bottom + CARD_OFFSET },
      top: { x: centerX - width / 2, y: rect.top - CARD_OFFSET - height },
      right: { x: rect.right + CARD_OFFSET, y: centerY - height / 2 },
      left: { x: rect.left - CARD_OFFSET - width, y: centerY - height / 2 },
    }[side]
    const x = Math.max(VIEWPORT_PADDING, Math.min(position.x, innerWidth - width - VIEWPORT_PADDING))
    const y = Math.max(VIEWPORT_PADDING, Math.min(position.y, innerHeight - height - VIEWPORT_PADDING))
    Object.assign(card.style, { left: x + 'px', top: y + 'px' })
  }

  function addPendingAnnotation(rawComment) {
    const comment = rawComment.trim()
    if (!comment || !state.pending) return
    state.annotations.push({
      id: crypto.randomUUID(),
      comment,
      intent: state.pending.intent,
      url: location.href,
      title: document.title,
      createdAt: new Date().toISOString(),
      target: state.pending.target,
    })
    state.trayCollapsed = false
    saveAnnotations()
    closeCard()
    render()
    showToast('Annotation added')
  }

  function samePage(url) {
    try {
      const other = new URL(url)
      return other.origin === location.origin && other.pathname === location.pathname && other.search === location.search
    } catch {
      return false
    }
  }

  function findTarget(annotation) {
    try {
      return document.querySelector(annotation.target.selector)
    } catch {
      return null
    }
  }

  function renderMarkers() {
    markerLayer.replaceChildren()
    state.annotations.forEach((annotation, index) => {
      if (!samePage(annotation.url)) return
      const marker = createElement('div', 'marker', markerLayer)
      marker.textContent = String(index + 1)
      marker.dataset.index = String(index)
      marker.title = `Edit annotation ${index + 1}`
      marker.addEventListener('click', () => editAnnotation(annotation))
    })
    positionMarkers()
  }

  function positionMarkers() {
    for (const marker of markerLayer.children) {
      const element = findTarget(state.annotations[Number(marker.dataset.index)])
      const rect = element?.getBoundingClientRect()
      if (!rect || (rect.width < 1 && rect.height < 1) || rect.bottom < 0 || rect.top > innerHeight) {
        marker.style.display = 'none'
        continue
      }
      marker.style.display = 'flex'
      marker.style.left = Math.max(2, Math.min(innerWidth - MARKER_SIZE - 2, rect.left + rect.width / 2 - MARKER_SIZE / 2)) + 'px'
      marker.style.top = Math.max(2, Math.min(innerHeight - MARKER_SIZE - 2, rect.bottom - MARKER_SIZE / 2)) + 'px'
    }
  }

  function annotationTitle(annotation) {
    const target = annotation.target
    return target.accessibleName || target.text || target.tagName
  }

  function renderTrayHead() {
    const head = document.createElement('div')
    head.className = 'tray-head'
    const count = state.annotations.length
    const toggle = button('tray-toggle', icon(state.trayCollapsed ? 'chevronRight' : 'chevronDown'),
      state.trayCollapsed ? 'Expand annotations' : 'Collapse annotations', () => {
        state.trayCollapsed = !state.trayCollapsed
        renderTray()
      })
    toggle.append(`${count} annotation${count === 1 ? '' : 's'}`)
    const copy = button('button outline small', [icon(state.copied ? 'check' : 'copy'), textSpan(state.copied ? 'Copied' : 'Copy')],
      'Copy prompt', copyPrompt)
    const clear = button('button icon', icon('trash'), 'Clear annotations', clearAnnotations)
    head.append(toggle, copy, clear)
    return head
  }

  function renderEditRow(row, annotation) {
    const editor = document.createElement('div')
    editor.className = 'tray-body tray-edit'
    const comment = document.createElement('textarea')
    comment.value = state.editing.comment
    comment.maxLength = COMMENT_MAX_LENGTH
    comment.setAttribute('aria-label', 'Annotation comment')
    const save = () => {
      const text = comment.value.trim()
      if (!text) return
      annotation.comment = text
      annotation.intent = state.editing.intent
      state.editing = null
      saveAnnotations()
      render()
    }
    const cancel = () => {
      state.editing = null
      renderTray()
    }
    const saveButton = button('button primary small', 'Save', '', save)
    comment.addEventListener('input', () => {
      state.editing.comment = comment.value
      saveButton.disabled = !comment.value.trim()
    })
    comment.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
      } else if (isSubmitShortcut(event)) {
        event.preventDefault()
        save()
      }
    })
    const actions = document.createElement('div')
    actions.className = 'tray-edit-actions'
    actions.append(button('button ghost small', 'Cancel', '', cancel), saveButton)
    editor.append(comment, intentGroup(state.editing.intent, (value) => { state.editing.intent = value }), actions)
    row.appendChild(editor)
    requestAnimationFrame(() => {
      comment.focus()
      comment.setSelectionRange(comment.value.length, comment.value.length)
    })
  }

  function renderViewRow(row, annotation, index) {
    const body = document.createElement('div')
    body.className = 'tray-body'
    const title = createElement('div', 'tray-title', body)
    title.textContent = annotationTitle(annotation)
    const comment = createElement('div', 'tray-comment', body)
    comment.textContent = annotation.comment
    const meta = createElement('div', 'tray-meta', body)
    createElement('span', '', meta).textContent = annotation.intent
    if (!samePage(annotation.url)) {
      const page = createElement('span', 'page', meta)
      page.textContent = annotation.url
      page.title = annotation.url
    }
    const actions = document.createElement('div')
    actions.className = 'tray-actions'
    actions.append(
      button('button icon', icon('pencil'), `Edit annotation ${index + 1}`, () => editAnnotation(annotation)),
      button('button icon', icon('trash'), `Delete annotation ${index + 1}`, () => removeAnnotation(annotation.id)),
    )
    row.append(body, actions)
  }

  function editAnnotation(annotation) {
    state.editing = { id: annotation.id, comment: annotation.comment, intent: annotation.intent }
    state.trayCollapsed = false
    renderTray()
    tray.querySelector('.tray-edit')?.scrollIntoView({ block: 'nearest' })
  }

  function renderTray() {
    if (state.editing && !state.annotations.some(annotation => annotation.id === state.editing.id)) state.editing = null
    tray.hidden = state.annotations.length === 0
    tray.replaceChildren()
    if (tray.hidden) return
    const list = document.createElement('div')
    list.className = 'tray-list'
    list.hidden = state.trayCollapsed
    state.annotations.forEach((annotation, index) => {
      const row = createElement('div', 'tray-row', list)
      createElement('div', 'tray-number', row).textContent = String(index + 1)
      if (state.editing?.id === annotation.id) renderEditRow(row, annotation)
      else renderViewRow(row, annotation, index)
    })
    tray.append(renderTrayHead(), list)
  }

  function render() {
    renderTray()
    renderMarkers()
  }

  function removeAnnotation(id) {
    state.annotations = state.annotations.filter(annotation => annotation.id !== id)
    saveAnnotations()
    render()
  }

  function clearAnnotations() {
    state.annotations = []
    state.editing = null
    saveAnnotations()
    render()
  }

  async function writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const scratch = createElement('textarea', '')
      scratch.value = text
      scratch.style.cssText = 'position:fixed;opacity:0;pointer-events:none;'
      scratch.select()
      const copied = document.execCommand('copy')
      scratch.remove()
      return copied
    }
  }

  async function copyPrompt() {
    if (!state.annotations.length) return
    const copied = await writeClipboard(globalThis.__pinpromptFormat(state.annotations))
    if (!copied) {
      showToast('Clipboard blocked — try again')
      return
    }
    state.copied = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      state.copied = false
      renderTray()
    }, COPIED_FEEDBACK_MS)
    renderTray()
  }

  function scheduleReposition() {
    if (frameRequest) return
    frameRequest = requestAnimationFrame(() => {
      frameRequest = 0
      positionCard()
      positionMarkers()
    })
  }

  function setSelecting(selecting) {
    state.selecting = selecting
    document.documentElement.style.cursor = selecting ? 'crosshair' : ''
    if (!selecting) closeCard()
    announceSelection(selecting)
    return selecting
  }

  function announceSelection(selecting) {
    try {
      extensionApi.runtime.sendMessage({ type: 'pinprompt:selection', selecting }).catch(() => {})
    } catch {}
  }

  document.addEventListener('pointermove', onPointerMove, true)
  window.addEventListener('pointerdown', onPointerDown, true)
  for (const type of ['mousedown', 'pointerup', 'mouseup', 'click', 'dblclick', 'auxclick']) {
    window.addEventListener(type, swallowPageClick, true)
  }
  window.addEventListener('keydown', onKeyDown, true)
  window.addEventListener('scroll', scheduleReposition, { capture: true, passive: true })
  window.addEventListener('resize', scheduleReposition, { passive: true })
  window.addEventListener('popstate', renderMarkers)
  window.addEventListener('hashchange', renderMarkers)
  setInterval(positionMarkers, 1000)

  render()

  globalThis.__pinprompt = {
    toggle: () => setSelecting(!state.selecting),
  }
})()
