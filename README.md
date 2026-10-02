# Manasik Compass — Hajj & Umrah Guide

**Manasik Compass** is a static, accessible, multilingual educational guide for Hajj and Umrah. It is designed to work well on GitHub Pages and on low-connectivity mobile devices.

## Why this name?

The product name is short and distinctive, while the page title deliberately includes the high-intent search phrase **“Hajj & Umrah Guide”** and the Arabic **“دليل الحج والعمرة”**. Before registering a domain or trademark, run a fresh availability/trademark check in the countries where you plan to publish.

## Features

- Umrah and Hajj step-by-step modes
- Tawaf and Sa'i 7-count trackers stored locally
- Women/men guidance with differences shown only where relevant
- Emergency numbers, one-tap calling, and optional on-device coordinates
- Makkah, Madinah and Hajj-site cards with maps and evidence labels
- Explicit distinction between established Sunnah and historical significance
- Multilingual UI architecture: Arabic, English, Urdu, Indonesian, Turkish, Russian, German, Simplified Chinese, Hausa, French, Swahili, Malay, Bengali, Persian, Somali, Pashto, Chechen and Yoruba
- Translation-coverage notice when detailed content falls back to English
- Keyboard navigation, screen-reader semantics, text-to-speech, high contrast, large text and reduced-motion support
- Simple inline SVG signs rather than external image dependencies
- PWA manifest and a small service worker for offline caching
- No analytics and no server upload of the pilgrim card or location

## Project structure

```text
manasik-compass/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── SOURCES.md
└── assets/
    ├── css/styles.css
    ├── icons/favicon.svg
    ├── icons/social-card.svg
    └── js/
        ├── i18n.js
        ├── data.js
        └── app.js
```

## Publish on GitHub Pages

1. Create a new GitHub repository and upload this folder's contents to the repository root.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. After publishing, set the repository's website URL and test on a real phone.
5. If you add a custom domain, update your Open Graph/canonical metadata to the final HTTPS URL.

The service worker works on HTTPS/GitHub Pages. When opening `index.html` directly from disk, the site still works but offline installation/service-worker caching is not registered.

## Translation policy

Religious wording should be reviewed by fluent human contributors. `assets/js/i18n.js` marks language packs as `full`, `core`, or `fallback`. A fallback language is intentionally allowed to show English detailed ritual content rather than publishing an unreviewed religious translation.

“Nigerian” is not a single language, so the starter set includes **Hausa**, **Yoruba (fallback)** and English. Other Nigerian languages can be added as reviewed packs.

To add or improve a language:

1. Add/update the language metadata in `assets/js/i18n.js`.
2. Translate UI keys while preserving meaning, especially safety terms.
3. Add reviewed religious-detail translations in `assets/js/data.js` if you want full coverage.
4. Have a fluent speaker and a knowledgeable reviewer check the text before changing status to `full`.

## Content maintenance

Before each Hajj/Umrah season, re-check:

- emergency and support numbers;
- Nusuk permit/access rules;
- Haram/Rawdah entry and accessibility routes;
- Hajj transport/crowd-control instructions;
- Ministry health advice;
- any operational gate names shown in future versions.

See [SOURCES.md](SOURCES.md) for the current evidence list and editorial rule.

## Privacy and safety

The meeting card and counters are saved only with browser `localStorage`. Browser geolocation is requested only after the user presses the location button; coordinates are rendered locally and are not transmitted by this application. Clicking an external map or phone link hands the action to the user's device/service.

This is an independent educational project, not an official Saudi government service and not a substitute for qualified religious, medical or emergency advice.

## Phase 2 additions

- Calm low-saturation sage/sand visual system, while retaining a separate high-contrast accessibility mode.
- Hajj day companion for 8–13 Dhul-Hijjah, with automatic Umm al-Qura device-date detection and a manual override. The app explicitly tells users to confirm actual dates, movement windows and transport with their authorized organizer.
- Local readiness checklist for ID/Nusuk card, medicines, water, shade, power and group details.
- Optional in-page 20-minute wellbeing check (not a medical dosing reminder).
- Online/offline state plus installable PWA behavior when the browser supports installation.
- Wayfinding section with non-navigational schematic, common pictograms, official live-map link and large Arabic “show to staff” assistance cards with Arabic TTS.
- Service-worker cache bumped to v2 so GitHub Pages users receive the updated assets.

## Translation contributions

See `locales/TRANSLATION_GUIDE.md` and `locales/template.json`. Religious-content translations should be reviewed separately from ordinary interface copy before a locale is marked `full`.
