import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default accessibility attributes', () => {
        render(<LoadingSpinner />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-label', 'Loading content...');
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Processing..." />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveAttribute('aria-label', 'Processing...');
        // Also check if the sr-only text is present
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('applies custom class names', () => {
        const customClass = 'custom-wrapper-class';
        render(<LoadingSpinner className={customClass} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass(customClass);
    });

    it('allows customizing size and color (via props logic check)', () => {
        // Since we can't easily check internal styles of child divs without data-testids,
        // we'll rely on the fact that the component should render without crashing when these are passed.
        // If we really wanted to test this, we'd need to inspect the inner HTML or add test ids.
        const { container } = render(<LoadingSpinner size="w-20 h-20" color="border-t-red-500" />);
        expect(container.innerHTML).toContain('w-20 h-20');
        expect(container.innerHTML).toContain('border-t-red-500');
    });
});
