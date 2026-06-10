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

        <span className="book-modal-ribbon" aria-hidden="true" />

        <aside className="book-modal-plate">
          <div className="book-modal-plate-cover">
            <img
              src={hasImage ? meta.image : bookIcon}
              alt={hasImage ? `Cover of ${meta.title}` : `Default cover for ${meta.title}`}
              className="book-modal-plate-img"
              onError={(event) => {
                event.currentTarget.src = bookIcon
              }}
            />
          </div>

          <div className="book-modal-plate-rating">
            <RatingStars rating={meta.ratingValue} />
          </div>

          <a
            href={meta.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="book-modal-buy"
          >
            Buy this book
            <span className="sr-only"> (opens in a new tab)</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </aside>

        <div className="book-modal-page">
          <p className="book-modal-kicker">From the shelves of Vaibhav</p>
          <h2 id={labelId} className="book-modal-title">
            {meta.title}
          </h2>
          <p className="book-modal-author">by {meta.author}</p>

          <p className="book-modal-rule" aria-hidden="true">
            ❦
          </p>

          <div className="book-modal-notes">
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
  )
}
