import { useMemo, useState } from 'react'
import { BookList } from './components/BookList'
import { loadBooks } from './utils/loadBooks'
import './App.css'

type SortKey = 'title' | 'rating' | 'author'

const SORT_LABELS: Record<SortKey, string> = {
  title: 'Title, A–Z',
  rating: 'Rating, high first',
  author: 'Author, A–Z',
}

function App() {
  const allBooks = useMemo(() => loadBooks(), [])
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('title')

  const books = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? allBooks.filter(
          (book) =>
            book.meta.title.toLowerCase().includes(q) ||
            book.meta.author.toLowerCase().includes(q),
        )
      : allBooks

    return [...filtered].sort((a, b) => {
      if (sortKey === 'rating') {
        return (
          b.meta.ratingValue - a.meta.ratingValue ||
          a.meta.title.localeCompare(b.meta.title)
        )
      }
      if (sortKey === 'author') {
        return (
          a.meta.author.localeCompare(b.meta.author) ||
          a.meta.title.localeCompare(b.meta.title)
        )
      }
      return a.meta.title.localeCompare(b.meta.title)
    })
  }, [allBooks, query, sortKey])

  const averageRating =
    allBooks.length > 0
      ? allBooks.reduce((sum, book) => sum + book.meta.ratingValue, 0) /
        allBooks.length
      : 0
  const perfectShelf = allBooks.filter((book) => book.meta.ratingValue >= 5)
  const authorCount = new Set(allBooks.map((book) => book.meta.author)).size

  return (
    <div className="room">
      <a className="skip-link" href="#shelves">
        Skip to the shelves
      </a>

      <header className="hero">
        <p className="hero-overline" aria-hidden="true">
          <span className="hero-overline-rule" />
          Est. MMXXVI · A personal canon · No algorithms involved
          <span className="hero-overline-rule" />
        </p>

        <h1 className="hero-title">
          The <em className="hero-title-flourish">Reading</em> Room
        </h1>

        <svg
          className="hero-ink-stroke"
          viewBox="0 0 320 24"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M6 14 C 70 4, 130 22, 190 12 S 290 8, 314 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>

        <p className="hero-subtitle">
          A hand-kept shelf of books Vaibhav loves, each with notes scribbled
          in the margins. Pull a volume to read why it earned its place.
        </p>

        <dl className="hero-colophon">
          <div className="hero-colophon-cell">
            <dt>Volumes</dt>
            <dd>{String(allBooks.length).padStart(2, '0')}</dd>
          </div>
          <div className="hero-colophon-cell">
            <dt>Authors</dt>
            <dd>{String(authorCount).padStart(2, '0')}</dd>
          </div>
          <div className="hero-colophon-cell">
            <dt>Mean rating</dt>
            <dd>{averageRating.toFixed(1)}</dd>
          </div>
          <div className="hero-colophon-cell">
            <dt>Five-star picks</dt>
            <dd>{String(perfectShelf.length).padStart(2, '0')}</dd>
          </div>
        </dl>
      </header>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <span className="ticker-run" key={copy}>
              {allBooks.map((book) => (
                <span className="ticker-item" key={`${copy}-${book.id}`}>
                  {book.meta.title}
                  <span className="ticker-fleuron">❦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <main className="shelves" id="shelves">
        <div className="shelves-controls">
          <h2 className="shelves-heading">
            The shelves
            <span className="shelves-count">
              {books.length === allBooks.length
                ? `${allBooks.length} volumes`
                : `${books.length} of ${allBooks.length} volumes`}
            </span>
          </h2>

          <div className="shelves-tools">
            <label className="shelves-search">
              <span className="sr-only">Search the shelves</span>
              <svg
                className="shelves-search-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title or author…"
                autoComplete="off"
              />
            </label>

            <label className="shelves-sort">
              <span className="shelves-sort-label">Order</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <BookList books={books} />
      </main>

      <footer className="colophon">
        <p className="colophon-fleuron" aria-hidden="true">
          ❦
        </p>
        <p className="colophon-line">
          Set in Fraunces &amp; Newsreader · Powered by markdown files and
          strong opinions
        </p>
        <a
          href="https://github.com/fourpointfour/book-recommendations"
          target="_blank"
          rel="noopener noreferrer"
        >
          View the source on GitHub
        </a>
      </footer>
    </div>
  )
}

export default App
