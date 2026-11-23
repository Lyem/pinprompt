;(() => {
  const INLINE_TEXT_MAX_LENGTH = 2048

  function inlineText(content, maxLength = INLINE_TEXT_MAX_LENGTH) {
    return String(content ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
  }

  function longestBacktickRun(content) {
    let longest = 0
    let current = 0
    for (const char of content) {
      current = char === '`' ? current + 1 : 0
      if (current > longest) longest = current
    }
    return longest
  }

  function inlineCode(content) {
    const text = String(content ?? '')
    const marker = '`'.repeat(longestBacktickRun(text) + 1)
    const padding = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
    return `${marker}${padding}${text}${padding}${marker}`
  }

  function pageHeading(url) {
    try {
      const parsed = new URL(url)
      return `${parsed.pathname}${parsed.search}`
    } catch {
      return url || 'current page'
    }
  }

  function elementLabel(target) {
    const tag = target?.tagName || 'element'
    if (target?.accessibleName) return `${tag} "${inlineText(target.accessibleName)}"`
    if (target?.text) return `${tag} "${inlineText(target.text).slice(0, 60)}"`
    return tag
  }

  function annotationLines(annotation, index) {
    const target = annotation.target || {}
    const lines = [
      `### ${index + 1}. ${elementLabel(target)}`,
      `**Intent:** ${annotation.intent || 'change'}`,
      `**Selector:** ${inlineCode(target.selector || '')}`,
    ]
    if (target.source) lines.push(`**Source:** ${inlineText(target.source)}`)
    if (target.text) lines.push(`**Text:** "${inlineText(target.text)}"`)
    lines.push(`**Feedback:** ${inlineText(annotation.comment)}`, '')
    return lines
  }

  function formatAnnotationsAsMarkdown(annotations) {
    if (!annotations?.length) return ''
    const groups = new Map()
    annotations.forEach((annotation, index) => {
      const entries = groups.get(annotation.url) || []
      entries.push({ annotation, index })
      groups.set(annotation.url, entries)
    })
    const mixedPages = groups.size > 1
    const lines = mixedPages
      ? ['## Design Feedback across pages', '']
      : [`## Design Feedback: ${pageHeading(annotations[0].url)}`, '', `**URL:** ${annotations[0].url}`, '']
    for (const [url, entries] of groups) {
      if (mixedPages) lines.push(`## Design Feedback: ${inlineText(pageHeading(url))}`, '', `**URL:** ${inlineCode(inlineText(url))}`, '')
      for (const { annotation, index } of entries) lines.push(...annotationLines(annotation, index))
    }
    return lines.join('\n').trimEnd()
  }

  globalThis.__pinpromptFormat = formatAnnotationsAsMarkdown
})()
