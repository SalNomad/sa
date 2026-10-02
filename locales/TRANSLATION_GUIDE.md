# Translation contribution guide

Manasik Compass separates **interface translation** from **religious-content review**. A fluent translation is not automatically a reviewed religious translation.

## Locale status

- `full`: interface and core religious text reviewed.
- `core`: navigation/safety coverage exists; detailed ritual text may fall back to English.
- `fallback`: language appears in the selector, but unreviewed strings intentionally fall back to English.

## Review workflow

1. Translate the interface naturally; avoid machine-literal wording.
2. Preserve Arabic names where they are standard, with a local-language explanation where helpful.
3. Do not add rulings, virtues, duas, restrictions, or historical claims that are not present in the source text.
4. Check every religious-content change against `SOURCES.md`.
5. Have a second fluent reviewer check meaning, then a qualified religious reviewer check sensitive ritual wording before changing the locale status to `full`.
6. Keep emergency numbers unchanged. Operational instructions must remain clearly subordinate to current official signage/staff directions.

Use `template.json` as a contributor checklist. The runtime currently lives in `assets/js/i18n.js`; JSON locale loading can be introduced later without changing the UI.
