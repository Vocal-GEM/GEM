import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
    it('renders the tooltip toggle button', () => {
        render(<InfoTooltip content="Test Tooltip" />);
        expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
    });

    it('shows tooltip content on mouse enter', async () => {
        render(<InfoTooltip content="Test Tooltip Content" />);

        // Tooltip should not be visible initially
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

        // Trigger mouse enter
        fireEvent.mouseEnter(screen.getByRole('button', { name: 'More information' }).parentElement);

        // Tooltip should be visible
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('Test Tooltip Content');
    });

    it('shows tooltip content on focus', async () => {
        render(<InfoTooltip content="Test Tooltip Content" />);

        // Tooltip should not be visible initially
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

        // Trigger focus
        fireEvent.focus(screen.getByRole('button', { name: 'More information' }));

        // Tooltip should be visible
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('Test Tooltip Content');

        // Trigger blur
        fireEvent.blur(screen.getByRole('button', { name: 'More information' }));
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
