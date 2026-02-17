import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MicQualityTips from './MicQualityTips';

// Mock dependencies
vi.mock('lucide-react', () => ({
  Mic: (props) => <div data-testid="mic-icon" {...props} />,
  X: (props) => <div data-testid="x-icon" {...props} />,
}));

vi.mock('../../data/micQualityTips', () => ({
  micQualityTips: [
    {
      id: 1,
      title: 'Use headphones',
      desc: 'Prevents echo',
      icon: <div data-testid="tip-icon" />,
      color: 'blue'
    }
  ]
}));

describe('MicQualityTips', () => {
  it('renders correctly and has accessibility attributes', () => {
    const handleClose = vi.fn();
    render(<MicQualityTips onClose={handleClose} />);

    // Check for dialog role
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'mic-tips-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'mic-tips-desc');

    // Check title and description IDs
    expect(screen.getByText('Recording Tips')).toHaveAttribute('id', 'mic-tips-title');
    expect(screen.getByText(/Follow these tips/)).toHaveAttribute('id', 'mic-tips-desc');

    // Check close button has aria-label
    // The X icon is inside a button. We need to find the button that contains it.
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(b => b.querySelector('[data-testid="x-icon"]'));
    expect(xButton).toHaveAttribute('aria-label', 'Close');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MicQualityTips onClose={handleClose} />);

    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(b => b.querySelector('[data-testid="x-icon"]'));
    fireEvent.click(xButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Got It!" button is clicked', () => {
    const handleClose = vi.fn();
    render(<MicQualityTips onClose={handleClose} />);

    const gotItButton = screen.getByText('Got It!');
    fireEvent.click(gotItButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<MicQualityTips onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the close button on mount', () => {
      const handleClose = vi.fn();
      render(<MicQualityTips onClose={handleClose} />);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(b => b.querySelector('[data-testid="x-icon"]'));
      expect(document.activeElement).toBe(xButton);
  });
});
