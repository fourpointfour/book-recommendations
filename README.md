# Book Recommendations

A personal bookshelf built as a web app — a curated list of books I've read and recommend, with my notes on each one.

Live at: https://fourpointfour.github.io/book-recommendations

---

## Introduction

This is a simple, fast, and opinionated reading list. Instead of a spreadsheet or a Goodreads profile, I wanted something I own — a static site that lives in a Git repo, deploys automatically, and looks the way I want it to.

Each book gets its own Markdown file. That's the whole content model.

---

## About the project

**Stack:** React 19 + TypeScript + Vite, deployed to GitHub Pages via GitHub Actions.

**How it works:**

- Books are stored as Markdown files in `src/books/`. Each file has frontmatter for metadata (title, author, cover image, rating, buy link) and a freeform Markdown body for the recommendation.
- At build time, Vite's `import.meta.glob` loads all the `.md` files and the app parses the frontmatter.
- The UI renders a responsive cover-focused grid. Clicking a cover opens a modal with the full recommendation.
- No backend, no database, no CMS — just files and a build step.

**Project layout:**

```
src/
  books/          # One .md file per book
  components/     # BookList, BookListItem, BookModal, RatingStars
  types/          # Shared TypeScript types
  utils/          # Markdown + frontmatter parsing helpers
  App.tsx
```

**Tests:** Vitest + React Testing Library. Run with `npm test`.

---

## How to run locally

**Prerequisites:** Node.js 18+ and npm.

```bash
# Clone the repo
git clone git@github.com:fourpointfour/book-recommendations.git
cd book-recommendations

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

Other useful commands:

```bash
npm run build       # Production build (output in dist/)
npm run preview     # Serve the production build locally
npm test            # Run the test suite in watch mode
npm run test:run    # Run tests once (CI mode)
npm run lint        # Lint the codebase
```

---

## How to add a book

1. Create a new `.md` file in `src/books/`. Use an existing file as a template — e.g. [`src/books/and-then-there-were-none.md`](src/books/and-then-there-were-none.md).
2. Fill in the frontmatter:

```yaml
---
title: "Book Title"
author: "Author Name"
image: "https://..."        # Cover image URL (Google Books works well)
rating: "4/5"               # Your rating
buyLink: "https://..."      # Optional purchase link
---
```

3. Write your recommendation in Markdown below the frontmatter.
4. Commit and push — GitHub Pages will deploy automatically.

---

## How to report issues

Found a bug, a broken link, or something that looks off? Please [open a GitHub issue](https://github.com/fourpointfour/book-recommendations/issues/new).

When filing an issue, include:
- What you expected to happen
- What actually happened
- Your browser and OS (for visual/layout bugs)
- A screenshot if relevant

For book suggestions, feel free to open an issue with the `suggestion` label — no guarantees, but I do read them.

---

## Deployment

Every push to `main` triggers a GitHub Actions workflow that builds the app and deploys it to GitHub Pages. There's no manual deploy step.
