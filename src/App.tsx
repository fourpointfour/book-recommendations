import { useEffect, useMemo, useState } from 'react'
import { BookList } from './components/BookList'
import { loadBooks } from './utils/loadBooks'
import './App.css'

type SortKey = 'title' | 'rating'

function App() {
  const books = useMemo(() => loadBooks(), [])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('title')

  // Cursor-following spotlight that warms the aurora backdrop.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100
        const y = (e.clientY / window.innerHeight) * 100
        document.documentElement.style.setProperty('--spot-x', `${x}%`)
        document.documentElement.style.setProperty('--spot-y', `${y}%`)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const stats = useMemo(() => {
    if (books.length === 0) return { count: 0, avg: 0, top: 0 }
    const total = books.reduce((sum, b) => sum + b.meta.ratingValue, 0)
    const top = books.reduce((max, b) => Math.max(max, b.meta.ratingValue), 0)
    return {
      count: books.length,
      avg: total / books.length,
      top,
    }
  }, [books])

  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? books.filter(
          (b) =>
            b.meta.title.toLowerCase().includes(q) ||
            b.meta.author.toLowerCase().includes(q),
        )
      : books

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'rating') {
        return b.meta.ratingValue - a.meta.ratingValue
      }
      return a.meta.title.localeCompare(b.meta.title)
    })
    return sorted
  }, [books, query, sort])

  // Top covers, fanned in the hero as a decorative stack.
  const fannedCovers = useMemo(
    () =>
      [...books]
        .filter((b) => b.meta.image && b.meta.image.trim().length > 0)
        .sort((a, b) => b.meta.ratingValue - a.meta.ratingValue)
        .slice(0, 5),
    [books],
  )

  return (
    <div className="app">
      <div className="vignette" aria-hidden="true" />

      <header className="hero">
        <div className="hero-copy">
          <p className="kicker hero-kicker">Vaibhav's Collection · Est. MMXXVI</p>
          <h1 className="hero-title">
            <span className="hero-title-line">Books worth</span>
            <span className="hero-title-line hero-title-em">your time.</span>
          </h1>
          <p className="hero-lede">
            A hand-bound, markdown-powered shelf of the stories that stayed with
            me — read slowly, rated honestly, and kept close.
          </p>

          <dl className="hero-stats">
            <div className="stat">
              <dt className="stat-label">On the shelf</dt>
              <dd className="stat-value">{stats.count}</dd>
            </div>
            <div className="stat-sep" aria-hidden="true" />
            <div className="stat">
              <dt className="stat-label">Average rating</dt>
              <dd className="stat-value">
                {stats.avg.toFixed(1)}
                <span className="stat-unit">/5</span>
              </dd>
            </div>
            <div className="stat-sep" aria-hidden="true" />
            <div className="stat">
              <dt className="stat-label">Highest praise</dt>
              <dd className="stat-value">
                {stats.top}
                <span className="stat-unit">/5</span>
              </dd>
            </div>
          </dl>
        </div>

        {fannedCovers.length > 0 && (
          <div className="hero-fan" aria-hidden="true">
            {fannedCovers.map((book, i) => (
              <div
                key={book.id}
                className="hero-fan-book"
                style={
                  {
                    '--i': i,
                    '--n': fannedCovers.length,
                  } as React.CSSProperties
                }
              >
                <img src={book.meta.image} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="shelf" aria-label="Book recommendations">
        <div className="shelf-toolbar">
          <div className="shelf-heading">
            <h2 className="shelf-title">The Collection</h2>
            <p className="shelf-meta">
              {visibleBooks.length}
              {query ? ` of ${books.length}` : ''} volume
              {visibleBooks.length === 1 ? '' : 's'}
              {query ? ' found' : ''}
            </p>
          </div>

          <div className="shelf-controls">
            <div className="search">
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m20 20-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Search title or author…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search books by title or author"
              />
            </div>

            <div
              className="sort"
              role="group"
              aria-label="Sort the collection"
            >
              <button
                type="button"
                className={`sort-btn ${sort === 'title' ? 'is-active' : ''}`}
                onClick={() => setSort('title')}
                aria-pressed={sort === 'title'}
              >
                A–Z
              </button>
              <button
                type="button"
                className={`sort-btn ${sort === 'rating' ? 'is-active' : ''}`}
                onClick={() => setSort('rating')}
                aria-pressed={sort === 'rating'}
              >
                Top rated
              </button>
            </div>
          </div>
        </div>

        <BookList books={visibleBooks} query={query} />
      </main>

      <footer className="app-footer">
        <span className="app-footer-mark">✦</span>
        <span>Bound in markdown · Click any spine to read on</span>
        <a
          href="https://github.com/fourpointfour/book-recommendations"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source
        </a>
      </footer>
    </div>
  )
}

export default App
