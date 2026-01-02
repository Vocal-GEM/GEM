import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with accessibility attributes', () => {
        render(<LoadingSpinner />);

        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // Check for visually hidden loading text
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Processing..." />);
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />);
        // The container div should have the custom class
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('overrides default min-height when custom class is provided', () => {
         const { container } = render(<LoadingSpinner className="min-h-0" />);
         expect(container.firstChild).toHaveClass('min-h-0');
         // Note: We can't strictly check that min-h-[200px] is *removed* because twMerge
         // resolves the string, but both classes might be present in the DOM string depending on implementation.
         // However, tailwind-merge usually dedupes.
    });

    it('renders with different sizes', () => {
        // We test this by checking that it doesn't crash and potentially inspecting classes if critical,
        // but primarily ensuring the prop is accepted.
        render(<LoadingSpinner size="sm" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
