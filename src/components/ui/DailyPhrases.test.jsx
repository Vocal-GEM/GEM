import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyPhrases from './DailyPhrases';

describe('DailyPhrases', () => {
    it('has accessible input and buttons', () => {
        const handleComplete = vi.fn();
        render(<DailyPhrases onComplete={handleComplete} />);

        // 1. Check Input has label
        // This should fail initially because there is no label or aria-label
        // We use a try/catch block or just expect it to throw to verify failure in the next step,
        // but for now I will write the test as if it should pass, so it fails when I run it.
        const input = screen.getByRole('textbox', { name: /new phrase/i });
        expect(input).toBeInTheDocument();

        // 2. Check Add Button has label
        const addButton = screen.getByRole('button', { name: /add phrase/i });
        expect(addButton).toBeInTheDocument();

        // 3. Add a phrase to check remove button accessibility
        fireEvent.change(input, { target: { value: 'Test Phrase' } });
        fireEvent.click(addButton);

        // 4. Check Remove Button has specific label
        const removeButton = screen.getByRole('button', { name: /remove phrase "test phrase"/i });
        expect(removeButton).toBeInTheDocument();
    });
});
