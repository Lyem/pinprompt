# Pinprompt

[🇺🇸 English](README.md) · 🇧🇷 Português

Extensão para Chrome e Firefox que transforma elementos da página em um prompt pronto para colar no Claude, ChatGPT ou qualquer outra IA. Funciona em qualquer site e não usa servidor.

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Get%20the%20add--on-FF7139?logo=firefoxbrowser&logoColor=white)](https://addons.mozilla.org/firefox/addon/pinprompt/)

## Uso

1. Clique no ícone da extensão (ou `Alt+Shift+P`). O ícone mostra **ON** e a seleção liga.
2. Passe o mouse e clique no elemento. Escreva o que quer mudar, escolha **Change** ou **Question** e clique em **Add** (`Ctrl+Enter`).
3. Repita para outros elementos. Cada um ganha um marcador azul numerado.
4. Na bandeja do canto inferior direito, clique em **Copy** e cole na IA.
5. Clique no ícone de novo (ou `Esc`) para desligar a seleção.

As anotações ficam salvas na aba até ela ser fechada. Dá para editar, excluir ou limpar tudo pela bandeja.

## Formato copiado

```markdown
## Design Feedback: /settings

**URL:** http://localhost:5173/settings

### 1. button "Save"
**Intent:** change
**Selector:** `#save`
**Text:** "Save changes"
**Feedback:** Make this button bigger
```

## Instalar

**Chrome / Chromium / Helium:** `chrome://extensions` → ative o modo do desenvolvedor → **Carregar sem compactação** → escolha esta pasta.

**Firefox (142+):** instale pela [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/pinprompt/). Para desenvolvimento, rode `npm run build:firefox`, depois `about:debugging#/runtime/this-firefox` → **Carregar extensão temporária** → escolha `dist/firefox/manifest.json`. Para gerar o `.zip`: `npm run package:firefox`.

## Publicar

```sh
npm run package
```

Gera `dist/pinprompt-chrome-<versão>.zip` (Chrome Web Store) e `dist/pinprompt-firefox-<versão>.zip` (addons.mozilla.org). O ícone fonte fica em `icons/source/`.

## Desenvolvimento

```sh
npm test
npm run lint:firefox
```

Estrutura:

- `manifest.json`: manifest MV3 do Chrome. O Firefox usa uma cópia gerada em `dist/firefox` por `scripts/build-firefox.mjs`, que troca o `service_worker` por `scripts` e adiciona o id do Gecko.
- `src/background.js`: injeta o overlay na aba ao clicar no ícone e mostra o badge.
- `src/content/overlay.js`: seleção, card, marcadores e bandeja.
- `src/content/format.js`: gera o Markdown.
- `src/content/styles.js`: estilos do overlay (shadow DOM).

## Créditos

O formato do prompt e a lógica de anotação foram adaptados do [Orca](https://github.com/stablyai/orca) (MIT, Lovecast Inc.). Veja `LICENSE`.
