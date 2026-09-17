# Watcher

**An open-source streaming platform with the goal of delivering media to the people.**

Watcher is a free, ad-free streaming interface that aggregates movie and TV show metadata from [TMDB](https://www.themoviedb.org/) and provides access to content through third-party embed providers. No sign-up, no subscription — just press play.

## Features

- Browse trending, popular, and top-rated movies and TV shows
- Dedicated Anime section
- Genre filtering across all categories
- Search with actor and director filters
- Full TV show support with season/episode navigation
- YouTube trailer embeds on detail pages
- Cast, crew, and production details
- Watch progress tracking (local)
- Responsive design for all screen sizes

## Tech Stack

- **Vite + React** — fast, modern SPA
- **TMDB API** — metadata, images, cast, crew, trailers
- **Viduki** — video player embed with multi-server fallback
- **No backend** — fully client-side

## Getting Started

```bash
git clone https://github.com/yourusername/watcher.git
cd watcher

# Set up your TMDB API key
cp .env.example .env
# Edit .env and add your key (free at https://www.themoviedb.org/settings/api)

npm install
npm run dev
```

## Legal Notice

Watcher does not host, store, or distribute any media content. All video streams are provided by third-party services that are not affiliated with this project. Watcher simply links to content available on the internet, similar to how a search engine indexes web pages.

All movie and TV show metadata, images, and related information are provided by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

This project is open source and available under the [MIT License](LICENSE).
