import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookModal } from './BookModal'
import type { Book } from '../types/book'

const mockBook: Book = {
  id: 'test-book',
  meta: {
    slug: 'test-book',
    title: 'Test Book',
    author: 'Test Author',
    rating: '4/5',
    ratingValue: 4,
    buyLink: 'https://example.com/buy',
  },
  notes: '',
}

describe('BookModal', () => {
  it('renders nothing when closed', () => {
    render(<BookModal book={mockBook} open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open', () => {
    render(<BookModal book={mockBook} open={true} onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('focuses the close button when the modal opens', async () => {
    render(<BookModal book={mockBook} open={true} onClose={() => {}} />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Close book details' })
      ).toHaveFocus()
    })
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<BookModal book={mockBook} open={true} onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('wraps Tab forward from the last focusable element to the first', async () => {
    render(<BookModal book={mockBook} open={true} onClose={() => {}} />)
    const closeButton = screen.getByRole('button', { name: 'Close book details' })
    const buyLink = screen.getByRole('link', { name: /buy this book/i })

    // Initial focus lands on close button (first)
    await waitFor(() => expect(closeButton).toHaveFocus())

    // Move focus to the last element (buy link)
    act(() => buyLink.focus())
    expect(buyLink).toHaveFocus()

    // Tab from last element → wraps to first (close button)
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
  })

  it('wraps Shift+Tab backward from the first focusable element to the last', async () => {
    render(<BookModal book={mockBook} open={true} onClose={() => {}} />)
    const closeButton = screen.getByRole('button', { name: 'Close book details' })
    const buyLink = screen.getByRole('link', { name: /buy this book/i })

    // Initial focus lands on close button (first)
    await waitFor(() => expect(closeButton).toHaveFocus())

    // Shift+Tab from first element → wraps to last (buy link)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(buyLink).toHaveFocus()
  })

  it('restores focus to the element that was focused when the modal opened', async () => {
    // Create an element that will act as the trigger
    const trigger = document.createElement('button')
    trigger.textContent = 'Open modal'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(trigger).toHaveFocus()

    const { rerender } = render(
      <BookModal book={mockBook} open={true} onClose={() => {}} />
    )

    // Confirm modal stole focus
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Close book details' })
      ).toHaveFocus()
    })

    // Close the modal — effect cleanup fires requestAnimationFrame(() => restore.focus())
    rerender(<BookModal book={mockBook} open={false} onClose={() => {}} />)

    // waitFor polls until rAF callback has run and restored focus
    await waitFor(() => expect(trigger).toHaveFocus())

    document.body.removeChild(trigger)
  })
})
