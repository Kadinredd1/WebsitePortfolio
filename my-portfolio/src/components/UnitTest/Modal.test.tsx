import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Modal from '../Modal'

describe('Modal', () => {
  const mockOnClose = vi.fn()
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    children: <div>Modal content</div>
  }

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('renders modal when open is true', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not render modal when open is false', () => {
    render(<Modal {...defaultProps} open={false} />)
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />)
    
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders children content correctly', () => {
    const testContent = <div data-testid="test-content">Test content</div>
    render(<Modal {...defaultProps} children={testContent} />)
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('has correct CSS classes', () => {
    render(<Modal {...defaultProps} />)
    
    const modal = screen.getByText('Modal content').closest('.modal')
    const modalContent = screen.getByText('Modal content').closest('.modal-content')
    
    expect(modal).toHaveClass('modal', 'active')
    expect(modalContent).toHaveClass('modal-content')
  })
})
