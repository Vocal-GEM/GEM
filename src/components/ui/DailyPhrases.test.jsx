import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DailyPhrases from './DailyPhrases';

describe('DailyPhrases Component', () => {
    it('renders input with accessible label', () => {
        render(<DailyPhrases />);
        // This should fail initially as there is no label or aria-label
        const input = screen.getByRole('textbox', { name: /new phrase/i });
        expect(input).toBeInTheDocument();
    });

    it('renders add button with accessible label', () => {
        render(<DailyPhrases />);
        // This should fail initially
        const addButton = screen.getByRole('button', { name: /add phrase/i });
        expect(addButton).toBeInTheDocument();
    });

    it('renders remove buttons with accessible labels after adding phrase', () => {
        render(<DailyPhrases />);

        // We use placeholder to find input initially since label doesn't exist yet
        const input = screen.getByPlaceholderText(/Type a phrase/i);

        // We find the button by its icon structure or just get the first button if name fails?
        // Actually, for the test setup, let's just try to add a phrase using the input and enter key
        // so we don't depend on the add button's accessible name for this test step yet.
        fireEvent.change(input, { target: { value: 'Test Phrase' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        // This should fail initially
        const removeButton = screen.getByRole('button', { name: /remove phrase: test phrase/i });
        expect(removeButton).toBeInTheDocument();
    });
});
