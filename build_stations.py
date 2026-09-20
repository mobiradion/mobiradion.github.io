import csv
import json
import os
import re
import html

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_ORIGIN = "https://radiostar.in"

LANGUAGES = [
    {
        "id": "tamil",
        "label": "Tamil",
        "csv": "TamilRadiosCSV.csv",
        "js": "tamil-data.js",
        "var": "TAMIL_RADIOS",
        "page": "tamil.html",
        "dir": "tamil"
    },
    {
        "id": "hindi",
        "label": "Hindi",
        "csv": "HindiRadiosCSV.csv",
        "js": "hindi-data.js",
        "var": "HINDI_RADIOS",
        "page": "hindi.html",
        "dir": "hindi"
    },
    {
        "id": "air",
        "label": "AIR",
        "csv": "AirRadiosCSV.csv",
        "js": "air-data.js",
        "var": "AIR_RADIOS",
        "page": "air.html",
        "dir": "air"
    },
    {
        "id": "malayalam",
        "label": "Malayalam",
        "csv": "MalayalamRadiosCSV.csv",
        "js": "malayalam-data.js",
        "var": "MALAYALAM_RADIOS",
        "page": "malayalam.html",
        "dir": "malayalam"
    },
    {
        "id": "telugu",
        "label": "Telugu",
        "csv": "TeluguRadiosCSV.csv",
        "js": "telugu-data.js",
        "var": "TELUGU_RADIOS",
        "page": "telugu.html",
        "dir": "telugu"
    },
    {
        "id": "kannada",
        "label": "Kannada",
        "csv": "KannadaRadiosCSV.csv",
        "js": "kannada-data.js",
        "var": "KANNADA_RADIOS",
        "page": "kannada.html",
        "dir": "kannada"
    },
    {
        "id": "marathi",
        "label": "Marathi",
        "csv": "MarathiRadiosCSV.csv",
        "js": "marathi-data.js",
        "var": "MARATHI_RADIOS",
        "page": "marathi.html",
        "dir": "marathi"
    },
    {
        "id": "punjabi",
        "label": "Punjabi",
        "csv": "PunjabiRadiosCSV.csv",
        "js": "punjabi-data.js",
        "var": "PUNJABI_RADIOS",
        "page": "punjabi.html",
        "dir": "punjabi"
    }
]

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-")

def escape(val):
    return html.escape(str(val or ""), quote=True)

def normalize_image(img_path):
    if not img_path:
        return "/images/radio-star-logo.svg"
    img_path = img_path.strip()
    if img_path.startswith("http://") or img_path.startswith("https://"):
        return img_path
    if not img_path.startswith("/"):
        return "/" + img_path
    return img_path

