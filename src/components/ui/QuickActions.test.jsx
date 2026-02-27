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
        expect(screen.getByRole('button', { name: /open quick actions/i })).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /open quick actions/i });

        // Initial state
        expect(fab).toHaveAttribute('aria-expanded', 'false');
        expect(fab).toHaveAttribute('aria-haspopup', 'true');
        expect(fab).toHaveAttribute('aria-controls', 'quick-actions-menu');

        // Check container visibility via aria-hidden
        // The menu container has id="quick-actions-menu"
        // Note: querySelector is used because the container might not have a specific role that identifies it easily while hidden
        // Actually it has role="region" or similar in the code I read? No, role="region" is on the wrapper div.
        // The menu div is: <div id="quick-actions-menu" aria-hidden={!isOpen}>

        // Let's check aria-hidden on the menu container
        // We can find it by ID if we could, but typical RTL uses roles.
        // The implementation has `aria-label="Quick Actions Menu"` on the wrapper which has role="region".
        // But `aria-hidden` is on the inner div.

        // Let's check the FAB aria-expanded which is robust.
        expect(fab).toHaveAttribute('aria-expanded', 'false');
    });

    it('should expand menu when clicked and update attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /open quick actions/i });

        fireEvent.click(fab);

        expect(fab).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: /close quick actions/i })).toBeInTheDocument();

        // Check practice button visibility
        const practiceButton = screen.getByText('Practice').closest('button');
        // In the current implementation (read from file), the buttons do NOT have aria-hidden attributes directly managed
        // The *container* has aria-hidden.
        // So we should verify the button is visible/interactive.
        expect(practiceButton).toBeVisible();
    });

    it('should call onAction when an action is clicked', () => {
        const onAction = vi.fn();
        render(<QuickActions onAction={onAction} />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: /open quick actions/i }));

        // Click action
        fireEvent.click(screen.getByText('Practice'));
        expect(onAction).toHaveBeenCalledWith('practice');
    });

    it('should toggle listen mode when clicked', () => {
        render(<QuickActions />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: /open quick actions/i }));

        // Click Listen Mode
        fireEvent.click(screen.getByText('Listen Mode'));

        expect(mockUpdateSettings).toHaveBeenCalledWith({ ...mockSettings, listenMode: true });
    });
});
