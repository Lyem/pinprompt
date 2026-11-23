;(() => {
  const SANS = `"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const MONO = `"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace`
  const BACKGROUND = '#0a0a0a'
  const FOREGROUND = '#f0f0f0'
  const POPOVER = '#171717'
  const PRIMARY = '#e5e5e5'
  const PRIMARY_FOREGROUND = '#171717'
  const MUTED = '#262626'
  const MUTED_FOREGROUND = '#acacac'
  const ACCENT = '#404040'
  const BORDER = 'rgba(255,255,255,.07)'
  const INPUT = 'rgba(255,255,255,.15)'
  const RING = '#737373'
  const MARKER = '#2563eb'
  const SHADOW = '0 10px 24px rgba(0,0,0,.18)'

  globalThis.__pinpromptCss = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: ${SANS}; }
    button { font: inherit; color: inherit; }
    svg { display: block; flex: none; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .highlight {
      position: fixed; display: none; pointer-events: none;
      border: 2px solid rgba(255,255,255,.9); border-radius: 3px;
      background: rgba(255,255,255,.08);
      box-shadow: 0 0 0 1px rgba(0,0,0,.3), 0 2px 8px rgba(0,0,0,.15);
      transition: all .05s ease-out;
    }
    .hover-label {
      position: fixed; display: none; pointer-events: none; max-width: 300px;
      padding: 3px 8px; border-radius: 4px; background: rgba(30,30,30,.92); color: #e5e5e5;
      font: 11px/1.4 -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      white-space: pre; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 2px 8px rgba(0,0,0,.3);
    }

    .marker {
      position: fixed; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
      border-radius: 9999px; border: 1px solid rgba(255,255,255,.95); background: ${MARKER}; color: #fff;
      font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: ${SHADOW}; pointer-events: auto; cursor: pointer; user-select: none;
    }

    .card {
      position: fixed; width: 22rem; max-width: calc(100vw - 24px); padding: 12px; pointer-events: auto;
      background: ${POPOVER}; color: ${FOREGROUND}; border: 1px solid ${BORDER}; border-radius: 6px;
      box-shadow: ${SHADOW}; animation: pop-in .15s ease-out;
    }
    @keyframes pop-in { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: none; } }
    .card-target { display: flex; align-items: center; gap: 6px; min-width: 0; margin-bottom: 8px; }
    .tag-chip {
      flex: none; padding: 2px 4px; border-radius: 4px; background: ${MUTED}; color: ${MUTED_FOREGROUND};
      font-family: ${MONO}; font-size: 10px; line-height: 1;
    }
    .card-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 500; }
    textarea {
      display: block; width: 100%; resize: none; border: 1px solid ${INPUT}; border-radius: 6px;
      background: ${BACKGROUND}; color: ${FOREGROUND}; caret-color: ${FOREGROUND}; outline: none;
    }
    textarea::placeholder { color: ${MUTED_FOREGROUND}; }
    textarea:focus-visible { box-shadow: 0 0 0 2px ${POPOVER}, 0 0 0 4px ${RING}; }
    .card textarea { height: 96px; padding: 8px 12px; font-size: 14px; line-height: 20px; }
    .intent { display: flex; height: 32px; margin-top: 8px; }
    .intent button {
      flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 8px;
      border: 1px solid ${INPUT}; background: transparent; color: ${MUTED_FOREGROUND};
      font-size: 12px; font-weight: 500; cursor: pointer; transition: background .12s, color .12s;
    }
    .intent button + button { border-left: 0; }
    .intent button:first-child { border-radius: 6px 0 0 6px; }
    .intent button:last-child { border-radius: 0 6px 6px 0; }
    .intent button:hover { background: ${ACCENT}; color: ${FOREGROUND}; }
    .intent button[aria-checked="true"] { background: rgba(240,240,240,.1); border-color: rgba(240,240,240,.2); color: ${FOREGROUND}; }
    .intent svg { width: 14px; height: 14px; }
    .card-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }

    .button {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 32px; padding: 0 12px; border: 1px solid transparent; border-radius: 6px; cursor: pointer;
      font-size: 14px; font-weight: 500; transition: background .12s, color .12s;
    }
    .button svg { width: 14px; height: 14px; }
    .button:disabled { opacity: .5; cursor: default; pointer-events: none; }
    .button:focus-visible, .intent button:focus-visible, .tray-toggle:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(115,115,115,.5); }
    .button.ghost { background: transparent; color: ${FOREGROUND}; }
    .button.ghost:hover { background: ${ACCENT}; }
    .button.primary { background: ${PRIMARY}; color: ${PRIMARY_FOREGROUND}; }
    .button.primary:hover { background: rgba(229,229,229,.9); }
    .button.outline { background: ${BACKGROUND}; border-color: ${INPUT}; color: ${FOREGROUND}; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .button.outline:hover { background: ${ACCENT}; }
    .button.small { height: 24px; padding: 0 8px; font-size: 12px; }
    .button.small svg { width: 12px; height: 12px; }
    .button.icon { width: 24px; height: 24px; padding: 0; background: transparent; color: ${MUTED_FOREGROUND}; }
    .button.icon:hover { background: ${ACCENT}; color: ${FOREGROUND}; }
    .button.icon svg { width: 12px; height: 12px; }
    .shortcut {
      display: inline-flex; align-items: center; gap: 2px; margin-left: 4px; padding: 2px 6px;
      border: 1px solid rgba(23,23,23,.2); border-radius: 4px; font-size: 10px; line-height: 1; opacity: .8;
    }
    .shortcut svg { width: 12px; height: 12px; }

    .tray {
      position: fixed; right: 12px; bottom: 12px; display: flex; flex-direction: column; overflow: hidden;
      width: min(20rem, calc(100vw - 24px)); max-height: 45vh; pointer-events: auto;
      background: ${POPOVER}; color: ${FOREGROUND}; border: 1px solid ${BORDER}; border-radius: 8px; box-shadow: ${SHADOW};
    }
    .tray[hidden] { display: none; }
    .tray-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; }
    .tray-toggle {
      display: flex; flex: 1; min-width: 0; align-items: center; gap: 8px; padding: 0;
      border: 0; border-radius: 2px; background: transparent; cursor: pointer; text-align: left;
      font-size: 14px; font-weight: 500;
    }
    .tray-toggle svg { width: 16px; height: 16px; color: ${MUTED_FOREGROUND}; }
    .tray-list { flex: 1; min-height: 0; overflow: auto; padding: 6px; border-top: 1px solid ${BORDER}; scrollbar-width: thin; }
    .tray-list[hidden] { display: none; }
    .tray-row { display: flex; gap: 8px; padding: 6px 8px; border-radius: 6px; font-size: 12px; line-height: 16px; }
    .tray-row:hover, .tray-row:focus-within { background: ${ACCENT}; }
    .tray-number {
      flex: none; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; margin-top: 2px;
      border-radius: 9999px; background: ${PRIMARY}; color: ${PRIMARY_FOREGROUND}; font-size: 10px; font-weight: 600;
    }
    .tray-body { flex: 1; min-width: 0; }
    .tray-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
    .tray-comment {
      margin-top: 2px; color: ${MUTED_FOREGROUND}; white-space: pre-wrap; overflow: hidden;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .tray-meta { display: flex; gap: 6px; min-width: 0; margin-top: 4px; font-size: 11px; color: ${MUTED_FOREGROUND}; }
    .tray-meta .page { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tray-actions { display: flex; flex: none; align-items: flex-start; gap: 2px; }
    .tray-actions .button { opacity: 0; transition: opacity .12s; }
    .tray-row:hover .tray-actions .button, .tray-row:focus-within .tray-actions .button { opacity: 1; }
    .tray-edit textarea { height: 64px; padding: 6px 8px; font-size: 12px; line-height: 16px; }
    .tray-edit .intent { height: 28px; margin-top: 6px; }
    .tray-edit .intent button { font-size: 11px; gap: 4px; padding: 0 6px; }
    .tray-edit .intent svg { width: 12px; height: 12px; }
    .tray-edit-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; }

    .toast {
      position: fixed; top: 12px; right: 12px; padding: 4px 10px; border-radius: 6px; pointer-events: none;
      border: 1px solid ${BORDER}; background: rgba(23,23,23,.95); color: ${FOREGROUND};
      font-size: 12px; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,.05);
      opacity: 0; transition: opacity .3s ease-out;
    }
    .toast.visible { opacity: 1; }

    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: .001ms !important; transition-duration: .001ms !important; }
    }
  `
})()
