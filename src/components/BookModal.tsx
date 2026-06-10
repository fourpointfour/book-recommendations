import { useEffect, useRef } from 'react'
import type { Book } from '../types/book'
import ReactMarkdown from 'react-markdown'
import bookIcon from '../assets/book-icon.png'
import { RatingStars } from './RatingStars'
import './BookModal.css'

interface BookModalProps {
  book: Book | null
  open: boolean
  onClose: () => void
}

export function BookModal({ book, open, onClose }: BookModalProps) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const modalRoot = document.querySelector<HTMLElement>('.book-modal')
    if (!modalRoot) return

    const FOCUSABLE_SELECTOR =
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const getFocusable = () =>
      Array.from(modalRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (active === first || !modalRoot.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)

    const initialFocusTarget = modalRoot.querySelector<HTMLElement>('.book-modal-close')
    initialFocusTarget?.focus()

    return () => {
      document.removeEventListener('keydown', handleTab)
      const restore = previouslyFocused.current
      if (restore && typeof restore.focus === 'function') {
        requestAnimationFrame(() => restore.focus())
      }
    }
  }, [open])

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
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 3 L13 13 M13 3 L3 13"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* — Left: cinematic 3D cover plate — */}
        <aside className="book-modal-plate">
          <div className="book-modal-cover">
            <img
              src={hasImage ? meta.image : bookIcon}
              alt={`Cover of ${meta.title}`}
              className="book-modal-cover-img"
              onError={(event) => {
                event.currentTarget.src = bookIcon
              }}
            />
            <span className="book-modal-cover-pages" aria-hidden="true" />
          </div>
        </aside>

        {/* — Right: details — */}
        <div className="book-modal-body">
          <header className="book-modal-head">
            <p className="kicker">From the shelf</p>
            <h2 id={labelId} className="book-modal-title">
              {meta.title}
            </h2>
            <p className="book-modal-author">by {meta.author}</p>
            <div className="book-modal-rating">
              <RatingStars rating={meta.ratingValue} />
            </div>
          </header>

          <div className="book-modal-notes">
            <h3 className="book-modal-notes-title">
              <span className="book-modal-notes-rule" aria-hidden="true" />
              <span className="sr-only">Notes</span>
            </h3>
            <div className="book-modal-notes-body">
              {notes.trim().length > 0 ? (
                <ReactMarkdown>{notes}</ReactMarkdown>
              ) : (
                <p className="book-modal-notes-empty">
                  No notes yet. Add markdown content below the frontmatter in
                  this book&apos;s file to see it here.
                </p>
              )}
            </div>
          </div>

          <a
            href={meta.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="book-modal-link"
          >
            Acquire this book
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17 17 7M9 7h8v8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  )
}

