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

describe('CommandPalette', () => {
    const mockNavigate = vi.fn();
    const mockCloseModal = vi.fn();
    const mockAddToHistory = vi.fn();
    const mockToggleAudio = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigation.mockReturnValue({
            modals: { commandPalette: true },
            closeModal: mockCloseModal,
            navigate: mockNavigate,
            switchPracticeTab: vi.fn(),
            openModal: vi.fn(),
            addToHistory: mockAddToHistory
        });
        useAudio.mockReturnValue({
            toggleAudio: mockToggleAudio,
            isAudioActive: false
        });
    });

    it('should render nothing if not open', () => {
        useNavigation.mockReturnValue({
            modals: { commandPalette: false },
            closeModal: mockCloseModal
        });
        const { container } = render(<CommandPalette />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render search input and actions when open', () => {
        render(<CommandPalette />);
        expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
        expect(screen.getByText('Start Microphone')).toBeInTheDocument();
        expect(screen.getByText('Go to Practice Mode')).toBeInTheDocument();
    });

    it('should filter actions based on query', () => {
        render(<CommandPalette />);
        const input = screen.getByPlaceholderText('Type a command or search...');

        fireEvent.change(input, { target: { value: 'history' } });

        expect(screen.getByText('Go to History')).toBeInTheDocument();
        expect(screen.queryByText('Start Microphone')).not.toBeInTheDocument();
    });

    it('should execute action and close modal on click', () => {
        render(<CommandPalette />);
        const actionButton = screen.getByText('Go to Practice Mode');

        fireEvent.click(actionButton);

        expect(mockNavigate).toHaveBeenCalledWith('practice');
        expect(mockAddToHistory).toHaveBeenCalled();
        expect(mockCloseModal).toHaveBeenCalledWith('commandPalette');
    });

    it('should toggle microphone', () => {
        render(<CommandPalette />);
        const micButton = screen.getByText('Start Microphone');

        fireEvent.click(micButton);

        expect(mockToggleAudio).toHaveBeenCalled();
    });
});