def generate_station_html(station, prev_station, next_station, related_stations, lang_info):
    title = station["title"]
    desc = station["description"] or f"Listen to {title} live streaming online in high quality on Radio Star. Free {lang_info['label']} radio stations 24/7."
    image = normalize_image(station["image"])
    full_image_url = image if image.startswith("http") else f"{SITE_ORIGIN}{image}"
    page_url = f"{SITE_ORIGIN}{station['pageUrl']}"
    canonical_url = page_url
    lang_label = lang_info["label"]
    lang_page = f"/{lang_info['page']}"

    # Previous / Next buttons
    if prev_station:
        prev_btn = f'''<a id="previous-station" class="icon-btn" href="{prev_station['pageUrl']}" aria-label="Previous station: {escape(prev_station['title'])}">
                <span aria-hidden="true">&#9664;&#9664;</span>
              </a>'''
    else:
        prev_btn = '''<button id="previous-station" class="icon-btn" type="button" aria-label="Previous station" disabled>
                <span aria-hidden="true">&#9664;&#9664;</span>
              </button>'''

    if next_station:
        next_btn = f'''<a id="next-station" class="icon-btn" href="{next_station['pageUrl']}" aria-label="Next station: {escape(next_station['title'])}">
                <span aria-hidden="true">&#9654;&#9654;</span>
              </a>'''
    else:
        next_btn = '''<button id="next-station" class="icon-btn" type="button" aria-label="Next station" disabled>
                <span aria-hidden="true">&#9654;&#9654;</span>
              </button>'''

    # Related cards HTML
    related_html_cards = []
    for rel in related_stations:
        rel_img = normalize_image(rel["image"])
        card = f'''          <article class="radio-card">
            <a class="radio-trigger" href="{rel['pageUrl']}">
              <img class="radio-image" src="{rel_img}" alt="{escape(rel['title'])}" loading="lazy">
              <div class="radio-copy">
                <h3>{escape(rel['title'])}</h3>
              </div>
            </a>
          </article>'''
        related_html_cards.append(card)

    related_section = ""
    if related_html_cards:
        related_section = f'''      <section class="section-container" style="max-width: 1100px; margin: 40px auto 20px; padding: 0 16px;">
        <div class="section-heading">
          <h2>More {lang_label} Radio Stations</h2>
        </div>
        <div class="radio-grid" style="margin-top: 18px;">
{chr(10).join(related_html_cards)}
        </div>
      </section>'''

    # Schema JSON-LD
    schema_data = {
        "@context": "https://schema.org",
        "@type": "RadioStation",
        "name": title,
        "url": canonical_url,
        "image": full_image_url,
        "description": desc,
        "inLanguage": lang_label,
        "potentialAction": {
            "@type": "ListenAction",
            "target": canonical_url
        }
    }
    schema_json = json.dumps(schema_data, ensure_ascii=False)

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Listen to {escape(title)} Live Online - {lang_label} Radio | Radio Star</title>
  <meta name="description" content="{escape(desc)}">
  <link rel="canonical" href="{canonical_url}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="music.radio_station">
  <meta property="og:title" content="{escape(title)} Live - Radio Star">
  <meta property="og:description" content="{escape(desc)}">
  <meta property="og:image" content="{full_image_url}">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:site_name" content="Radio Star">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(title)} Live - Radio Star">
  <meta name="twitter:description" content="{escape(desc)}">
  <meta name="twitter:image" content="{full_image_url}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
{schema_json}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6870612281681959" crossorigin="anonymous"></script>
</head>
<body data-page="player">
  <div class="page-shell">
    <div data-include="header"></div>
    <main class="inner-main">
      <section class="player-page">
        <div class="player-detail-card"
             data-title="{escape(title)}"
             data-stream-url="{escape(station['streamUrl'])}"
             data-description="{escape(desc)}"
             data-image="{image}"
             data-language="{lang_label}"
             data-slug="{station['slug']}">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/index.html">Home</a>
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
            <a href="{lang_page}">{lang_label} Radios</a>
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
            <span id="breadcrumb-current" aria-current="page">{escape(title)}</span>
          </nav>
          <img id="station-image" class="player-station-image" src="{image}" alt="{escape(title)}">
          <h1 class="player-station-title">{escape(title)}</h1>
          <audio id="station-player" class="radio-player player-page-audio" preload="none">
            Your browser does not support the audio element.
          </audio>
          <div class="player-actions">
            <div class="control-bar" aria-label="Player controls">
              {prev_btn}
              <button id="toggle-playback" class="icon-btn icon-btn-primary" type="button" aria-label="Play station">
                <span id="playback-icon" aria-hidden="true">&#9654;</span>
              </button>
              {next_btn}
              <button id="toggle-favorite" class="icon-btn" type="button" aria-label="Add to favorites">
                <span id="favorite-icon" aria-hidden="true">&#9825;</span>
              </button>
              <button id="share-station" class="icon-btn" type="button" aria-label="Share station" aria-expanded="false" aria-controls="share-menu">
                <span class="share-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path d="M18 16a3 3 0 0 0-2.39 1.19l-6.7-3.35a3.2 3.2 0 0 0 0-1.68l6.7-3.35A3 3 0 1 0 15 7a3.2 3.2 0 0 0 .09.74l-6.7 3.35a3 3 0 1 0 0 1.82l6.7 3.35A3 3 0 1 0 18 16Z" fill="currentColor"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <div id="share-menu" class="share-menu" hidden>
            <a id="share-whatsapp" class="share-link" href="#" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a id="share-twitter" class="share-link" href="#" target="_blank" rel="noopener noreferrer">X</a>
            <a id="share-facebook" class="share-link" href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a id="share-telegram" class="share-link" href="#" target="_blank" rel="noopener noreferrer">Telegram</a>
            <button id="copy-share-link" class="share-link share-link-button" type="button">Copy Link</button>
          </div>
          <p id="station-description" class="hero-text player-station-description">{escape(desc)}</p>
          
          <div class="ad-slot-container" style="margin-top: 24px; text-align: center;">
            <!-- radiostar.in -->
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-6870612281681959"
                 data-ad-slot="8202292755"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
              (adsbygoogle = window.adsbygoogle || []).push({{}});
            </script>
          </div>
        </div>
      </section>

{related_section}
    </main>
    <div data-include="footer"></div>
  </div>

  <script src="/shared.js"></script>
  <script src="/favorites-storage.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <script src="/station-page.js"></script>
