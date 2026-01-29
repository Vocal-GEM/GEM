import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyPhrases from './DailyPhrases';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Plus: (props) => <svg {...props} data-testid="icon-plus" />,
    Trash2: (props) => <svg {...props} data-testid="icon-trash" />,
    MessageSquare: (props) => <svg {...props} data-testid="icon-message" />
}));

describe('DailyPhrases Accessibility', () => {
    it('has an accessible label for the input field', () => {
        render(<DailyPhrases onComplete={() => {}} />);
        // Currently missing label
        expect(screen.getByLabelText(/new phrase/i)).toBeInTheDocument();
    });

    it('has an accessible label for the add button', () => {
        render(<DailyPhrases onComplete={() => {}} />);
        // Currently missing aria-label
        expect(screen.getByLabelText(/add phrase/i)).toBeInTheDocument();
    });

    it('has accessible labels for remove buttons', () => {
        render(<DailyPhrases onComplete={() => {}} />);

        // Add a phrase
        const input = screen.getByPlaceholderText(/Type a phrase/i);
        fireEvent.change(input, { target: { value: 'Hello World' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // Currently missing aria-label
        expect(screen.getByLabelText(/remove phrase hello world/i)).toBeInTheDocument();
    });
});
