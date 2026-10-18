#!/usr/bin/env python3
"""
melloacres.com site generator.

Plain HTML in, plain HTML out. Every page is a body fragment in tools/pages/
with a small JSON header; this script wraps each one in the shared head,
masthead, nav and footer and writes it into docs/, then regenerates sitemap.xml.

docs/ is the published website - GitHub Pages is set to "master / docs". Anything
outside docs/ (this script, the page sources, the guide templates) stays in the
repository but is never served from melloacres.com.

    python3 tools/build.py            # rebuild the whole site
    python3 tools/build.py guides     # rebuild one page

Contact details, the nav and the footer live in CONFIG below - change them in
one place and rebuild.
"""

import json
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, "tools", "pages")

# Everything that goes live is written into docs/. GitHub Pages is pointed at
# "master / docs", so this folder IS the website and nothing outside it is ever
# served - which is how tools/ stays off melloacres.com.
OUT = os.path.join(ROOT, "docs")

# --------------------------------------------------------------------------
# CONFIG - the whole site's shared facts
# --------------------------------------------------------------------------

SITE = "https://melloacres.com"
NAME = "Mello Acres"
OWNER = "Michelle Mello"
PLACE = "Hanford, California"
PHONE = "(559) 836-2880"
PHONE_HREF = "tel:+15598362880"

# GA_ID - Google Analytics 4 measurement ID for melloacres.com (owned by
#   bryanmello74@gmail.com). Feeds the monthly website report.
GA_ID = "G-YDR5S9JRFE"
EMAIL = "connect@melloacres.com"

# --- The two hosted endpoints -------------------------------------------------
# Both are optional. Leave either empty and the site quietly falls back to
# call/email buttons, so the pages are never broken while you set them up.
#
# CONTACT_ENDPOINT - the form handler's POST url (Formspree, Basin, Web3Forms...).
#   Paste the endpoint the service gives you after you confirm the address.
# MAILCHIMP_ACTION - the Mailchimp embedded-form action url. In Mailchimp:
#   Audience > Signup forms > Embedded form, then copy the <form action="...">
#   value. It looks like
#   https://melloacres.us12.list-manage.com/subscribe/post?u=XXXX&id=YYYY
CONTACT_ENDPOINT = ""

# WAITLIST_TO - every wait list signup on the site is emailed here by FormSubmit
#   (formsubmit.co). The very first signup sends an "Activate Form" email to this
#   address; click it once and every signup after that comes straight through.
WAITLIST_TO = EMAIL
WAITLIST_AJAX = f"https://formsubmit.co/ajax/{WAITLIST_TO}"
WAITLIST_POST = f"https://formsubmit.co/{WAITLIST_TO}"
MAILCHIMP_ACTION = ("https://melloacres.us5.list-manage.com/subscribe/post"
                    "?u=05bae587d6dd6eedf89125582&amp;id=14930b50e0&amp;f_id=00786ae0f0")
# Mailchimp's bot-trap field. Its name is unique to this audience and the input
# must stay empty and off-screen - a real person filling it in marks the signup
# as spam, which is the point.
MAILCHIMP_BOT_FIELD = "b_05bae587d6dd6eedf89125582_14930b50e0"

NAV = [
    ("/", "Home"),
    ("/flock/", "Flock"),
    ("/flowers/", "Flowers"),
    ("/farm/", "Farm"),
    ("/guides/", "Guides"),
    ("/about/", "About"),
    ("/contact/", "Wait List"),
]

FOOT_COLS = [
    ("The farm", [("/flock/", "Flock"), ("/flowers/", "Flowers"), ("/farm/", "Farm")]),
    ("More", [("/guides/", "Guides"), ("/about/", "About"), ("/contact/", "Wait List")]),
]

FONTS = ("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700"
         "&family=Karla:wght@400;500;700&display=swap")

# --------------------------------------------------------------------------


def org_schema():
    return json.dumps({
        "@context": "https://schema.org",
        "@type": ["Organization", "LocalBusiness", "Farm"],
        "@id": f"{SITE}/#organization",
        "name": NAME,
        "url": f"{SITE}/",
        "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/logo.png"},
        "image": f"{SITE}/assets/img/collage.jpg",
        "telephone": PHONE,
        "email": EMAIL,
        "founder": {"@type": "Person", "name": OWNER},
        "slogan": "Farm, flock and flowers",
        "description": ("A small family farm in Hanford, California raising Sebastopol, Embden "
                        "and Toulouse geese, Bresse and mixed-flock poultry, dahlias, and "
                        "registered Shorthorn cattle."),
        "address": {"@type": "PostalAddress", "addressLocality": "Hanford",
                    "addressRegion": "CA", "addressCountry": "US"},
        "areaServed": [{"@type": "Place", "name": "Central Valley, California"},
                       {"@type": "State", "name": "California"}],
        "knowsAbout": ["Sebastopol geese", "Embden geese", "Toulouse geese", "goslings",
                       "Bresse chickens", "hatching eggs", "duck eggs", "dahlias",
                       "dahlia tubers", "cut flowers", "Shorthorn cattle", "club calves"],
    }, separators=(", ", ": "))


