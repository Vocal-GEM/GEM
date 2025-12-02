import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalErrorBoundary from './GlobalErrorBoundary';

// Mock FeedbackModal
vi.mock('./FeedbackModal', () => ({
    default: ({ isOpen, onClose, initialType, errorDetails }) => (
        isOpen ? (
            <div data-testid="feedback-modal">
                <span>Feedback Modal</span>
                <span>Type: {initialType}</span>
                <span>Error: {errorDetails?.toString()}</span>
                <button onClick={onClose}>Close Feedback</button>
            </div>
        ) : null
    ),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow, errorMessage = 'Test error' }) => {
    if (shouldThrow) {
        throw new Error(errorMessage);
    }
    return <div>No error</div>;
};

describe('GlobalErrorBoundary', () => {
    beforeEach(() => {
        // Suppress console.error for cleaner test output
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders children when there is no error', () => {
        render(
            <GlobalErrorBoundary>
                <div>Test content</div>
            </GlobalErrorBoundary>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('displays error UI when child component throws', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('The app encountered an unexpected error')).toBeInTheDocument();
    });

    it('displays the error message', () => {
        const errorMessage = 'Custom error message';

        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('displays all action buttons when error occurs', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reload app/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument();
    });

    it('calls window.location.reload when reload button is clicked', () => {
        const reloadMock = vi.fn();
        delete window.location;
        window.location = { reload: reloadMock };

        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        const reloadButton = screen.getByRole('button', { name: /reload app/i });
        fireEvent.click(reloadButton);

        expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it('resets error state when try again button is clicked', () => {
        const { rerender } = render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

        const tryAgainButton = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(tryAgainButton);

        // After reset, should try to render children again
        rerender(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={false} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
        expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });

    it('opens feedback modal when report bug button is clicked', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage="Bug report test" />
            </GlobalErrorBoundary>
        );

        const reportButton = screen.getByRole('button', { name: /report bug/i });
        fireEvent.click(reportButton);

        expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
        expect(screen.getByText('Type: bug')).toBeInTheDocument();
    });

    it('closes feedback modal when close button is clicked', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        // Open feedback modal
        const reportButton = screen.getByRole('button', { name: /report bug/i });
        fireEvent.click(reportButton);
        expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();

        // Close feedback modal
        const closeButton = screen.getByRole('button', { name: /close feedback/i });
        fireEvent.click(closeButton);
        expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument();
    });

    it('logs error to console when error is caught', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error');

        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage="Console test error" />
            </GlobalErrorBoundary>
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
        const calls = consoleErrorSpy.mock.calls.flat();
        expect(calls.some(call => call?.toString().includes('Console test error'))).toBe(true);
    });

    it('shows stack trace in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText('Stack Trace')).toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('hides stack trace in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.queryByText('Stack Trace')).not.toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('displays support message at the bottom', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText(/if this problem persists/i)).toBeInTheDocument();
    });

    it('passes error details to feedback modal', () => {
        const errorMessage = 'Detailed error for feedback';

        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </GlobalErrorBoundary>
        );

        const reportButton = screen.getByRole('button', { name: /report bug/i });
        fireEvent.click(reportButton);

        expect(screen.getByText(`Error: Error: ${errorMessage}`)).toBeInTheDocument();
    });
});
