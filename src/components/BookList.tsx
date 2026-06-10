import { useEffect, useRef, useState } from 'react'
import type { Book } from '../types/book'
import { BookListItem } from './BookListItem'
import { BookModal } from './BookModal'
import './BookList.css'

interface BookListProps {
  books: Book[]
  query?: string
}

export function BookList({ books, query = '' }: BookListProps) {
  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  // Reveal cards as they scroll into view (staggered by CSS delay).
  useEffect(() => {
    const root = listRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = Array.from(root.querySelectorAll<HTMLElement>('.shelf-slot'))

    if (reduce) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )

    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [books])

  if (books.length === 0) {
    return (
      <div className="shelf-empty" role="status">
        <svg
          className="shelf-empty-icon"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2 2 2 0 0 1 2-2h4.5A1.5 1.5 0 0 1 20 5.5V18a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2 2 2 0 0 0-2-2H5a1 1 0 0 1-1-1V5.5ZM12 6v15"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="shelf-empty-title">
          {query ? 'Nothing matches that search.' : 'The shelf is bare.'}
        </p>
        <p className="shelf-empty-body">
          {query ? (
            <>
              Try a different title or author.
            </>
          ) : (
            <>
              Add markdown files under <code>src/books/</code> to fill it.
            </>
          )}
        </p>
      </div>
    )
  }

  const handleItemClick = (book: Book) => setActiveBook(book)

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    book: Book,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveBook(book)
    }
  }

  const handleCloseModal = () => setActiveBook(null)

  return (
    <>
      <ul className="shelf-grid" ref={listRef} aria-label="Book recommendations">
        {books.map((book, index) => (
          <li
            key={book.id}
            className="shelf-slot"
            style={{ '--reveal-delay': `${(index % 8) * 65}ms` } as React.CSSProperties}
            tabIndex={0}
            role="button"
            aria-label={`${book.meta.title} by ${book.meta.author}. Open details.`}
            onClick={() => handleItemClick(book)}
            onKeyDown={(event) => handleItemKeyDown(event, book)}
          >
            <BookListItem book={book} />
          </li>
        ))}
      </ul>

      <BookModal
        book={activeBook}
        open={Boolean(activeBook)}
        onClose={handleCloseModal}
      />
    </>
  )
}