def head(meta, path):
    url = f"{SITE}{path}"
    img = meta.get("image", "/assets/img/social-card.jpg")
    extra = "".join(f'\n<script type="application/ld+json">{s}</script>'
                    for s in meta.get("schema", []))
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google Analytics 4 (visits, clicks, wait list signups) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');</script>
<script src="/assets/analytics.js" defer></script>
<title>{meta['title']}</title>
<meta name="description" content="{meta['description']}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="{NAME}">
<meta name="geo.region" content="US-CA">
<meta name="geo.placename" content="Hanford, California">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{NAME}">
<meta property="og:title" content="{meta['title']}">
<meta property="og:description" content="{meta['description']}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{meta['title']}">
<meta name="twitter:description" content="{meta['description']}">
<meta name="twitter:image" content="{SITE}{img}">
<link rel="icon" href="/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">{org_schema()}</script>{extra}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""


def chrome_top(path):
    current = ' aria-current="page"'
    nav = "".join(
        f'<a href="{href}"{current if href == path else ""}>{label}</a>'
        for href, label in NAV)
    return f"""
<header class="masthead">
  <div class="wrap">
    <a class="brand" href="/">
      <img class="on-light" src="/assets/logo.png" alt="{NAME}: Farm, Flock, Flowers" width="1400" height="334">
      <img class="on-dark" src="/assets/logo-cream.png" alt="{NAME}: Farm, Flock, Flowers" width="1400" height="334">
    </a>
    <div class="mast-right">
      <span class="mast-tag">{PLACE}</span>
      <a class="callbtn" href="/contact/">Join the wait list</a>
    </div>
  </div>
</header>

<nav class="navbar" aria-label="Main">
  <div class="wrap">
    {nav}
  </div>
</nav>

<main id="main">
"""


def chrome_bottom():
    cols = ""
    for title, links in FOOT_COLS:
        items = "\n      ".join(f'<a href="{h}">{t}</a>' for h, t in links)
        cols += f"""
    <div>
      <h4>{title}</h4>
      {items}
    </div>"""
    return f"""
</main>

<footer class="foot">
  <div class="wrap">
    <div class="brandfoot">
      <img src="/assets/logo-cream.png" alt="{NAME}" width="1400" height="334">
      <p style="margin:0;color:var(--band-soft)">Farm &middot; Flock &middot; Flowers<br>{PLACE}</p>
    </div>{cols}
    <div>
      <h4>Wait lists</h4>
      <a href="/flock/#waitlist">Eggs &amp; goslings</a>
      <a href="/flowers/#waitlist">Dahlias &amp; tubers</a>
      <a href="/farm/#waitlist">Cattle</a>
    </div>
  </div>
  <div class="legal">
    <div class="wrap"><span>&copy; {date.today().year} {NAME}, {PLACE}. {OWNER}, owner.</span>
      <span class="credit">Website by <a href="https://bmelloag.com/web-and-marketing/?utm_source=melloacres.com&amp;utm_medium=referral&amp;utm_campaign=site-credit" target="_blank" rel="noopener">B. Mello Ag Services</a></span></div>
  </div>
</footer>
</body>
</html>
"""


