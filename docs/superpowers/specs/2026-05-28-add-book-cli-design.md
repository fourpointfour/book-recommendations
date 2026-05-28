# Add Book CLI Tool — Design Spec

## Problem

Adding a book to the site requires manually creating a `.md` file with frontmatter (title, author, cover image URL, rating, buy link), writing the markdown body, then committing and pushing. Finding cover image URLs and buy links is especially tedious. This process doesn't scale when adding multiple books at once.

## Solution

A Node.js CLI script (`npm run add-book`) that searches Open Library for book metadata, auto-fills frontmatter, opens the user's editor for notes, and generates the `.md` file. A `--batch` flag supports adding multiple books in one session.

## Core Flow

1. Run `npm run add-book` (single) or `npm run add-book -- --batch` (multi).
2. Prompt: "Search for a book:" — user types a title or author.
3. Hit Open Library Search API — display top 5 results (title, author, year).
4. User picks one — auto-fill: title, author, cover image URL (Open Library Covers API), and a default buy link (Open Library edition page).
5. Prompt: "Rating (e.g. 4.5/5):" — user types it. Validated to match the `X/5` or `X.X/5` format before proceeding; re-prompts on invalid input.
6. Prompt: "Buy link (press Enter to use Open Library link):" — allows override with a custom URL.
7. Opens `$EDITOR` with a pre-filled markdown template for the notes section ("Why I recommend this book" + "Favorite ideas" structure).
8. On save and close, the `.md` file is written to `src/books/<slug>.md`.
9. In `--batch` mode: prompts "Add another book? (y/n)" and loops back to step 2 on "y". On "n", prints a summary of all files created and exits.

## Technical Details

### Script location and setup

- New file: `scripts/add-book.mjs`
- New npm script in `package.json`: `"add-book": "node scripts/add-book.mjs"`
- No new dependencies — uses Node built-ins only: `readline`, `node:fs`, `child_process` (for `$EDITOR`), and global `fetch` (Node 18+)

### Open Library integration

- **Search:** `https://openlibrary.org/search.json?q=<query>&limit=5`
  - Returns: title, author_name, first_publish_year, key (work key), cover_edition_key
- **Cover image:** `https://covers.openlibrary.org/b/olid/<cover_edition_key>-L.jpg`
  - Uses the large size variant (`-L`)
- **Default buy link:** `https://openlibrary.org/works/<work_key>`
  - The Open Library page for that work

### Slug generation

- Derived from the book title: lowercase, spaces to hyphens, strip non-alphanumeric characters (matching existing files like `and-then-there-were-none.md`)
- If a file with that slug already exists in `src/books/`, warn and skip

### Generated file structure

Matches the existing format exactly:

```yaml
---
title: "Book Title"
author: "Author Name"
image: "https://covers.openlibrary.org/b/olid/OL12345M-L.jpg"
rating: "4/5"
buyLink: "https://openlibrary.org/works/OL12345W"
---
```

Followed by the notes body from the editor session.

### `--batch` mode

After each book is saved, prompts "Add another book? (y/n)". On "y", loops back to the search prompt. On "n", prints a summary of all files created (filenames and titles) and exits.

### Editor integration

- Uses `$EDITOR` environment variable (falls back to `vi`)
- Creates a temporary file pre-filled with the notes template:
  ```markdown
  ## Why I recommend this book

  <!-- Write your thoughts here -->

  ### Favorite ideas

  1. 
  ```
- After the editor closes, reads the temp file content and uses it as the markdown body

## README Update

The "How to add a book" section in `README.md` (currently lines 73-89) will be rewritten:

1. **Primary method:** `npm run add-book` (or `npm run add-book -- --batch` for multiple). Brief description of what it does — searches Open Library, auto-fills metadata, opens editor for notes, generates the `.md` file.
2. **Manual method:** Kept as a fallback below the CLI method, under a "Or, add one manually:" sub-heading.

No other README sections change.

## Out of Scope

- No git commit/push automation — user handles git themselves
- No web-based admin UI
- No new npm dependencies
