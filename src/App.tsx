import { BookList } from './components/BookList'
import './App.css'

function App() {
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
            Markdown-driven
          </div>
        </header>

        <main className="app-main">
          <section className="app-panel" aria-label="Book list">
            <div className="app-panel-header">
              <h2 className="app-panel-title">Your reading list</h2>
              <p className="app-panel-meta">Books loaded from markdown files in src/books/.</p>
            </div>

            <BookList />
          </section>
        </main>

        <footer className="app-footer">
          <span>Step 1 · Project scaffold & theme</span>
          <span>
            Future steps: add markdown books, detail popups, and automatic
            GitHub Pages deploys.
          </span>
        </footer>
      </div>
    </div>
  )
}

export default App
