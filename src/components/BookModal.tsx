import type { Book } from '../types/book'
import './BookModal.css'

interface BookModalProps {
  book: Book | null
  open: boolean
  onClose: () => void
}

export function BookModal({ book, open, onClose }: BookModalProps) {
  if (!open || !book) return null

  const { meta, notes } = book
  const hasImage = meta.image && meta.image.trim().length > 0
  const labelId = `book-modal-title-${meta.slug}`

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="book-modal-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="book-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
      >
        <button
          type="button"
          className="book-modal-close"
          onClick={onClose}
          aria-label="Close book details"
        >
          ×
        </button>

        <div className="book-modal-header">
          <div className="book-modal-thumb">
            {hasImage ? (
              <img
                src={meta.image}
                alt={`Cover of ${meta.title}`}
                className="book-modal-thumb-img"
              />
            ) : (
              <div className="book-modal-thumb-placeholder" aria-hidden="true">
                <span className="book-modal-thumb-icon">📘</span>
              </div>
            )}
          </div>
          <div className="book-modal-header-text">
            <h2 id={labelId} className="book-modal-title">
              {meta.title}
            </h2>
            <p className="book-modal-author">{meta.author}</p>
          </div>
        </div>

        <div className="book-modal-body">
          <div className="book-modal-row">
            <span className="book-modal-label">Rating</span>
            <span className="book-modal-value">
              {meta.rating} (stars coming next step)
            </span>
          </div>

          <div className="book-modal-row">
            <span className="book-modal-label">Get this book</span>
            <a
              href={meta.buyLink}
              target="_blank"
              rel="noreferrer"
              className="book-modal-link"
            >
              Open link in new tab
            </a>
          </div>

          <div className="book-modal-notes">
            <h3 className="book-modal-notes-title">Personal notes</h3>
            <div className="book-modal-notes-body">
              {notes.trim().length > 0 ? (
                <p>{notes}</p>
              ) : (
                <p className="book-modal-notes-empty">
                  No notes yet. Add markdown content below the frontmatter in
                  this book&apos;s file to see it here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

