/* eslint-env jest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from './QuickActions';
import React from 'react';

// Define hoisted mocks
const { mockSettings, mockUpdateSettings } = vi.hoisted(() => ({
    mockSettings: { listenMode: false },
    mockUpdateSettings: vi.fn(),
}));

// Mock the module
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: mockSettings,
        updateSettings: mockUpdateSettings
    })
}));

describe('QuickActions', () => {
    beforeEach(() => {
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

        // Verify menu items are hidden
        const menu = screen.getByRole('region', { name: /quick actions menu/i }).querySelector('#quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'true');
    });

    it('should expand menu when clicked and update attributes', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /open quick actions/i });

        fireEvent.click(fab);

        // Fab label changes
        expect(screen.getByRole('button', { name: /close quick actions/i })).toHaveAttribute('aria-expanded', 'true');

        // Menu should be visible
        const menu = screen.getByRole('region', { name: /quick actions menu/i }).querySelector('#quick-actions-menu');
        expect(menu).toHaveAttribute('aria-hidden', 'false');
    });

    it('should call onAction when an action is clicked', () => {
        const onAction = vi.fn();
        render(<QuickActions onAction={onAction} />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: /open quick actions/i }));

        // Click action - Use closest button because text is inside a span inside the button
        const actionButton = screen.getByLabelText('Practice');
        fireEvent.click(actionButton);

        expect(onAction).toHaveBeenCalledWith('practice');
    });

    it('should toggle listen mode when clicked', () => {
        render(<QuickActions />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: /open quick actions/i }));

        // Click Listen Mode
        const listenButton = screen.getByLabelText('Listen Mode');
        fireEvent.click(listenButton);

        expect(mockUpdateSettings).toHaveBeenCalledWith({ ...mockSettings, listenMode: true });
    });
});
