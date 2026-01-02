import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default accessibility attributes', () => {
        render(<LoadingSpinner />);

        // It should have role="status"
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // It should have a visually hidden label "Loading..." by default
        const srText = screen.getByText('Loading...');
        expect(srText).toHaveClass('sr-only');
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Processing data..." />);

        // Check for custom text
        expect(screen.getByText('Processing data...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="my-custom-class" />);
        // The container should have the custom class
        expect(container.firstChild).toHaveClass('my-custom-class');
    });

    it('renders with different sizes', () => {
        const { rerender, container } = render(<LoadingSpinner size="sm" />);
        // We can't easily check for specific size classes without implementation details,
        // but we can check it renders without error.
        expect(screen.getByRole('status')).toBeInTheDocument();

        rerender(<LoadingSpinner size="xl" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