def contact_form():
    """The full inquiry form, or call/email buttons until an endpoint is set."""
    if not CONTACT_ENDPOINT:
        return f"""<div class="actions">
      <a class="btn btn-ink" href="{PHONE_HREF}">Call {PHONE}</a>
      <a class="btn btn-outline" href="mailto:{EMAIL}">Send an email</a>
    </div>"""
    return f"""<form class="form" action="{CONTACT_ENDPOINT}" method="POST">
      <div class="form-row">
        <p class="field"><label for="f-name">Your name</label>
          <input id="f-name" name="name" type="text" autocomplete="name" required></p>
        <p class="field"><label for="f-email">Email</label>
          <input id="f-email" name="email" type="email" autocomplete="email" required></p>
      </div>
      <div class="form-row">
        <p class="field"><label for="f-phone">Phone <span class="opt">optional</span></label>
          <input id="f-phone" name="phone" type="tel" autocomplete="tel"></p>
        <p class="field"><label for="f-interest">What are you interested in?</label>
          <select id="f-interest" name="interest">
            <option>Hatching eggs</option>
            <option>Started goslings</option>
            <option>Cut flowers</option>
            <option>Dahlia tubers</option>
            <option>Cattle</option>
            <option>Something else</option>
          </select></p>
      </div>
      <div class="form-row">
        <p class="field"><label for="f-variety">Which breed or variety <span class="opt">optional</span></label>
          <input id="f-variety" name="variety" type="text"
                 placeholder="Sebastopol, Bresse, mixed duck&hellip;"></p>
        <p class="field"><label for="f-qty">How many <span class="opt">optional</span></label>
          <input id="f-qty" name="quantity" type="text" placeholder="A dozen eggs, two goslings&hellip;"></p>
      </div>
      <div class="form-row">
        <p class="field"><label for="f-when">When would you like it?</label>
          <input id="f-when" name="when" type="text" placeholder="This spring, the week of the 14th&hellip;"></p>
        <p class="field"><label for="f-collect">Pick up or ship?</label>
          <select id="f-collect" name="collection">
            <option>I'll pick up at the farm</option>
            <option>I'd like to ask about shipping</option>
            <option>Not sure yet</option>
          </select></p>
      </div>
      <p class="field"><label for="f-note">Anything else you'd like us to know</label>
        <textarea id="f-note" name="message" rows="4"></textarea></p>
      <p class="hp" aria-hidden="true"><label>Leave this empty<input name="_gotcha" type="text" tabindex="-1" autocomplete="off"></label></p>
      <p class="form-actions"><button class="btn btn-ink" type="submit">Send to {OWNER}</button></p>
      <p class="form-note">Prefer to talk? Call <a href="{PHONE_HREF}">{PHONE}</a> or email
        <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
    </form>"""


def signup_form(button="Join the list", field_id="mce-EMAIL"):
    """Mailchimp email capture, or a link to the contact page until it's set."""
    if not MAILCHIMP_ACTION:
        return f"""<div class="actions" style="margin-top:22px">
      <a class="btn btn-solid" href="/contact/">{button}</a>
      <a class="btn btn-ghost" href="{PHONE_HREF}">{PHONE}</a>
    </div>"""
    return f"""<form class="signup-form" action="{MAILCHIMP_ACTION}" method="post"
          target="_blank" novalidate>
      <label class="sr" for="{field_id}">Email address</label>
      <input id="{field_id}" type="email" name="EMAIL" placeholder="your email address"
             autocomplete="email" required>
      <div class="hp" aria-hidden="true">
        <input type="text" name="{MAILCHIMP_BOT_FIELD}" tabindex="-1" value=""
               autocomplete="off">
      </div>
      <button class="btn btn-solid" type="submit" name="subscribe">{button}</button>
    </form>"""


# The choices each page's wait list offers. The key is used in the page token,
# e.g. {{WAITLIST_FLOCK}}. Groups are (heading, [choices]); a heading of None
# shows the choices without a heading.
WAITLISTS = {
    "flock": ("Flock", [
        ("Sebastopol geese", ["Sebastopol hatching eggs", "Sebastopol goslings"]),
        ("Embden geese", ["Embden hatching eggs", "Embden goslings"]),
        ("Toulouse geese", ["Toulouse hatching eggs", "Toulouse goslings"]),
        ("Chickens and ducks", ["Bresse hatching eggs", "Mixed duck hatching eggs",
                                "Mixed chicken hatching eggs"]),
    ]),
    "flowers": ("Dahlias", [
        (None, ["Cut flowers", "Dahlia tubers", "Flowers for a wedding or event"]),
    ]),
    "farm": ("Cattle", [
        (None, ["Registered Shorthorn", "Shorthorn Plus", "Club calf"]),
    ]),
}
WAITLISTS["all"] = ("General", [
    ("Geese", WAITLISTS["flock"][1][0][1] + WAITLISTS["flock"][1][1][1]
              + WAITLISTS["flock"][1][2][1]),
    ("Chickens and ducks", WAITLISTS["flock"][1][3][1]),
    ("Dahlias", WAITLISTS["flowers"][1][0][1]),
    ("Cattle", WAITLISTS["farm"][1][0][1]),
])


