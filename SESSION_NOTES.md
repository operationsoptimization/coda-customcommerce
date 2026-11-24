# Session notes: Codashop v2 Help Center revamp

Last updated: 2026-11-17. Branch: `codashop-v2`; last commit `f69955e WIP: homepage and category`.
Design source: `artifacts/codashop_help_center.dc.html` (gitignored), plus HTML snippets pasted in chat.

## Progress

| Page | Status | Template |
|---|---|---|
| Header / footer | Done | `templates/header.hbs`, `templates/footer.hbs` |
| Homepage (3 variants) | Done, accuracy-checked | `templates/home_page.hbs` |
| Category | Done, reviewed | `templates/category_page.hbs` |
| Section | Done, reviewed | `templates/section_page.hbs` |
| Article | Done (committed in 555c6b6) | `templates/article_page.hbs` |
| Search results | Built, **not yet previewed** (uncommitted) |
| No results | Built (same template, `{{else}}` branch), **not yet previewed** | `templates/search_results.hbs` |
| Submit request | Built, **not yet previewed** (form fields come from Zendesk; styled in `assets/styles/forms.css`) | `templates/new_request_page.hbs` |
| 404 | Built (other errors use Zendesk wording; most-read = promoted articles via API) | `templates/error_page.hbs` |
| All topics (custom page, `/hc/<locale>/p/all_topics`) | Built, **not yet previewed**; data from the HC API | `templates/custom_pages/all_topics.hbs` |
| Infobars | Built: 1 critical + 2 general, text from the dc key set per brand in settings critical_infobar_dc / general_infobar_1_dc / general_infobar_2_dc (defaults hc_-_critical_infobar etc., sheet rows 63–65), toggles show_warning_infobar_global / show_infobar_global / show_infobar_2_global, dismissed for the browser session | `templates/header.hbs` |

Uncommitted changes: search results page (`templates/search_results.hbs`, `assets/scripts/global.js`, `assets/styles/home.css`, built `style.css` / `script.js`). Planned commit format: `feat(1.3.0): …`.

## How things fit together

- **Homepage variant:** manifest setting `homepage_variant` = `codee` / `codee_whatsapp` / `search_only`. `search_only` also hides the Codee card and Druid on the category, section and article pages.
- **Styles:** Tailwind v4 + daisyUI 5, built by Vite (`npx vite build`). `assets/styles/home.css` holds the shared revamp pieces: buttons, `.hc-eyebrow`, search variants (`--card`, `--hero`, `--compact`), rows, the sidebar topic list, breadcrumbs. `assets/styles/article.css` styles the article body, the votes and related articles.
- **Zendesk helpers are styled, not replaced:** `{{search}}`, `{{breadcrumbs}}`, `{{vote}}`, `{{related_articles}}`.
- **Numbers inside dynamic content:** labels contain tokens such as `{count}`, `{topics}`, `{sections}`, `{articles}`, `{category}`, `{date}` and `{minutes}`. `global.js` fills them through `data-label` (plus `data-count` for numbers the template already knows). Anything the template can't provide comes from the Help Center API: homepage counts, the category "Other topics" list, the section "Sections in …" list. If a call fails, the block stays hidden or keeps its fallback text.
- **Search placeholder:** copied from `data-placeholder` on the `.hc-search` wrapper.

## Dynamic content

Source sheet: `17zYb3eMxCQCBjg9vBUVtkx2OKtQz7HBElh_IXO-fTlk`, tab "Help Center".
n8n workflow `ou3WDR71s0BH0Rt4` creates every row that has no ID yet and writes the new ID back to the sheet.
n8n workflow `WuscIFoA9V9hJgtO` (Support project, folder Reza) syncs the 31 non-English columns to those items: creates missing language variants and overwrites changed ones (sheet is master). Italian (Italy) is dropped. Placeholders like `{count}` must stay in English in every language.
Translations reviewed 2026-11-19 against the design wording: about 400 cells corrected in the "Help Center" tab (brand names kept in Latin script, placeholders, one term and one form of "you" per language, meaning fixes). "Translate HC" still holds the raw TranslateHTML() output: do not copy it over "Help Center" again. English "HC - How can we help" is now "How can we help?" (update the Zendesk English text by hand; the sync workflow skips English).

Rows 42–62 (search results, no results, submit request, all topics, 404) may not be created in Zendesk yet; run the workflow (it skips rows that already have an ID). Rows 42–45:
- HC - N results for query — `{count} results for “{query}”`
- HC - Sorted by relevance — `Sorted by relevance`
- HC - Not finding an answer — `Not finding an answer?`
- HC - Not finding an answer text — `Send us the details and our Customer Support will take a look.`

## Open items

- Preview the article page. Check:
  - the date format;
  - the related-articles heading text;
  - articles with no related articles (a fallback to the section's articles is an option);
  - old articles that contain tables or aligned images.
- The breadcrumb's first crumb on section and article pages uses Zendesk's help center name, which may not match "Help Center" on the category page.
- Check that the section page's article count renders, and that the compact search (`submit=false`) has no button.
- Manually edit the Zendesk item "HC - Privacy Policy" to read "Privacy policy".
- Update the sticky note in the n8n workflow (it still says rows 18–27).
- The user still needs to paste the mobile hero and Search-only homepage design for an accuracy check.
- `article-signup-steps.png` from the design is not in the repo.

## Working agreements

- Don't commit unless asked.
- Claude doesn't run `zcli themes:preview`; the user runs the preview (one preview per user).
- Read the sheet through the Google Sheets connector, not a web fetch. The user enters the Zendesk credentials.
