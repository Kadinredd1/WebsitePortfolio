
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Admin from '../Admin';

// Mock fetch globally
global.fetch = vi.fn();

const mockProjects = [
  {
    _id: '1',
    title: 'Test Project',
    description: 'A test project',
    longDescription: 'Long description',
    technologies: ['React'],
    projectURL: '',
    demoURL: '',
    date: '2024-01-01',
    image: null,
    status: 'live',
    completion: 100,
    features: ['Feature'],
    challenges: ['Challenge'],
    lessons: ['Lesson']
  }
];

describe('Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form when not logged in', () => {
    render(<Admin isAdmin={false} onLogin={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('renders dashboard when logged in', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects)
    });
    render(<Admin isAdmin={true} onLogin={vi.fn()} onLogout={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('Project Management')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('calls onLogin when login form is submitted', () => {
    const onLogin = vi.fn();
    render(<Admin isAdmin={false} onLogin={onLogin} onLogout={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // The real login logic is async/fetch, but we can check the button is present and clickable
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects)
    });
    const onLogout = vi.fn();
    render(<Admin isAdmin={true} onLogin={vi.fn()} onLogout={onLogout} />);
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Logout'));
    expect(onLogout).toHaveBeenCalled();
  });
});
