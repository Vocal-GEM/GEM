import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuickSettings from './QuickSettings';
import { useSettings } from '../../context/SettingsContext';

// Mock the hook
vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn()
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    X: () => <svg data-testid="icon-x" />,
    Moon: () => <svg data-testid="icon-moon" />,
    Sun: () => <svg data-testid="icon-sun" />,
    Zap: () => <svg data-testid="icon-zap" />,
    Eye: () => <svg data-testid="icon-eye" />,
    EyeOff: () => <svg data-testid="icon-eye-off" />
}));

describe('QuickSettings Accessibility', () => {
    const mockUpdateSettings = vi.fn();
    const mockOnClose = vi.fn();
    const defaultSettings = {
        theme: 'dark',
        listenMode: false,
        performanceMode: 'medium',
        analyticsEnabled: false
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useSettings.mockReturnValue({
            settings: defaultSettings,
            updateSettings: mockUpdateSettings
        });
    });

    it('renders with correct accessibility roles', () => {
        render(<QuickSettings isOpen={true} onClose={mockOnClose} />);

        // Check for Listen Mode switch
        const listenSwitch = screen.getByRole('switch', { name: /listen mode/i });
        expect(listenSwitch).toBeInTheDocument();
        expect(listenSwitch).toHaveAttribute('aria-checked', 'false');

        // Check for Privacy switch
        const privacySwitch = screen.getByRole('switch', { name: /share usage/i });
        expect(privacySwitch).toBeInTheDocument();
        expect(privacySwitch).toHaveAttribute('aria-checked', 'false');

        // Check for Close button
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
    });

    it('handles theme toggle accessibility', () => {
        render(<QuickSettings isOpen={true} onClose={mockOnClose} />);

        const darkButton = screen.getByRole('button', { name: /dark/i });
        const lightButton = screen.getByRole('button', { name: /light/i });

        expect(darkButton).toHaveAttribute('aria-pressed', 'true');
        expect(lightButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('closes on Escape key press', () => {
        render(<QuickSettings isOpen={true} onClose={mockOnClose} />);

        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
        expect(mockOnClose).toHaveBeenCalled();
    });
});
