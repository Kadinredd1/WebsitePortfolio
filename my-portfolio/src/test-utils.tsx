import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthProvider } from './context/AuthContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock auth context for testing
export const mockAuthContext = {
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  user: null,
  loading: false,
}

// Helper to render with specific auth state
export const renderWithAuth = (
  ui: ReactElement,
  authState: Partial<typeof mockAuthContext> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const mockContext = { ...mockAuthContext, ...authState }
  
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
  
  return render(ui, { wrapper: TestWrapper, ...options })
} 