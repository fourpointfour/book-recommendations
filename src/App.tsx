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
              <p className="app-panel-meta">Books will appear here from markdown files.</p>
            </div>

            <div className="app-empty-state">
              <p className="app-empty-title">
                No books yet – but the shelf is ready.
              </p>
              <p className="app-empty-body">
                Once we wire up the markdown loader, each{' '}
                <code>src/books/*.md</code> file will show up here as a book
                card with a thumbnail, title, and author.
              </p>
            </div>
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
