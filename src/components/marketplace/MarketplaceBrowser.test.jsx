import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MarketplaceBrowser } from './MarketplaceBrowser';
import React from 'react';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('MarketplaceBrowser', () => {
  it('renders the search input with accessible label', () => {
    render(<MarketplaceBrowser />);
    // This should fail until I add aria-label
    const input = screen.getByRole('textbox', { name: /search packs/i });
    expect(input).toBeInTheDocument();
  });

  it('allows typing in the search input', () => {
    render(<MarketplaceBrowser />);
    // We access by placeholder here just to be sure we can get it even if label check fails (though in strict TDD the above fails first)
    const input = screen.getByPlaceholderText(/search packs/i);
    fireEvent.change(input, { target: { value: 'voice' } });
    expect(input).toHaveValue('voice');
  });

  it('shows clear button when text is entered and clears it on click', () => {
    render(<MarketplaceBrowser />);
    const input = screen.getByPlaceholderText(/search packs/i);

    // Type something
    fireEvent.change(input, { target: { value: 'test' } });

    // Clear button should appear
    const clearBtn = screen.getByLabelText(/clear search/i);
    expect(clearBtn).toBeInTheDocument();

    // Click clear
    fireEvent.click(clearBtn);

    // Input should be empty
    expect(input).toHaveValue('');
    // Clear button should disappear
    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
  });

  it('focuses search input when pressing "/" key', () => {
    render(<MarketplaceBrowser />);
    const input = screen.getByPlaceholderText(/search packs/i);

    expect(document.activeElement).not.toBe(input);

    fireEvent.keyDown(document.body, { key: '/' });

    expect(document.activeElement).toBe(input);
  });

  it('does NOT focus search input when pressing "/" key if another input is focused', () => {
    render(
      <div>
        <MarketplaceBrowser />
        <input type="text" placeholder="Other input" />
      </div>
    );
    const searchInput = screen.getByPlaceholderText(/search packs/i);
    const otherInput = screen.getByPlaceholderText("Other input");

    // Focus other input
    otherInput.focus();
    expect(document.activeElement).toBe(otherInput);

    // Press /
    fireEvent.keyDown(document.body, { key: '/' });

    // Focus should remain on other input
    expect(document.activeElement).toBe(otherInput);
  });
});
