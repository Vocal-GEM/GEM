import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with correct accessibility attributes', () => {
        render(<LoadingSpinner />);

        // Check for role="status"
        const statusElement = screen.getByRole('status');
        expect(statusElement).toBeInTheDocument();

        // Check for "Loading..." text
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Verify sr-only class is applied to text
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
});
