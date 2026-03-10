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

        // Menu container should be hidden
        // Using ID as it's the most reliable way to get the container referenced by aria-controls
        const menu = document.getElementById('quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'true');

        // Buttons should be focusable/unfocusable based on state
        const practiceButton = screen.queryByText('Practice');
        expect(practiceButton).toBeInTheDocument();

        const button = practiceButton.closest('button');
        // Note: aria-hidden is inherited from container, so strictly speaking
        // checking the container is sufficient, but checking tabIndex is crucial for keyboard users
        expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should expand menu when clicked and update attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });

        fireEvent.click(fab);

        expect(fab).toHaveAttribute('aria-expanded', 'true');

        const menu = document.getElementById('quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'false');

        const practiceButton = screen.getByText('Practice').closest('button');
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
});
