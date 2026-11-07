# Dmitrii Orlov — Personal Site

A responsive personal portfolio for Dmitrii Orlov, built with plain HTML, CSS, and JavaScript. The animated background is drawn on a canvas; there is no build step or framework dependency.

## Run locally

Serve the repository root with any static web server. For example, with Python:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project files

- `index.html` — page content, metadata, links, and analytics configuration
- `static/style.css` — layout, responsive styles, and visual design
- `static/main.js` — canvas background, pointer parallax, and analytics click events
- `static/favicon.svg` — DO monogram favicon
- `CNAME` — GitHub Pages custom domain (`www.dmitriiorlov.com`)

The canvas animation respects the operating system's reduced-motion preference.

## Analytics

Google Analytics is configured in `index.html`. Add `data-analytics-event="event_name"` to a link or button to report that click as a named event. Current events include contact, GitHub, App Store, and Google Play clicks. Analytics requests are sent to Google when the site is viewed.

## Publish

GitHub Pages serves the `master` branch from the repository root. Pushing a commit to `master` publishes the site.

For the custom domain, configure these records with the domain's DNS provider:

- Apex (`dmitriiorlov.com`): four `A` records at the root host (`@` or a blank host) for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`.
- `www`: a `CNAME` record pointing to `orlov-dm.github.io`.

Once GitHub Pages completes its DNS check and provisions the certificate, enable **Enforce HTTPS** in the repository's Pages settings. With both names configured, GitHub Pages redirects the apex domain to `www`.
