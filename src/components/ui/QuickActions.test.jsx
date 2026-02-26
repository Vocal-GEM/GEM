/* eslint-env jest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from './QuickActions';

// Hoist mocks to top level
const { mockSettings, mockUpdateSettings } = vi.hoisted(() => ({
    mockSettings: { listenMode: false },
    mockUpdateSettings: vi.fn(),
}));

// Mock the context
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: mockSettings,
        updateSettings: mockUpdateSettings
    })
}));

describe('QuickActions', () => {
    beforeEach(() => {
        mockUpdateSettings.mockClear();
        mockSettings.listenMode = false; // Reset state if needed, though objects are ref
    });

    it('should render the FAB button', () => {
        render(<QuickActions />);
        // Matches "Open Quick Actions"
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
        // We look for text inside the button
        const practiceLabel = screen.queryByText('Practice');
        expect(practiceLabel).toBeInTheDocument();

        // Check the menu container visibility
        // Finding by ID is robust here
        // eslint-disable-next-line testing-library/no-node-access
        const menuContainer = document.getElementById('quick-actions-menu');
        expect(menuContainer).toHaveAttribute('aria-hidden', 'true');

        // Check tabIndex of the button
        // eslint-disable-next-line testing-library/no-node-access
        const button = practiceLabel.closest('button');
        expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should expand menu when clicked and update attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });

        fireEvent.click(fab);

        expect(fab).toHaveAttribute('aria-expanded', 'true');
        // Check label change
        expect(fab).toHaveAttribute('aria-label', 'Close Quick Actions');

        // eslint-disable-next-line testing-library/no-node-access
        const menuContainer = document.getElementById('quick-actions-menu');
        expect(menuContainer).toHaveAttribute('aria-hidden', 'false');

        const practiceLabel = screen.getByText('Practice');
        // eslint-disable-next-line testing-library/no-node-access
        const button = practiceLabel.closest('button');
        expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should close menu when Escape key is pressed', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });

        // Open menu
        fireEvent.click(fab);
        expect(fab).toHaveAttribute('aria-expanded', 'true');

        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });

        // Menu should close
        expect(fab).toHaveAttribute('aria-expanded', 'false');
        expect(fab).toHaveAttribute('aria-label', 'Open Quick Actions');
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
