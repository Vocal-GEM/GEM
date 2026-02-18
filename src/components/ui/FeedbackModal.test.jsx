import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeedbackModal from './FeedbackModal';

describe('FeedbackModal', () => {
    it('should not render when not open', () => {
        render(<FeedbackModal isOpen={false} onClose={() => {}} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render correctly when open', () => {
        render(<FeedbackModal isOpen={true} onClose={() => {}} />);

        // Check for dialog role
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title');

        // Check for title
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Send Feedback/i);

        // Check for close button
        expect(screen.getByRole('button', { name: /Close feedback modal/i })).toBeInTheDocument();

        // Check for form inputs via labels
        expect(screen.getByLabelText(/Your thoughts/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email \(optional\)/i)).toBeInTheDocument();
    });

    it('should toggle between Feedback and Bug Report', () => {
        render(<FeedbackModal isOpen={true} onClose={() => {}} />);

        // Use exact string matching to differentiate "Feedback" toggle from "Send Feedback" button
        const feedbackButton = screen.getByRole('button', { name: 'Feedback' });
        const bugButton = screen.getByRole('button', { name: 'Bug Report' });

        // Default state
        expect(feedbackButton).toHaveAttribute('aria-pressed', 'true');
        expect(bugButton).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByLabelText(/Your thoughts/i)).toBeInTheDocument();

        // Switch to bug
        fireEvent.click(bugButton);
        expect(feedbackButton).toHaveAttribute('aria-pressed', 'false');
        expect(bugButton).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByLabelText(/Describe the issue/i)).toBeInTheDocument();
    });

    it('should handle close', () => {
        const handleClose = vi.fn();
        render(<FeedbackModal isOpen={true} onClose={handleClose} />);

        fireEvent.click(screen.getByRole('button', { name: /Close feedback modal/i }));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
