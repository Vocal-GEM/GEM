/* eslint-env jest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from './QuickActions';

describe('QuickActions', () => {
    const { mockSettings, mockUpdateSettings } = vi.hoisted(() => ({
        mockSettings: { listenMode: false },
        mockUpdateSettings: vi.fn(),
    }));

    beforeEach(() => {
        vi.mock('../../context/SettingsContext', () => ({
            useSettings: () => ({
                settings: mockSettings,
                updateSettings: mockUpdateSettings
            })
        }));
        mockUpdateSettings.mockClear();
    });

    it('should render the FAB button', () => {
        render(<QuickActions />);
        expect(screen.getByRole('button', { name: /quick actions/i })).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });

        // Initial state
        expect(fab).toHaveAttribute('aria-expanded', 'false');
        expect(fab).toHaveAttribute('aria-haspopup', 'true');
        expect(fab).toHaveAttribute('aria-controls', 'quick-actions-menu');

        // Buttons should be hidden from accessibility tree initially
        const practiceButton = screen.queryByText('Practice');
        expect(practiceButton).toBeInTheDocument();
        // Since we are finding by text which is in a span, we check the button parent
        const button = practiceButton.closest('button');
        expect(button).toHaveAttribute('aria-hidden', 'true');
        expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should expand menu when clicked and update attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });

        fireEvent.click(fab);

        expect(fab).toHaveAttribute('aria-expanded', 'true');

        const practiceButton = screen.getByText('Practice').closest('button');
        expect(practiceButton).toHaveAttribute('aria-hidden', 'false');
        expect(practiceButton).toHaveAttribute('tabIndex', '0');
    });

    it('should call onAction when an action is clicked', () => {
        const onAction = vi.fn();
        render(<QuickActions onAction={onAction} />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));

        // Click action
        fireEvent.click(screen.getByText('Practice'));
        expect(onAction).toHaveBeenCalledWith('practice');
    });

    it('should toggle listen mode when clicked', () => {
        render(<QuickActions />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));

        // Click Listen Mode
        fireEvent.click(screen.getByText('Listen Mode'));

        expect(mockUpdateSettings).toHaveBeenCalledWith({ ...mockSettings, listenMode: true });
    });

    it('should close menu when Escape key is pressed', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });

        // Open menu
        fireEvent.click(fab);
        expect(fab).toHaveAttribute('aria-expanded', 'true');

        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });

        expect(fab).toHaveAttribute('aria-expanded', 'false');
    });
});