</body>
</html>
'''

def main():
    all_stations_by_lang = {}
    total_stations_count = 0

    # 1. Read CSVs, assign clean slugs and pageUrls
    for lang_info in LANGUAGES:
        csv_path = os.path.join(BASE_DIR, lang_info["csv"])
        with open(csv_path, encoding="utf-8-sig", newline="", errors="replace") as f:
            reader = csv.DictReader(f)
            stations = []
            slugs = set()
            count = 0
            for row in reader:
                title = (row.get("Name") or row.get("name") or row.get("Title") or "").strip()
                stream_url = (row.get("URL") or row.get("Url") or row.get("url") or row.get("StreamURL") or "").strip()
                desc = (row.get("Description") or row.get("description") or row.get("Desc") or "").strip()
                img = (row.get("Image") or row.get("image") or row.get("Img") or "").strip()

                if not title:
                    continue

                slug = slugify(title)
                if not slug:
                    slug = f"station-{count+1}"
                
                # Ensure slug uniqueness
                base_slug = slug
                num = 2
                while slug in slugs:
                    slug = f"{base_slug}-{num}"
                    num += 1
                slugs.add(slug)

                page_url = f"/{lang_info['dir']}/{slug}.html"

                stations.append({
                    "title": title,
                    "streamUrl": stream_url,
                    "description": desc,
                    "image": img,
                    "slug": slug,
                    "pageUrl": page_url
                })
                count += 1

            all_stations_by_lang[lang_info["id"]] = stations
            total_stations_count += len(stations)
            print(f"Loaded {len(stations)} stations for {lang_info['label']}")

    # 2. Write updated *-data.js files
    for lang_info in LANGUAGES:
        js_path = os.path.join(BASE_DIR, lang_info["js"])
        stations = all_stations_by_lang[lang_info["id"]]
        content = f"window.{lang_info['var']} = {json.dumps(stations, ensure_ascii=False, indent=2)};\n"
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {lang_info['js']}")

    # 3. Generate static HTML files in language directories
    for lang_info in LANGUAGES:
        lang_dir = os.path.join(BASE_DIR, lang_info["dir"])
        os.makedirs(lang_dir, exist_ok=True)
        stations = all_stations_by_lang[lang_info["id"]]
        total = len(stations)

        for i, station in enumerate(stations):
            prev_st = stations[i - 1] if i > 0 else None
            next_st = stations[i + 1] if i < total - 1 else None

            # Pick 6 related stations
            related = []
            rel_indices = []
            for offset in [1, 2, 3, -1, -2, -3, 4, 5]:
                idx = (i + offset) % total
                if idx != i and idx not in rel_indices and len(related) < 6:
                    rel_indices.append(idx)
                    related.append(stations[idx])

            html_content = generate_station_html(station, prev_st, next_st, related, lang_info)
            html_path = os.path.join(lang_dir, f"{station['slug']}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)

        print(f"Generated {total} HTML files in /{lang_info['dir']}/")

    # 4. Generate comprehensive sitemap.xml
    sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>',
                     '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                     '  <!-- Home Page -->',
                     '  <url>',
                     f'    <loc>{SITE_ORIGIN}/</loc>',
                     '    <changefreq>daily</changefreq>',
                     '    <priority>1.0</priority>',
                     '  </url>',
                     '',
                     '  <!-- Language Directory Pages -->']

    for lang_info in LANGUAGES:
        sitemap_lines.extend([
            '  <url>',
            f'    <loc>{SITE_ORIGIN}/{lang_info["page"]}</loc>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.9</priority>',
            '  </url>'
        ])

    sitemap_lines.extend([
        '  <url>',
        f'    <loc>{SITE_ORIGIN}/favorites.html</loc>',
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.6</priority>',
        '  </url>',
        '  <url>',
        f'    <loc>{SITE_ORIGIN}/submit-radio.html</loc>',
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.5</priority>',
        '  </url>',
        '  <url>',
        f'    <loc>{SITE_ORIGIN}/contact-us.html</loc>',
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.5</priority>',
        '  </url>',
        '  <url>',
        f'    <loc>{SITE_ORIGIN}/privacy-policy.html</loc>',
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.5</priority>',
        '  </url>',
        '',
        '  <!-- Individual Radio Stations -->'
    ])

    for lang_info in LANGUAGES:
        stations = all_stations_by_lang[lang_info["id"]]
        for st in stations:
            sitemap_lines.extend([
                '  <url>',
                f'    <loc>{SITE_ORIGIN}{st["pageUrl"]}</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.8</priority>',
                '  </url>'
            ])

    sitemap_lines.append('</urlset>')
    sitemap_path = os.path.join(BASE_DIR, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sitemap_lines) + "\n")
    print(f"Generated sitemap.xml with {total_stations_count + len(LANGUAGES) + 5} URLs")

if __name__ == "__main__":
    main()
