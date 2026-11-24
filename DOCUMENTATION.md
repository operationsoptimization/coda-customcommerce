# Coda Custom Commerce — Zendesk Help Center Theme

A customized Zendesk Guide (Help Center) theme used as a shared base for multiple
client-specific Help Centers (game titles and publishers under Coda Payments).
Built with Handlebars (Zendesk Curlybars), Tailwind CSS v4, daisyUI, and Vite.

- **Maintainer**: Operations Optimization team
- **Manifest version**: see [manifest.json](manifest.json) (`version` field)
- **API version**: Zendesk Theme API v3
- **Default locale**: `en-us`
- **Remote**: [codapaymentsadmin/coda-customcommerce](https://github.com/codapaymentsadmin/coda-customcommerce)

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Branching model](#branching-model)
5. [Prerequisites](#prerequisites)
6. [Getting started](#getting-started)
7. [Development workflow](#development-workflow)
8. [Build & preview](#build--preview)
9. [Theme settings (manifest)](#theme-settings-manifest)
10. [Styling system](#styling-system)
11. [Templates reference](#templates-reference)
12. [JavaScript reference](#javascript-reference)
13. [Translations](#translations)
14. [Deploying / publishing a theme](#deploying--publishing-a-theme)
15. [Versioning & commit conventions](#versioning--commit-conventions)
16. [Troubleshooting](#troubleshooting)

---

## Overview

This repository is the **single source of truth** for every Help Center theme
Operations Optimization ships to a Coda client. Each client (e.g. Call of Duty
Mobile, FC Mobile, Rainbow Six Mobile, Konami Master Duel, Yalla, TDR, etc.) is
represented as its **own long-lived git branch** that diverges from a shared
base. New base features land in the base branch and are cherry-picked or merged
into the per-client branches as needed.

The build pipeline compiles Tailwind/CSS and JS bundles into the two flat files
Zendesk requires at the theme root (`style.css` and `script.js`), while the
Handlebars templates, assets, settings and translations live in their canonical
folders.

---

## Tech stack

| Layer            | Tool / Library                                                  |
|------------------|-----------------------------------------------------------------|
| Templating       | [Handlebars](https://handlebarsjs.com/) (via Zendesk Curlybars) |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com/) + [daisyUI v5](https://daisyui.com/) |
| Bundler          | [Vite v6](https://vitejs.dev/)                                  |
| Icons            | [Phosphor Icons](https://phosphoricons.com/) (CDN)              |
| Package manager  | [pnpm](https://pnpm.io/) (v9.15.3, declared via `packageManager`) |
| Preview / deploy | [Zendesk CLI (`zcli`)](https://github.com/zendesk/zcli)         |
| Node runtime     | Node.js (LTS — 18+ recommended for Vite 6)                      |

Key dev-dependencies (see [package.json](package.json)):
`tailwindcss`, `@tailwindcss/cli`, `@tailwindcss/vite`, `@tailwindcss/postcss`,
`daisyui`, `autoprefixer`, `postcss`, `postcss-nested`, `vite`, `npm-run-all`,
`handlebars`.

---

## Project structure

```
coda-customcommerce/
├── assets/                       # Source assets (compiled by Vite / Tailwind CLI)
│   ├── fonts/                    # Scout font family (.otf source files)
│   ├── img/                      # Image assets referenced by templates
│   ├── scripts/                  # JS source — bundled into /script.js
│   │   ├── index.js              # Entry — imports global.js
│   │   └── global.js             # Header/nav/mobile-drawer/infobar/copyright
│   ├── styles/                   # CSS source — bundled into /style.css
│   │   ├── style.css             # Main stylesheet (Tailwind + daisyUI + base)
│   │   ├── variables.css         # CSS custom properties from manifest settings
│   │   ├── article.css           # Article-page specific styles
│   │   └── forms.css             # Form styles (new-request / contact)
│   ├── scout-black.{eot,svg,ttf,woff,woff2}  # Web-font build of Scout Black
│   └── ...
├── settings/                     # Default uploadable assets exposed in settings
│   ├── favicon.ico
│   ├── homepage_background_image.jpg
│   └── logo.svg
├── templates/                    # Handlebars (.hbs) — one per Zendesk page
│   ├── document_head.hbs         # <head> contents (icon CDN, meta)
│   ├── header.hbs                # Top infobar + navbar (shared)
│   ├── footer.hbs                # Footer (shared)
│   ├── home_page.hbs             # Help Center home
│   ├── category_page.hbs         # Category landing
│   ├── section_page.hbs          # Section landing (subsections + articles)
│   ├── article_page.hbs          # Article view
│   ├── search_results.hbs        # Search results
│   ├── new_request_page.hbs      # "Submit a request" form
│   ├── request_page.hbs          # Single ticket view
│   ├── requests_page.hbs         # User's tickets list
│   ├── subscriptions_page.hbs
│   ├── contributions_page.hbs
│   ├── user_profile_page.hbs
│   ├── error_page.hbs
│   ├── community_topic_list_page.hbs
│   ├── community_topic_page.hbs
│   ├── community_post_list_page.hbs
│   ├── community_post_page.hbs
│   └── new_community_post_page.hbs
├── translations/                 # One JSON per locale (37 locales)
│   ├── en-us.json                # Default locale (required)
│   └── ...
├── manifest.json                 # Theme metadata + settings schema
├── style.css                     # ⚙️ BUILD ARTIFACT — committed, uploaded to Zendesk
├── script.js                     # ⚙️ BUILD ARTIFACT — committed, uploaded to Zendesk
├── tailwind.config.js            # Tailwind content paths + daisyUI plugin
├── vite.config.mjs               # Vite bundler config (outputs script.js / style.css)
├── watch.mjs                     # File-watcher that triggers `vite build` on save
├── package.json
├── pnpm-lock.yaml
├── .gitignore                    # ignores node_modules
└── index.html                    # Placeholder for vite preview only
```

> **Important:** `style.css` and `script.js` at the repo root are **build
> artifacts** but they **are committed** — Zendesk loads them directly from the
> theme bundle. Always commit them along with your source changes (the watch
> script auto-generates them).

---

## Branching model

`master` holds the original baseline. Every client/project lives on its own
long-lived branch and is published as a separate Zendesk theme. New work is
done on the relevant client branch (or a feature branch off it).

| Branch            | Purpose                                                         |
|-------------------|-----------------------------------------------------------------|
| `master`          | Original baseline (rarely touched directly)                     |
| `v1`              | First-generation shared base theme                              |
| `v2`              | Second-generation shared base theme                             |
| `v3-publisher`    | v3 base for publisher clients                                   |
| `v3-gamevip`      | v3 base for "game VIP" tier clients (current working baseline)  |
| `codm`            | Call of Duty Mobile Help Center                                 |
| `fcmobile`        | EA FC Mobile Help Center                                        |
| `r6mobile`        | Rainbow Six Mobile Help Center                                  |
| `r6mobile-global` | Rainbow Six Mobile — global edition                             |
| `konami`          | Konami (e.g. Yu-Gi-Oh! Master Duel) Help Center                 |
| `tdr`             | TDR client Help Center                                          |
| `yalla`           | Yalla client Help Center                                        |
| `ottcommerce`     | OTT Commerce client Help Center                                 |

**Workflow guidelines**

1. Start a new client by branching from the closest base (usually `v3-gamevip`
   or `v3-publisher`).
2. Keep changes targeted: per-client branches should only contain that
   client's overrides (manifest settings, logos, copy, color tweaks).
3. When a fix is generic, land it in the relevant `v*` base branch and
   cherry-pick / merge into each client branch that needs it.
4. Tag releases informally through the commit message version prefix —
   see [Versioning & commit conventions](#versioning--commit-conventions).

---

## Prerequisites

Install these before getting started:

- **Node.js 18 LTS or newer** — [https://nodejs.org](https://nodejs.org)
- **pnpm 9.15.3+** — `npm install -g pnpm@9.15.3` (or use Corepack)
- **Zendesk CLI (`zcli`)** — `npm install -g @zendesk/zcli`
  ([install guide](https://github.com/zendesk/zcli))
- **Git** — any recent version

> The repo declares `pnpm@9.15.3+...` under `packageManager` in
> [package.json](package.json#L21). If you have Corepack enabled
> (`corepack enable`) the correct pnpm version is selected automatically.

You also need access to:
- The GitHub remote: `https://github.com/codapaymentsadmin/coda-customcommerce`
- The Zendesk subdomain you intend to preview against (for `zcli login`)

---

## Getting started

```bash
# 1. Clone the repo
git clone https://github.com/codapaymentsadmin/coda-customcommerce.git
cd coda-customcommerce

# 2. Check out the branch for the client you're working on
git checkout codm           # or fcmobile / r6mobile / konami / etc.

# 3. Install dependencies
pnpm install

# 4. Authenticate zcli against the target Zendesk subdomain (once per machine)
zcli login -i               # interactive login

# 5. Start the watcher (compiles assets on save)
pnpm run dev

# 6. In a second terminal, start the Zendesk preview server
pnpm run preview            # serves at http://localhost:8080
```

Open [http://localhost:8080](http://localhost:8080) and `zcli` will render the
theme against the live Zendesk Help Center content you're authenticated against.

---

## Development workflow

### Scripts (from [package.json](package.json#L5-L16))

| Script             | What it does                                                        |
|--------------------|---------------------------------------------------------------------|
| `pnpm dev`         | Runs `watch:js` and `watch:css` in parallel (recommended for dev)   |
| `pnpm watch`       | Same as `dev`                                                       |
| `pnpm watch:js`    | `node watch.mjs` — watches `assets/scripts` & `assets/styles` and triggers `vite build` on each change |
| `pnpm watch:css`   | `@tailwindcss/cli` in watch mode → emits `style.css`                |
| `pnpm watch:vite`  | Pure `vite --watch` (alt to `watch:js`)                             |
| `pnpm dev:vite`    | Starts Vite dev server (for previewing `index.html` only, not Zendesk) |
| `pnpm build`       | One-shot production build: `vite build`                             |
| `pnpm build:css`   | One-shot minified CSS build (Tailwind CLI)                          |
| `pnpm serve`       | `vite preview` (standalone Vite preview)                            |
| `pnpm preview`     | `zcli themes:preview --port 8080` — **the real Zendesk preview**    |

### File-watcher behaviour

[watch.mjs](watch.mjs) watches `./assets/scripts` and `./assets/styles`. On any
change it runs `vite build`, which writes:

- `./script.js` ← bundled from `assets/scripts/index.js`
- `./style.css` ← compiled from `assets/styles/style.css`

A simple in-flight queue (`building` / `queued` flags) prevents overlapping
builds and ensures the latest change is always rebuilt last.

### Typical change loop

1. Edit a `.hbs` template, `assets/scripts/*.js`, `assets/styles/*.css`, or
   `manifest.json`.
2. Save the file.
3. The watcher rebuilds within ~1 second; `zcli themes:preview` hot-reloads
   the browser.
4. Verify the change in the browser, including responsive breakpoints and at
   least one non-`en-us` locale (translations live in `translations/`).

---

## Build & preview

### Building for upload

```bash
pnpm run build       # vite build — emits ./script.js and ./style.css
```

Vite is configured in [vite.config.mjs](vite.config.mjs) to:

- Output to the project root (`outDir: "./"`)
- Take `./assets/scripts/index.js` → emit as `script.js`
- Take `./assets/styles/style.css` → emit as `style.css`
- Skip watching the output files themselves and `node_modules` (avoids loops)
- Apply Tailwind v4 (`@tailwindcss/vite`), `autoprefixer`, and `postcss-nested`

### Previewing with zcli

```bash
pnpm run preview           # runs `zcli themes:preview --port 8080`
```

`zcli themes:preview` packages the current working directory as a theme and
serves it against the live Help Center you're logged into. It picks up changes
to templates and translations live; for `style.css` / `script.js`, make sure
the watcher (or a manual `pnpm build`) has run.

> If you have not previously authenticated, run `zcli login -i` and follow the
> prompts. Tokens are stored locally per-subdomain.

---

## Theme settings (manifest)

[manifest.json](manifest.json) declares all admin-configurable settings exposed
in **Zendesk Guide → Theming → Customize**. Each setting is referenced from
templates as `{{settings.<identifier>}}` and from CSS via the `$identifier`
token (substituted at theme-package time).

### Setting groups

| Group              | Examples (identifier)                                           |
|--------------------|-----------------------------------------------------------------|
| `brand_group_label`     | `logo`, `show_brand_name`, `brand_name`, `favicon`, `codashop_link` |
| `infobar_group_label`   | `show_infobar_global`, `show_warning_infobar_global`, `infobar_bg_color`, `infobar_text_color`, `critical_infobar_bg_color`, `critical_infobar_text_color` |
| `colors_group_label`    | `brand_color`, `brand_text_color`, `text_color`, `link_color`, `hover_link_color`, `visited_link_color`, `background_color`, `navbar_background_color`, `footer_background_color`, `accordion_background_color`, `accordion_text_color`, `cta_text_color`, `banner_text_color` |
| `fonts_group_label`     | `heading_font`, `text_font` (list — system fonts + Scout Black) |
| `images_group_label`    | `homepage_background_image`                                     |
| `footer_group_label`    | `terms_link`, `privacy_link`, `show_copyright`, `copyright_text` |

### Per-client overrides

Per-client branches typically change manifest **default values** (logo,
brand name, link URLs, color palette) rather than the schema itself. If you
need to add a new setting, prefer adding it to the relevant `v*` base branch
first so all client branches can inherit it on the next merge.

---

## Styling system

### Layered CSS

[assets/styles/style.css](assets/styles/style.css) is the canonical entry. It:

1. Imports `./variables.css` (CSS custom properties bound to manifest settings).
2. Imports `tailwindcss` and registers the `daisyui` plugin.
3. Declares the `@font-face` for the bundled **Scout Black** font.
4. Declares the `@theme { … }` block, mapping manifest tokens to CSS variables
   (e.g. `--color-brand: $brand_color;`). Zendesk substitutes `$brand_color`
   with the admin-chosen value at render time.
5. Imports `./article.css` and `./forms.css` for page-specific styling.
6. Sets the global typography, headings, and resets.

### Tailwind v4

[tailwind.config.js](tailwind.config.js) restricts content scanning to
`.hbs`, `.js`, and `.css` files under the relevant folders, and registers
`daisyui` plus `@tailwindcss/line-clamp`. daisyUI is locked to the `light`
theme to play nicely with Zendesk's color overrides.

### Custom color tokens

Templates use semantic Tailwind utilities like `bg-navbar-bg`, `text-brand-text`,
`bg-crit-infobar-bg`, etc. These map back to CSS custom properties defined in
`variables.css` / the `@theme` block, which themselves resolve to manifest
setting values.

---

## Templates reference

All page templates live in [templates/](templates/) and use Zendesk
Curlybars (a Handlebars superset). See the
[Zendesk theme templates docs](https://developer.zendesk.com/api-reference/help_center/help-center-templates/templates/)
for the full helper catalogue.

Common patterns in this theme:

| Helper / pattern               | Used for                                              |
|--------------------------------|-------------------------------------------------------|
| `{{settings.<key>}}`           | Reading manifest settings                             |
| `{{dc 'translation_key'}}`     | Dynamic content (custom translation key)              |
| `{{t 'native_key'}}`           | Built-in Zendesk translation key                      |
| `{{page_path 'help_center'}}`  | URL builder for a Zendesk page                        |
| `{{#if alternative_locales}}`  | Renders only if the HC supports multiple locales      |
| `{{search instant=true ...}}`  | Renders the Zendesk search box                        |
| `{{#is id ../article.id}}`     | Comparison helper (used for active sidebar link)      |
| `{{#compare x ">" 0}}`         | Numeric comparisons                                   |

### Shared layout

- [templates/header.hbs](templates/header.hbs) — top infobar (general + critical
  variants, toggled via manifest checkboxes) and the navbar (logo, dynamic
  Contact/Help-Center link, Visit Codashop store link, locale switcher, mobile drawer).
- [templates/footer.hbs](templates/footer.hbs) — brand name + dynamic copyright
  year (populated by `assets/scripts/global.js`) and Privacy / Terms links.
- [templates/document_head.hbs](templates/document_head.hbs) — viewport meta +
  Phosphor Icons regular + fill stylesheets from jsDelivr.

---

## JavaScript reference

### Entrypoint

[assets/scripts/index.js](assets/scripts/index.js) imports the two modules
below; the bundle is emitted as `/script.js`.

### `global.js`

[assets/scripts/global.js](assets/scripts/global.js) — runs on every page:

- Forces `data-theme="light"` on `<html>` (locks daisyUI to the light theme).
- Exposes `window.zendeskTranslations` with frequently-used translations.
- On `DOMContentLoaded`:
  - Toggles the mobile hamburger drawer.
  - Sets the dynamic copyright year (`<span class="copyright">`).
  - Wires up the infobar dismiss button.
  - Rewrites the **dynamic Contact / Help Center link** in the navbar based on
    current path: if you're on `/requests/new` it points back to Help Center,
    otherwise it points to the new-request form.

---

## Translations

[translations/](translations/) holds one JSON file per supported locale.
37 locales ship by default, including `en-us` (default), `ar`, `de`, `es-es`,
`fr`, `ja`, `ko`, `pt-br`, `th`, `zh-cn`, `zh-tw`, etc.

Each file is a flat key→string map. Templates reference keys via:

- `{{dc 'key'}}` — preferred for theme-specific copy (added by us)
- `{{t 'key'}}` — Zendesk built-in keys

When adding a new translation key:

1. Add it to **every** locale file (at minimum to `en-us.json`).
2. Reference it from the relevant template.
3. Re-run the watcher and verify in the browser.

---

## Deploying / publishing a theme

There are two common paths:

### A. Update an existing live theme

```bash
pnpm run build               # ensure style.css / script.js are fresh
zcli themes:update           # pushes current dir to the live theme it was preview-linked to
```

### B. Publish a brand-new theme

```bash
pnpm run build
zcli themes:publish          # creates a new theme entry in Zendesk Guide
```

See the [zcli themes commands](https://github.com/zendesk/zcli/blob/main/docs/themes.md)
for additional flags (`--subdomain`, `--theme-id`, etc.).

> **Always commit the regenerated `style.css` and `script.js`** before pushing
> a theme — they are the canonical artifacts uploaded to Zendesk.

---

## Versioning & commit conventions

The commit history follows a pragmatic conventional-commits flavour:

- `feat(<version>): <description>` — new feature
- `fix(<version>): <description>` — bug fix
- `fix: <description>` — quick patch (no version bump)
- `init: <description>` — branch initialization
- `init commit <client> theme` — first commit on a new client branch

The `<version>` segment (e.g. `1.2.3`) is informal and should match
`manifest.json`'s `version` field when you bump it. Examples from history:

- `feat(1.3): dynamic content`
- `fix(1.3.2): Navbar link wording translation JP`
- `fix(1.0.1): header and footer`
- `init: publish init v3-gamevip theme`

When bumping versions:

1. Edit `version` in [manifest.json](manifest.json#L4).
2. Commit with the matching prefix.
3. If the change should propagate to sibling client branches, cherry-pick or
   merge explicitly — there is no automation for this.

---

## Troubleshooting

| Symptom                                                  | Likely cause / fix                                          |
|----------------------------------------------------------|-------------------------------------------------------------|
| `style.css` doesn't update on save                       | `watch:css` not running — start `pnpm dev`                  |
| `script.js` doesn't update on save                       | `watch:js` not running — start `pnpm dev`                   |
| `zcli themes:preview` errors with auth failure           | Run `zcli login -i` against the right subdomain             |
| Tailwind classes not applied in production               | Class isn't in a scanned path — check `tailwind.config.js` `content` |
| Manifest setting doesn't appear in Zendesk admin         | Did you upload the new manifest? Re-run `zcli themes:update`|
| Wrong locale shows English                               | Missing translation key in that locale's JSON               |
| Mobile drawer toggle does nothing                        | JS bundle stale — re-run `pnpm build`                       |
| Build hangs on save                                      | Check `watch.mjs` console output; kill orphaned `vite` PIDs |

---

## Useful links

- Zendesk theme template docs: <https://developer.zendesk.com/api-reference/help_center/help-center-templates/templates/>
- Zendesk Curlybars helpers: <https://github.com/zendesk/curlybars>
- zcli docs: <https://github.com/zendesk/zcli>
- Tailwind CSS v4: <https://tailwindcss.com/docs>
- daisyUI: <https://daisyui.com/>
- Phosphor Icons: <https://phosphoricons.com/>
