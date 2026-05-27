import { BookList } from './components/BookList'
import { loadBooks } from './utils/loadBooks'
import './App.css'

function App() {
  const books = loadBooks()

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="app-title-block">
            <h1 className="app-title">
              <span>Book recommendations</span>
            </h1>
            <p className="app-subtitle">
              A minimal, markdown-powered shelf of books I love.
            </p>
          </div>
          <div className="app-badge" aria-hidden="true">
            <span className="app-badge-dot" />
            {books.length} book{books.length === 1 ? '' : 's'}
          </div>
        </header>

        <main className="app-main">
          <section className="app-panel" aria-label="Book list">
            <div className="app-panel-header">
              <h2 className="app-panel-title">Your reading list</h2>
              <p className="app-panel-meta">Sorted alphabetically by title.</p>
            </div>

            <BookList books={books} />
          </section>
        </main>

        <footer className="app-footer">
          <span>Markdown-powered · Click a book for details</span>
          <a
            href="https://github.com/fourpointfour/book-recommendations"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App
