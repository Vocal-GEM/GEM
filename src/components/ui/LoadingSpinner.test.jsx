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
    it('renders with correct accessibility attributes', () => {
        render(<LoadingSpinner />);

        // Check for role="status"
        const statusElement = screen.getByRole('status');
        expect(statusElement).toBeInTheDocument();

        // Check for "Loading..." text
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Verify sr-only class is applied to text
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
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
