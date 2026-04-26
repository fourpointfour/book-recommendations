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
  const modalRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const getFocusables = (): HTMLElement[] => {
      const root = modalRef.current
      if (!root) return []
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), ' +
            'select:not([disabled]), textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"])',
        ),
      )
    }

    queueMicrotask(() => getFocusables()[0]?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = getFocusables()
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      const insideModal = modalRef.current?.contains(active ?? null) ?? false

      if (event.shiftKey) {
        if (!insideModal || active === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (!insideModal || active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus()
    }
  }, [open, onClose])

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
        ref={modalRef}
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
                onError={(event) => {
                  event.currentTarget.src = bookIcon
                }}
              />
            ) : (
              <img
                src={bookIcon}
                alt={`Default cover for ${meta.title}`}
                className="book-modal-thumb-img"
              />
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
              <RatingStars rating={meta.ratingValue} />
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
                <ReactMarkdown>{notes}</ReactMarkdown>
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

