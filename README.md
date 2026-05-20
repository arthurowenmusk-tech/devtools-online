# DevTools Online

Free online developer tools — 100% client-side, no sign-up.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # output to ./dist/
```

## Tools

| Tool | Page | Component |
|------|------|-----------|
| 🛠️ JSON Tools | `/json-tools` | `JsonTools.vue` |
| 🔍 Diff Checker | `/diff-checker` | `DiffChecker.vue` |

More coming: Base64, URL encoder, UUID generator, regex tester.

## Tech Stack

- **Framework:** [Astro](https://astro.build) + [Vue 3](https://vuejs.org)
- **Hosting:** Cloudflare Pages (free tier)
- **Styling:** Vanilla CSS, no frameworks

## Project Structure

```
src/
├── pages/          # Astro pages (SSG)
│   ├── index.astro
│   ├── json-tools.astro
│   ├── diff-checker.astro
│   └── about/
├── components/     # Vue SFCs (hydrated on client)
│   ├── JsonTools.vue
│   └── DiffChecker.vue
├── layouts/
│   └── Layout.astro
└── content/        # Blog/review content (Astro collections)
```
