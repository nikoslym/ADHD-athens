# ADHD Athens — Website

A premium, bilingual (EN/ΕΛ) static website for the ADHD Athens clinic, built around a
proprietary **Focus Mode** design system optimized for visitors with ADHD.

## Preview

No build step required. From this folder run:

```bash
python3 -m http.server 8741
```

then open http://localhost:8741 — or simply open `index.html` in a browser.

## Pages

| File              | Content                                                        |
|-------------------|----------------------------------------------------------------|
| `index.html`      | Homepage: hero, pathway, services, why-us, team, testimonials, FAQ, final CTA |
| `about.html`      | Philosophy + full team with expandable bios                    |
| `assessment.html` | The 4-step assessment journey + multidisciplinary process      |
| `services.html`   | Treatment hub: medication, coaching, psychotherapy, groups, mindfulness (sticky focus nav) |
| `adhd.html`       | What is ADHD? + full FAQ accordion                             |
| `contact.html`    | Booking form + contact details                                 |

## Language

Both languages live in the same HTML (`.en` / `.el` spans). The header toggle switches
`data-lang` on `<html>` and persists the choice in `localStorage`.
You can force a language with `?lang=el` or `?lang=en` in any URL.

## Placeholders to replace before launch

- **Phone**: `+30 210 000 0000` (appears in footers, CTA and contact page)
- **Email**: `info@adhdathens.gr`
- **Address / opening hours** on `contact.html`
- **Testimonials** on `index.html` are illustrative — replace with real, consented quotes
  (check Greek regulations on patient testimonials for medical services)
- **Form handling**: the booking form currently uses a `mailto:` action — wire it to a real
  endpoint (e.g. Formspree, Netlify Forms, or a booking system) before launch
- The stat “35+ years combined experience” — confirm with the team

## Structure

```
website/
├── index.html / about.html / assessment.html / services.html / adhd.html / contact.html
├── css/styles.css      ← Focus Mode design system (tokens, components, motion)
├── js/main.js          ← reveals, counters, accordion, slider, scrollspy, language toggle
└── assets/
    ├── logo/           ← brand SVGs
    └── img/            ← web-optimized photos (originals in ../Photos)
```

## Accessibility & performance

- WCAG-minded: skip links, focus states, aria states on all interactive components,
  `prefers-reduced-motion` fully supported
- All graphics are inline SVG; photos are resized/compressed for the web
- No frameworks or dependencies — two Google Fonts (Commissioner + Inter, both with Greek support)
