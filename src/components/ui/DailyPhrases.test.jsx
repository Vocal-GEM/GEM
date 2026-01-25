import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyPhrases from './DailyPhrases';

describe('DailyPhrases', () => {
    it('renders with accessible elements', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        // These queries will fail if accessible names are missing
        expect(screen.getByRole('textbox', { name: /new phrase/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add phrase to list/i })).toBeInTheDocument();
    });

    it('manages phrases with accessible controls', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        const input = screen.getByRole('textbox', { name: /new phrase/i });
        const addButton = screen.getByRole('button', { name: /add phrase to list/i });

        fireEvent.change(input, { target: { value: 'Hello World' } });
        fireEvent.click(addButton);

        expect(screen.getByText('Hello World')).toBeInTheDocument();

        const removeButton = screen.getByRole('button', { name: /remove phrase "hello world"/i });
        expect(removeButton).toBeInTheDocument();

        fireEvent.click(removeButton);
        expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
    });

    it('has accessible suggestion buttons', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        // Pick one suggestion to test
        const suggestionButton = screen.getByRole('button', { name: /add suggestion: how are you doing today/i });
        expect(suggestionButton).toBeInTheDocument();

        fireEvent.click(suggestionButton);
        expect(screen.getByText('How are you doing today?')).toBeInTheDocument();
    });
});
