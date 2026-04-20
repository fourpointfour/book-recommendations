# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check (tsc -b) then bundle for production
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

There are no tests in this project.

## Architecture

This is a static React + Vite app deployed to GitHub Pages at `/book-recommendations/`. All book data lives in markdown files — there is no backend or database.

### Data flow

Books are defined as markdown files in `src/books/`. At build time, `src/utils/loadBooks.ts` uses Vite's `import.meta.glob('../books/*.md', { as: 'raw', eager: true })` to bundle all markdown files as raw strings. On component mount, `loadBooks()` parses the YAML-style frontmatter and returns sorted `Book[]` objects. The file `example-book.md` is explicitly excluded from the output.

### Adding a book

Create a new `.md` file in `src/books/` — the filename becomes the book's `id`/`slug`. Required frontmatter fields: `title`, `author`, `rating` (format: `"N/5"`), `buyLink`. Optional: `image` (URL to cover art). The markdown body below the closing `---` becomes the notes, rendered via `react-markdown` in the modal.

```markdown
---
title: "Book Title"
author: "Author Name"
rating: "4/5"
buyLink: "https://..."
image: "https://..."
---

Your notes here.
```

### Key types (`src/types/book.ts`)

- `BookFrontmatter` — parsed frontmatter fields
- `BookMeta` — extends frontmatter with `slug` (filename without `.md`) and `ratingValue` (numeric float)
- `Book` — `{ id, meta: BookMeta, notes: string }`

### Component structure

`BookList` loads all books and owns modal state. Clicking a `BookListItem` card opens `BookModal`, which renders the notes body with `react-markdown` and displays rating via `RatingStars` (supports fractional fill at 0.5 increments).

### Deployment

CI is defined in `.github/workflows/deploy.yml`: pushes to `master` trigger `npm ci && npm run build`, and the `dist/` folder is published to GitHub Pages. The `base: '/book-recommendations/'` in `vite.config.ts` is required for correct asset paths on GitHub Pages.
