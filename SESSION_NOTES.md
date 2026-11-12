# Session notes: Codashop v2 Help Center revamp

Last updated: 2026-11-12. Branch: `codashop-v2`; last commit `f69955e WIP: homepage and category`.
Design source: `artifacts/codashop_help_center.dc.html` (gitignored), plus HTML snippets pasted in chat.

## Progress

| Page | Status | Template |
|---|---|---|
| Header / footer | Done | `templates/header.hbs`, `templates/footer.hbs` |
| Homepage (3 variants) | Done, accuracy-checked | `templates/home_page.hbs` |
| Category | Done, reviewed | `templates/category_page.hbs` |
| Section | Done, reviewed | `templates/section_page.hbs` |
| Article | Built, **not yet previewed** (uncommitted) | `templates/article_page.hbs` |
| Search results, no results | To do | `templates/search_results.hbs` |
| Submit request | To do | `templates/new_request_page.hbs` |
| 404 | To do | `templates/error_page.hbs` |
| All topics, infobar restyle | To do | — |

Uncommitted changes: section and article pages (templates, `assets/scripts/global.js`, `assets/styles/home.css`, `assets/styles/article.css`, built `style.css` / `script.js`). Planned commit format: `feat(1.3.0): …`.

## How things fit together

- **Homepage variant:** manifest setting `homepage_variant` = `codee` / `codee_whatsapp` / `search_only`. `search_only` also hides the Codee card and Druid on the category, section and article pages.
- **Styles:** Tailwind v4 + daisyUI 5, built by Vite (`npx vite build`). `assets/styles/home.css` holds the shared revamp pieces: buttons, `.hc-eyebrow`, search variants (`--card`, `--hero`, `--compact`), rows, the sidebar topic list, breadcrumbs. `assets/styles/article.css` styles the article body, the votes and related articles.
- **Zendesk helpers are styled, not replaced:** `{{search}}`, `{{breadcrumbs}}`, `{{vote}}`, `{{related_articles}}`.
- **Numbers inside dynamic content:** labels contain tokens such as `{count}`, `{topics}`, `{sections}`, `{articles}`, `{category}`, `{date}` and `{minutes}`. `global.js` fills them through `data-label` (plus `data-count` for numbers the template already knows). Anything the template can't provide comes from the Help Center API: homepage counts, the category "Other topics" list, the section "Sections in …" list. If a call fails, the block stays hidden or keeps its fallback text.
- **Search placeholder:** copied from `data-placeholder` on the `.hc-search` wrapper.

## Dynamic content

Source sheet: `17zYb3eMxCQCBjg9vBUVtkx2OKtQz7HBElh_IXO-fTlk`, tab "Help Center".
n8n workflow `ou3WDR71s0BH0Rt4` creates every row that has no ID yet and writes the new ID back to the sheet.

Rows 37–41 are not created in Zendesk yet; run the workflow:
- HC - N articles in section — `{count} articles in this section`
- HC - Sections in category — `Sections in {category}`
- HC - Back to category — `Back to {category}`
- HC - No articles in section — `No articles in this section yet.`
- HC - Article meta — `Updated {date} · {minutes} min read`

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
