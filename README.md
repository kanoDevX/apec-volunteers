# APEC Volunteers

A single-page volunteer application site for APEC Petrotechnic Higher College (Atyrau, Kazakhstan). Students fill out a short application form; submissions are emailed directly to the team, no backend required.

Live site: [apecvolunteers.netlify.app](https://apecvolunteers.netlify.app)

## Tech stack

- [Vite](https://vitejs.dev) — build tool / dev server
- [Tailwind CSS v4](https://tailwindcss.com) — styling, theme defined via `@theme` in `src/style.css`
- Vanilla JavaScript — no framework
- [Web3Forms](https://web3forms.com) — free form-to-email delivery, no backend

## Getting started

```bash
npm install
npm run dev
```

Opens the dev server at `http://localhost:5173`.

## Building for production

```bash
npm run build
```

Outputs a static site to `dist/`. That folder is what gets deployed.

## Project structure

```
index.html          Page markup, all copy tagged with data-i18n keys
src/
  main.js           Interactivity: nav, accordion, form validation & submit
  i18n.js           Translations (EN/RU/KK) and language switching
  style.css         Tailwind import, theme tokens, animations
public/
  logo-icon.png     Cropped, transparent logo mark (header/hero/footer)
  logo-full.png     Original logo file, kept as-is
```

## Languages

The site supports English, Russian, and Kazakh. Translations live in `src/i18n.js` as a flat key-value dictionary per language, applied to any element with a `data-i18n` / `data-i18n-placeholder` attribute. Language is auto-detected from the browser, remembered in `localStorage`, and switchable via the RU / KZ / EN buttons in the header.

## Form submissions (email delivery)

The application form posts to [Web3Forms](https://web3forms.com), which forwards each submission by email — no server needed. Configuration lives in `src/main.js`:

```js
const WEB3FORMS_ACCESS_KEY = '...'
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const NOTIFY_EMAIL = '...'
```

If `WEB3FORMS_ACCESS_KEY` is ever blank, submissions just log to the console instead of failing — useful for local testing without spending real quota.

The notification inbox is configured on the Web3Forms dashboard (Settings → Notification Email) under the access key's form, not in the code.

## Deploying

The site is static — any static host works. Currently deployed via **Netlify** (manual drag-and-drop, not git-connected):

1. `npm run build`
2. Log in at [app.netlify.com](https://app.netlify.com)
3. Open the **apecvolunteers** site → **Deploys** tab
4. Drag the `dist/` folder onto the deploy area

This publishes a new version to the same `apecvolunteers.netlify.app` URL.

## Notes

- Spam protection: a hidden honeypot field (`company`) silently discards bot submissions.
- The Web3Forms access key is visible in the client-side bundle by design — that's how the service works (it only allows *sending* to the configured form, not reading anything).

## License

[MIT](LICENSE)
