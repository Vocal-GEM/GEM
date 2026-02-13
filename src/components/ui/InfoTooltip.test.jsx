import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InfoTooltip from './InfoTooltip';
import React from 'react';

// Mock Lucide icon to avoid issues
vi.mock('lucide-react', () => ({
  HelpCircle: (props) => <svg data-testid="help-icon" {...props} />,
}));

describe('InfoTooltip Component', () => {
  it('renders the trigger button with accessible label', () => {
    render(<InfoTooltip content="Test tooltip content" />);

    const trigger = screen.getByRole('button', { name: /more information/i });
    expect(trigger).toBeInTheDocument();
  });

  it('tooltip content is hidden initially', () => {
    render(<InfoTooltip content="Hidden content" />);

    const tooltip = screen.queryByRole('tooltip');
    expect(tooltip).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('shows tooltip content on hover', () => {
    render(<InfoTooltip content="Visible content" />);

    const trigger = screen.getByRole('button', { name: /more information/i });
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('shows tooltip content on focus', () => {
    render(<InfoTooltip content="Visible content" />);

    const trigger = screen.getByRole('button', { name: /more information/i });
    fireEvent.focus(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('connects trigger to tooltip via aria-describedby when visible', () => {
    render(<InfoTooltip content="Connected content" />);

    const trigger = screen.getByRole('button', { name: /more information/i });
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    const tooltipId = tooltip.getAttribute('id');
    expect(tooltipId).toBeTruthy();
    expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
  });

  it('hides tooltip on mouse leave', () => {
    render(<InfoTooltip content="Toggle content" />);

    const trigger = screen.getByRole('button', { name: /more information/i });

    // Show
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Hide
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(<InfoTooltip content="Toggle content" />);

    const trigger = screen.getByRole('button', { name: /more information/i });

    // Show
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Hide
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
