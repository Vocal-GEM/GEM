import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow, errorMessage = 'Test error' }) => {
    if (shouldThrow) {
        throw new Error(errorMessage);
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Suppress console.error for cleaner test output
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Test content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('displays error UI when child component throws', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('The application encountered an unexpected error.')).toBeInTheDocument();
    });

    it('displays the error message', () => {
        const errorMessage = 'Custom error message';

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ErrorBoundary>
        );

        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('displays reload button when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const reloadButton = screen.getByRole('button', { name: /reload application/i });
        expect(reloadButton).toBeInTheDocument();
    });

    it('calls window.location.reload when reload button is clicked', () => {
        const reloadMock = vi.fn();
        delete window.location;
        window.location = { reload: reloadMock };

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const reloadButton = screen.getByRole('button', { name: /reload application/i });
        reloadButton.click();

        expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it('renders custom fallback when provided', () => {
        const customFallback = <div>Custom error fallback</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('logs error to console when error is caught', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error');

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage="Test console error" />
            </ErrorBoundary>
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
        // Check that the error message is in one of the console.error calls
        const calls = consoleErrorSpy.mock.calls.flat();
        expect(calls.some(call => call?.toString().includes('Test console error'))).toBe(true);
    });

    it('does not show error UI for children that do not throw', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('maintains error state after catching an error', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        // Rerender with non-throwing child - should still show error
        rerender(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
