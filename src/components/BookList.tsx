import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Book } from '../types/book'
import { BookListItem } from './BookListItem'
import { BookModal } from './BookModal'
import './BookList.css'

interface BookListProps {
  books: Book[]
}

export function BookList({ books }: BookListProps) {
  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const items = Array.from(list.querySelectorAll<HTMLElement>('.book-list-item'))

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-revealed'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [books])

  if (books.length === 0) {
    return (
      <div className="book-list book-list--empty" role="status">
        <p className="book-list-empty-fleuron" aria-hidden="true">
          ❦
        </p>
        <p className="book-list-empty-message">
          Nothing on this shelf. Try a different search, or add markdown files
          under <code>src/books/</code>.
        </p>
      </div>
    )
  }

  const handleItemClick = (book: Book) => {
    setActiveBook(book)
  }

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, book: Book) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveBook(book)
    }
  }

  const handleCloseModal = () => {
    setActiveBook(null)
  }

  return (
    <>
      <ul className="book-list" aria-label="Book recommendations" ref={listRef}>
        {books.map((book, index) => (
          <li
            key={book.id}
            className="book-list-item"
            style={{ '--stagger': index % 8 } as CSSProperties}
            tabIndex={0}
            role="button"
            onClick={() => handleItemClick(book)}
            onKeyDown={(event) => handleItemKeyDown(event, book)}
          >
            <BookListItem book={book} index={index} />
          </li>
        ))}
      </ul>

      <BookModal book={activeBook} open={Boolean(activeBook)} onClose={handleCloseModal} />
    </>
  )
}
