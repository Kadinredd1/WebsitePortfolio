
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the child components
vi.mock('../Projects', () => ({
  default: () => <div data-testid="projects-component">Projects Component</div>
}));

vi.mock('../GitHub', () => ({
  default: () => <div data-testid="github-component">GitHub Component</div>
}));

describe('App', () => {
  it('renders navigation with Projects and GitHub', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Projects/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument();
  });

  it('shows Projects component by default', () => {
    render(<App />);
    expect(screen.getByTestId('projects-component')).toBeInTheDocument();
  });

  it('navigates to GitHub when GitHub button is clicked', () => {
    render(<App />);
    const githubBtn = screen.getByRole('button', { name: /GitHub/i });
    fireEvent.click(githubBtn);
    expect(screen.getByTestId('github-component')).toBeInTheDocument();
  });

  it('shows admin login button in header', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
