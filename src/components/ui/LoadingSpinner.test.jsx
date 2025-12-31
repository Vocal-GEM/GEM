import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with accessibility attributes', () => {
        render(<LoadingSpinner />);

        // Check for role="status"
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // Check for visually hidden loading text
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
});
