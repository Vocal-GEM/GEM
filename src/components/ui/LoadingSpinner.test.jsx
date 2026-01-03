import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with accessibility attributes', () => {
        render(<LoadingSpinner />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // It should have a visually hidden label "Loading..." by default
        const srText = screen.getByText('Loading...');
        expect(srText).toHaveClass('sr-only');
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Processing data..." />);
        expect(screen.getByText('Processing data...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="my-custom-class" />);
        expect(container.firstChild).toHaveClass('my-custom-class');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);
        expect(screen.getByRole('status')).toBeInTheDocument();

        rerender(<LoadingSpinner size="xl" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
