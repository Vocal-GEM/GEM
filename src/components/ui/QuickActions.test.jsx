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
        // Ensure FAB has correct label (Open/Close depends on state)
        expect(screen.getByRole('button', { name: /open quick actions/i })).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /open quick actions/i });

        // Initial state
        expect(fab).toHaveAttribute('aria-expanded', 'false');
        expect(fab).toHaveAttribute('aria-haspopup', 'true');
        expect(fab).toHaveAttribute('aria-controls', 'quick-actions-menu');

        // Buttons container should be hidden from accessibility tree initially
        const menu = document.getElementById('quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'true');
    });

    it('should expand menu when clicked and update attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /open quick actions/i });

        fireEvent.click(fab);

        // FAB label changes
        expect(screen.getByRole('button', { name: /close quick actions/i })).toBeInTheDocument();
        expect(fab).toHaveAttribute('aria-expanded', 'true');

        const menu = document.getElementById('quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'false');
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
