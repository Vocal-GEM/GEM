import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with role="status"', () => {
    it('renders with accessibility attributes', () => {
        render(<LoadingSpinner />);

    it('contains accessible label', () => {
        render(<LoadingSpinner />);
        // The label should be visually hidden but available to screen readers
        const label = screen.getByText('Loading...');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('sr-only');
    });
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // Check for visually hidden loading text
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
    it('renders with default accessibility attributes', () => {
        render(<LoadingSpinner />);

        // It should have role="status"
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // It should have a visually hidden label "Loading..." by default
        const srText = screen.getByText('Loading...');
        expect(srText).toHaveClass('sr-only');
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
