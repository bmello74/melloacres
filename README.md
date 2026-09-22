# melloacres.com

The Mello Acres website. Plain HTML — no CMS, no database, no build step beyond
one Python script. Hosted free on **GitHub Pages**, which redeploys
automatically on every push to `main`. The domain is registered at GoDaddy and
points here with DNS records only, so email stays on GoDaddy untouched.

## Layout

```
docs/                          THE WEBSITE — everything GitHub Pages serves
  index.html                   home
  flock/ · flowers/ · farm/ · guides/ · about/ · contact/
  404.html · sitemap.xml · robots.txt · CNAME · .nojekyll
  assets/site.css              every style on the site
  assets/logo.png              wordmark extracted from the logo (black)
  assets/logo-cream.png        the same wordmark for dark backgrounds
  assets/img/                  site photography
  assets/guides/               the printable PDF guides

tools/                         NOT PUBLISHED — source, kept in the repo only
  build.py                     the generator
  pages/*.html                 one body fragment per page, with a JSON header
  guide-base.css               print stylesheet for the PDF guides
  guide-hatching.html          source for the hatching guide PDF
  guide-raising-chicks.html    source for the chick-raising guide PDF
```

GitHub Pages is set to **`main` / `docs`**, so only `docs/` is served. Anything
outside it — this README, the build script, the page sources — lives in the
repository but never appears on melloacres.com.

## Editing a page

Page bodies are in `tools/pages/`. Each starts with a small JSON header giving
its published path, title and meta description; the rest is the body HTML. Edit
the fragment, then:

```
python3 tools/build.py            # rebuild every page + sitemap.xml
python3 tools/build.py flock      # rebuild one page
```

The script wraps each body in the shared head, masthead, nav and footer.

## Changing the phone number, email or nav

All of it lives in the `CONFIG` block at the top of `tools/build.py` — owner
name, phone, email, location, the nav list and the footer columns. Change it
once there and rebuild; every page picks it up. Page bodies can use the tokens
`{{PHONE_LINK}}`, `{{EMAIL_LINK}}`, `{{PHONE}}`, `{{EMAIL}}`, `{{OWNER}}`,
`{{PLACE}}` and `{{NAME}}` so contact details are never hard-coded twice.

## Rebuilding the guide PDFs

The guides are written as HTML in `tools/` and rendered to PDF with headless
Chromium. After editing `tools/guide-hatching.html` or
`tools/guide-raising-chicks.html`, re-render them into `docs/assets/guides/`.

## Still to wire up

- A newsletter signup. The "join the list" buttons currently point at the
  contact page; they can go to a Mailchimp embedded form instead.
- A contact form. The contact page shows call and email buttons; a form needs a
  handler, since GitHub Pages serves static files only.
