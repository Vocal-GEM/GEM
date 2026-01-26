import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyPhrases from './DailyPhrases';

describe('DailyPhrases Component', () => {
    it('renders the component with default empty state', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        expect(screen.getByText('My Daily Phrases')).toBeInTheDocument();
        expect(screen.getByText(/Practice with the words YOU actually say/i)).toBeInTheDocument();
        expect(screen.getByText(/Your list is empty/i)).toBeInTheDocument();
    });

    it('has accessible input and add button', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        // These should fail initially as we haven't added aria-labels yet
        const input = screen.getByLabelText(/new phrase/i);
        const addButton = screen.getByLabelText(/add phrase/i);

        expect(input).toBeInTheDocument();
        expect(addButton).toBeInTheDocument();
    });

    it('allows adding a phrase', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        // Find input by placeholder for now if label fails, but we want to test accessibility
        // So we'll try to use placeholder if label fails, to verify functionality
        const input = screen.getByPlaceholderText(/Type a phrase/i);
        fireEvent.change(input, { target: { value: 'Hello world' } });

        // Find button (might need to find by role button if label fails)
        const buttons = screen.getAllByRole('button');
        const addButton = buttons.find(b => b.querySelector('svg[data-testid="icon-plus"]')); // Finding the add button via icon if label missing

        // If we can't find it easily without implementation details, the test is proving its point about accessibility!
        // But let's assume we can click it to test logic.
        if (addButton) fireEvent.click(addButton);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('has accessible remove buttons for list items', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        // Add a phrase first
        const input = screen.getByPlaceholderText(/Type a phrase/i);
        fireEvent.change(input, { target: { value: 'Test Phrase' } });

        // Click add (finding the one with Plus icon)
        const addButton = screen.getAllByRole('button').find(b => b.querySelector('svg[data-testid="icon-plus"]'));
        fireEvent.click(addButton);

        // Check for remove button with accessible label
        const removeButton = screen.getByLabelText(/remove phrase: test phrase/i);
        expect(removeButton).toBeInTheDocument();
    });

    it('has accessible suggestion buttons', () => {
        render(<DailyPhrases onComplete={vi.fn()} />);

        // Check for a suggestion button
        const suggestions = screen.getAllByRole('button', { name: /add suggestion:/i });
        expect(suggestions.length).toBeGreaterThan(0);
    });
});
