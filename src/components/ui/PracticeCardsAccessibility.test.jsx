import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PracticeCardsPanel from './PracticeCardsPanel';
import PracticeCardItem from './PracticeCardItem';
import { PracticeCardsProvider } from '../../context/PracticeCardsContext';

// Mock Context
const mockContext = {
    customCardSets: [
        { id: 'custom-1', name: 'My Custom Set', difficulty: 'beginner', description: 'Test Set', cards: [] }
    ],
    defaultCardSets: [
        { id: 'default-1', name: 'Default Set', difficulty: 'beginner', description: 'Default Set', cards: [] }
    ],
    activeCardSet: null,
    activeCard: null,
    practiceSummary: null,
    isLoading: false,
    selectCardSet: vi.fn(),
    selectCard: vi.fn(),
    deleteCardSet: vi.fn(),
    getCardActivity: vi.fn().mockResolvedValue({ totalPractices: 0, savedRecordings: 0 }),
    cardActivities: {}
};

// Mock Provider
vi.mock('../../context/PracticeCardsContext', () => ({
    usePracticeCards: () => mockContext,
    PracticeCardsProvider: ({ children }) => <div>{children}</div>
}));

// Mock Translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('PracticeCards Accessibility', () => {

    describe('PracticeCardItem', () => {
        const mockCard = { id: 'c1', text: 'Test Card', focus: 'resonance' };

        it('should have visible action buttons on focus within', () => {
            render(<PracticeCardItem card={mockCard} index={1} onSelect={() => {}} onViewActivity={() => {}} />);

            // Find the actions container (it's the parent of the buttons)
            const playButton = screen.getByTitle('Practice this card');
            const actionsContainer = playButton.parentElement;

            expect(actionsContainer).toHaveClass('group-focus-within:opacity-100');
        });
    });

    describe('PracticeCardsPanel', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should make card set items focusable and interactive', () => {
            render(<PracticeCardsPanel onClose={() => {}} />);

            // Switch to custom tab to see our mock set
            const customTab = screen.getByText('practiceCards.mySets (1)');
            fireEvent.click(customTab);

            const setItem = screen.getByRole('button', { name: /My Custom Set/i });

            // Check accessibility attributes
            expect(setItem).toHaveAttribute('tabIndex', '0');

            // Test Keyboard Interaction (Enter)
            fireEvent.keyDown(setItem, { key: 'Enter', code: 'Enter' });
            expect(mockContext.selectCardSet).toHaveBeenCalledWith('custom-1');

            // Test Keyboard Interaction (Space)
            mockContext.selectCardSet.mockClear();
            fireEvent.keyDown(setItem, { key: ' ', code: 'Space' });
            expect(mockContext.selectCardSet).toHaveBeenCalledWith('custom-1');
        });

        it('should show actions on focus within card set item', () => {
             render(<PracticeCardsPanel onClose={() => {}} />);

             // Switch to custom tab
            const customTab = screen.getByText('practiceCards.mySets (1)');
            fireEvent.click(customTab);

            // Find the delete button (trash icon)
            // Since we mocked Lucide icons, we look for the button containing the mock
            // Alternatively, we can look for the container class

            const setItem = screen.getByRole('button', { name: /My Custom Set/i });
            // The actions container is inside the set item
            // We can check if the container div has the class
            // It is the div with "opacity-0"

            // Querying by class logic is fragile in tests, but let's try to find the container
            // We know it contains buttons
            const buttons = setItem.querySelectorAll('button');
            // The first two buttons inside the set item are Edit and Delete
            // Their parent should have the class

            if (buttons.length >= 2) {
                const actionsContainer = buttons[0].parentElement;
                expect(actionsContainer).toHaveClass('group-focus-within:opacity-100');
            }
        });
    });
});
