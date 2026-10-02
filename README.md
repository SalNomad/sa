# Manasik Compass — Hajj & Umrah Guide

**Manasik Compass** is a static, accessible, multilingual educational guide for Hajj and Umrah. It is designed for GitHub Pages, phones, tablets and desktop browsers, with an offline-capable PWA shell.

## Current design

The application is intentionally **multi-page**, not one long page. Umrah and Hajj are separated so a pilgrim performing Umrah outside Hajj does not see Hajj-type or Hajj-day controls.

### Main pages

- `index.html` — calm home / journey chooser
- `umrah.html` — Umrah-only step-by-step guide
- `hajj.html` — Hajj-only guide, Hajj type and Hajj-day companion
- `tracker.html` — Tawaf and Sa'i tracker
- `places.html` — Makkah/Madinah/Hajj places directory and map links
- `emergency.html` — emergency numbers, optional coordinates, show-to-staff cards and pilgrim meeting card
- `accessibility.html` — light/dark theme and accessibility preferences
- `sources.html` — source list and editorial method
- `404.html` — GitHub Pages fallback page

All pages share `assets/css/styles.css`, `assets/js/i18n.js`, `assets/js/data.js` and `assets/js/app.js`.

## Features

- Separate Umrah and Hajj contexts
- Responsive desktop navigation and mobile bottom navigation
- Clearly labeled language selector with 18-language architecture
- Persistent **light and dark themes** using calm sage, ivory and sand tones
- Tawaf and Sa'i 7-count trackers stored locally
- Women/men guidance with differences shown only where relevant
- Emergency numbers, tap-to-call, optional on-device coordinates and Arabic show-to-staff cards
- Makkah, Madinah and Hajj-site cards with maps and evidence labels
- Explicit distinction between established Sunnah and historical significance
- Deaf/hard-of-hearing support: no auto-playing audio, all spoken content duplicated as visible text, visual status feedback, optional haptics, and a hearing-friendly mode that hides optional speak controls
- Blind/low-vision support: semantic structure, keyboard focus, screen-reader status updates, larger text, high contrast and optional text-to-speech
- Reduced-motion setting and support for `prefers-reduced-motion`
- PWA manifest and service worker caching all primary pages for offline use
- No analytics and no server upload of the pilgrim card or browser location

## Responsive behavior

The site uses fluid sizing and CSS breakpoints rather than fixed desktop dimensions.

- Desktop: horizontal navigation and full language/theme controls
- Tablet: simplified navigation plus an Explore sheet
- Phone: compact header plus a six-item bottom navigation dock
- RTL languages automatically switch document direction

Always test on at least one real iPhone/Safari and one Android/Chrome device before public launch.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this folder's contents to the repository root.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Open the published URL on a real phone and verify offline installation, calling links, map links, theme switching and language direction.
6. If you add a custom domain, update canonical/Open Graph URLs to the final HTTPS address.

The service worker is registered only over HTTP(S), so opening the HTML files directly from disk will not provide PWA/offline caching.

## Translation policy

The current locale list includes Arabic, English, Urdu, Indonesian, Turkish, Russian, German, Simplified Chinese, Hausa, French, Swahili, Malay, Bengali, Persian, Somali, Pashto, Chechen and Yoruba.

Religious wording should be reviewed by fluent human contributors. Locale status can be `full`, `core` or `fallback`; an incomplete language may intentionally show English detailed ritual content instead of presenting an unreviewed religious translation as authoritative.

“Nigerian” is not a single language, so Hausa and Yoruba are represented separately, in addition to English.

See `locales/TRANSLATION_GUIDE.md` and `locales/template.json` for contribution guidance.

## Content maintenance

Before each Hajj/Umrah season, re-check emergency/support numbers, Nusuk access rules, Haram/Rawdah routes, Hajj crowd-control and transport instructions, Ministry health guidance, and any operational map/gate information.

See `SOURCES.md` for evidence and source-maintenance notes.

## Privacy and safety

Counters, accessibility preferences and the pilgrim meeting card use browser `localStorage`. Geolocation is requested only when the user presses the location button. This application itself does not transmit those coordinates to a server.

Live signs, security staff, health professionals, crowd-control staff and an authorized Hajj organizer take priority over saved or offline operational guidance.

This is an independent educational project, not an official Saudi government service and not a substitute for qualified religious, medical or emergency advice.
