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
        // Note: The aria-hidden attribute is on the parent container (quick-actions-menu), not the individual buttons in the current implementation.
        // Or if it IS on buttons, verify implementation.
        // Looking at source: aria-hidden={!isOpen} is on the container AND potentially passed to buttons?
        // Actually, the source shows:
        // <div id="quick-actions-menu" aria-hidden={!isOpen}>
        //   {actions.map(... <button ... /> ...)}
        // </div>
        // AND the individual buttons do NOT seem to have aria-hidden explicitly set in the map,
        // unless it's implicit or I missed it.
        // Wait, the previous failing test said `Received: null`, meaning the attribute is missing on the button.
        // So we should check the container instead OR fix the implementation if buttons should be hidden.
        // Accessibility-wise, if the container is aria-hidden, children are hidden.

        const menu = document.getElementById('quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'true');

        // Check tabIndex on buttons
        const practiceButton = screen.queryByText('Practice').closest('button');
        expect(practiceButton).toHaveAttribute('tabIndex', '-1');
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
