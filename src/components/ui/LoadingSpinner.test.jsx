import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default role="status"', () => {
        render(<LoadingSpinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('contains accessible label', () => {
        render(<LoadingSpinner />);
        // The label should be visually hidden but available to screen readers
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Processing..." />);
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />);
        // The first child of the rendered component should have the custom class
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders with size prop', () => {
        render(<LoadingSpinner size="lg" />);
        // We need to check if the inner container has the correct size class
        // This depends on implementation details, so we might need to adjust this test
        // depending on how we implement the size prop.
        // For now, let's assume size="lg" adds a specific class or style.
    });
});