def waitlist_form(key, page_path):
    """A wait list signup form. Signups are emailed to WAITLIST_TO."""
    label, groups = WAITLISTS[key]
    k = key[:3]
    choices = ""
    n = 0
    for heading, items in groups:
        boxes = ""
        for item in items:
            n += 1
            boxes += (f'\n          <label class="choice"><input type="checkbox" '
                      f'name="Interested in" value="{item}"> <span>{item}</span></label>')
        head = f'\n        <p class="choice-head">{heading}</p>' if heading else ""
        choices += f'\n      <div class="choice-group">{head}{boxes}\n      </div>'
    return f"""<form class="form waitlist" action="{WAITLIST_POST}" method="POST"
          data-waitlist data-endpoint="{WAITLIST_AJAX}">
      <input type="hidden" name="_subject" value="Wait list signup: {label} (melloacres.com)">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="_next" value="{SITE}{page_path}#waitlist">
      <input type="hidden" name="Signed up on" value="{SITE}{page_path}">
      <div class="form-row">
        <p class="field"><label for="{k}-first">First name</label>
          <input id="{k}-first" name="First name" type="text" autocomplete="given-name" required></p>
        <p class="field"><label for="{k}-last">Last name</label>
          <input id="{k}-last" name="Last name" type="text" autocomplete="family-name" required></p>
      </div>
      <div class="form-row">
        <p class="field"><label for="{k}-email">Email</label>
          <input id="{k}-email" name="email" type="email" autocomplete="email" required></p>
        <p class="field"><label for="{k}-phone">Phone</label>
          <input id="{k}-phone" name="Phone" type="tel" autocomplete="tel" required></p>
      </div>
      <fieldset class="choices">
        <legend>What would you love to be on the list for?</legend>{choices}
      </fieldset>
      <p class="field"><label for="{k}-note">Anything you'd like us to know <span class="opt">optional</span></label>
        <textarea id="{k}-note" name="Message" rows="4"
          placeholder="How many you're hoping for, a date you have in mind, a color you love&hellip;"></textarea></p>
      <p class="hp" aria-hidden="true"><label>Leave this empty<input name="_honey" type="text" tabindex="-1" autocomplete="off"></label></p>
      <p class="form-actions"><button class="btn btn-ink" type="submit">Add me to the wait list</button></p>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>"""


TOKENS = {
    "{{PHONE}}": PHONE,
    "{{PHONE_HREF}}": PHONE_HREF,
    "{{EMAIL}}": EMAIL,
    "{{OWNER}}": OWNER,
    "{{PLACE}}": PLACE,
    "{{NAME}}": NAME,
    "{{PHONE_LINK}}": f'<a href="{PHONE_HREF}">{PHONE}</a>',
    "{{EMAIL_LINK}}": f'<a href="mailto:{EMAIL}">{EMAIL}</a>',
    "{{CONTACT_FORM}}": contact_form(),
    "{{SIGNUP_FORM}}": signup_form(),
    "{{SIGNUP_FORM_BLOOMS}}": signup_form("Tell me when they're ready", "mce-EMAIL-2"),
}


def read_page(name):
    """A page file starts with a JSON header in an HTML comment, then the body."""
    raw = open(os.path.join(PAGES, name + ".html"), encoding="utf-8").read()
    m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->\s*", raw, re.S)
    if not m:
        raise SystemExit(f"{name}.html is missing its JSON header")
    meta = json.loads(m.group(1))
    body = raw[m.end():]
    for token, value in TOKENS.items():
        body = body.replace(token, value)
    for key in WAITLISTS:
        token = "{{WAITLIST_" + key.upper() + "}}"
        if token in body:
            body = body.replace(token, waitlist_form(key, meta["path"]))
    if "data-waitlist" in body:
        body += '\n<script src="/assets/waitlist.js" defer></script>\n'
    return meta, body


def build(name):
    meta, body = read_page(name)
    path = meta["path"]                      # e.g. "/flock/"
    if path == "/":
        out = os.path.join(OUT, "index.html")
    elif path.endswith(".html"):                 # standalone, e.g. /404.html
        out = os.path.join(OUT, path.lstrip("/"))
    else:
        out = os.path.join(OUT, path.strip("/") + "/index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(head(meta, path) + chrome_top(path) + body + chrome_bottom())
    return path, os.path.relpath(out, ROOT)


def sitemap(paths):
    today = date.today().isoformat()
    urls = "\n".join(
        f"  <url><loc>{SITE}{p}</loc><lastmod>{today}</lastmod>"
        f"<priority>{'1.0' if p == '/' else '0.8'}</priority></url>" for p in sorted(paths))
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                f"{urls}\n</urlset>\n")


def main():
    names = sys.argv[1:] or sorted(
        f[:-5] for f in os.listdir(PAGES) if f.endswith(".html"))
    paths = []
    for name in names:
        path, out = build(name)
        paths.append(path)
        print(f"  {path:<14} -> {out}")
    if not sys.argv[1:]:
        sitemap([p for p in paths if not p.endswith(".html") or p == "/"])
        print("  sitemap.xml")
    print(f"{len(names)} page(s) built.")


if __name__ == "__main__":
    main()
