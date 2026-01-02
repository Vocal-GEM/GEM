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
    it('renders with default accessibility attributes', () => {
        render(<LoadingSpinner />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-label', 'Loading content...');
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
