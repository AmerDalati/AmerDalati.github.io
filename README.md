# Amer Dalati — portfolio

Live site: **https://amerdalati.github.io**

Portfolio of Amer Dalati, journalism and digital media graduate (Canadian University Dubai), video editor and content creator.
The colours, typefaces and signature come from Amer's own portfolio, so the site and the PDF feel like one brand.

## What's on the page

| Section | What it shows |
| --- | --- |
| Hero | His Canva cover brought to life: the giant PORTFOLIO word with his signature writing itself across it |
| Selected work | A video-editor style timeline (like CapCut). Slide or drag the timeline, tap a clip, or use the arrow keys. YouTube episodes and the short film play right on the page; TikTok and Instagram open the original post |
| About | Portrait, short bio, key facts and skills |
| Experience | Roles and education from the CV |
| Certificates | Three certificates; click to view full size |
| Contact | WhatsApp, email (with a copy button), Instagram, TikTok and YouTube |

## Editing content

Everything is plain HTML, CSS and JavaScript with no build step.

- **Text, links and projects**: `index.html`. Each project in *Selected work* is one `<article class="clip">`.
  - `data-group` sets the timeline group, `data-label` the short name on the clip, and `data-len` its width.
  - The project's picture goes in its `<figure class="clip-media">`. Add a `.play` link with `data-embed` if the video can play on the page (YouTube via `youtube-nocookie.com/embed/…`, Google Drive via `…/preview`).
  - The timeline, monitor and buttons are built automatically from these articles.
- **Styles**: `assets/css/style.css`. Brand colours are the variables at the top (`--navy`, `--cyan`, `--ink`, `--mist`…).
- **Behaviour**: `assets/js/main.js` (timeline, menu, copy button, certificate viewer).
- **Images**: `assets/img/`. Each photo has WebP sizes (480/800/1280 px) and a JPEG fallback.
- **CV**: replace `cv/Amer-Dalati-CV.pdf` to update the download.

## Publishing

Every push to `main` runs `.github/workflows/deploy.yml`, which publishes the repository to GitHub Pages.
The site updates about a minute later. Progress shows under the repository's **Actions** tab.

To preview locally, run `python -m http.server 8000` in this folder and open http://localhost:8000.

## Credits

- Typefaces (static weights, so every browser renders the same): [Big Shoulders Display](https://fonts.google.com/specimen/Big+Shoulders+Display) and [Public Sans](https://fonts.google.com/specimen/Public+Sans), SIL Open Font License (licences in `assets/fonts/`).
- Brand icons: [Simple Icons](https://simpleicons.org), CC0.
- All photos, videos, thumbnails and certificates belong to Amer Dalati.
