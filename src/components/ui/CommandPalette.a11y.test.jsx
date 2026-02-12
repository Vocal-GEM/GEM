import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommandPalette from './CommandPalette';
import { useNavigation } from '../../context/NavigationContext';
import { useAudio } from '../../context/AudioContext';

// Mock contexts
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: vi.fn()
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn()
}));

// Mock createPortal
vi.mock('react-dom', () => ({
    ...vi.importActual('react-dom'),
    createPortal: (node) => node,
}));

describe('CommandPalette Accessibility', () => {
    const mockNavigate = vi.fn();
    const mockCloseModal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigation.mockReturnValue({
            modals: { commandPalette: true },
            closeModal: mockCloseModal,
            navigate: mockNavigate,
            switchPracticeTab: vi.fn(),
            openModal: vi.fn(),
            addToHistory: vi.fn()
        });
        useAudio.mockReturnValue({
            toggleAudio: vi.fn(),
            isAudioActive: false
        });
    });

    it('should have proper ARIA roles for combobox pattern', () => {
        render(<CommandPalette />);

        // Input should be a combobox
        const input = screen.getByRole('combobox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-autocomplete', 'list');
        expect(input).toHaveAttribute('aria-expanded', 'true');

        // Results should be a listbox
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();

        // Input should control listbox
        expect(input).toHaveAttribute('aria-controls', listbox.id);
    });

    it('should have proper ARIA roles for options', () => {
        render(<CommandPalette />);

        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);

        // First option should be selected initially
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        expect(options[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('should update aria-activedescendant on keyboard navigation', () => {
        render(<CommandPalette />);

        const input = screen.getByRole('combobox');
        const options = screen.getAllByRole('option');

        // Initial state
        expect(input).toHaveAttribute('aria-activedescendant', options[0].id);

        // Press ArrowDown
        fireEvent.keyDown(window, { key: 'ArrowDown' });

        // Should update selection
        expect(options[1]).toHaveAttribute('aria-selected', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
    });
});
