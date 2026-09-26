import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
    it('renders with default props', () => {
        render(<InfoTooltip content="Test content" />);
        expect(screen.getByRole('button', { name: "More information" })).toBeInTheDocument();
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows content on mouse enter and hides on mouse leave', () => {
        render(<InfoTooltip content="Test content" />);
        const container = screen.getByRole('button').parentElement;

        fireEvent.mouseEnter(container);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText("Test content")).toBeInTheDocument();

        fireEvent.mouseLeave(container);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('toggles content on click', () => {
        render(<InfoTooltip content="Test content" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(button);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('hides content on escape key press', () => {
        render(<InfoTooltip content="Test content" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
