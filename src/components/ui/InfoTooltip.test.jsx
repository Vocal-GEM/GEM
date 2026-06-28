import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
    it('renders with default icon', () => {
        render(<InfoTooltip content="Test content" />);
        const button = screen.getByRole('button', { name: /more information/i });
        expect(button).toBeInTheDocument();
    });

    it('shows and hides tooltip on click', () => {
        render(<InfoTooltip content="Click me content" />);
        const button = screen.getByRole('button', { name: /more information/i });

        // Tooltip should not be visible initially
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

        // Click to show
        fireEvent.click(button);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Click me content')).toBeInTheDocument();

        // Click again to hide
        fireEvent.click(button);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows and hides tooltip on focus/blur', () => {
        render(<InfoTooltip content="Focus me content" />);
        const button = screen.getByRole('button', { name: /more information/i });

        // Focus to show
        fireEvent.focus(button);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();

        // Blur to hide
        fireEvent.blur(button);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows and hides tooltip on mouse enter/leave', () => {
        render(<InfoTooltip content="Hover me content" />);

        // Get the container
        const container = screen.getByRole('button', { name: /more information/i }).parentElement;

        // Hover to show
        fireEvent.mouseEnter(container);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();

        // Leave to hide
        fireEvent.mouseLeave(container);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
