import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with role="status"', () => {
        render(<LoadingSpinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('contains accessible label', () => {
        render(<LoadingSpinner />);
        // The label should be visually hidden but available to screen readers
        const label = screen.getByText('Loading...');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('sr-only');
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
});
