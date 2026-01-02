import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
    it('renders with accessibility attributes', () => {
        render(<LoadingSpinner />);

        // Should have role="status" to announce loading state
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // Should have a label for screen readers
        expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
});
