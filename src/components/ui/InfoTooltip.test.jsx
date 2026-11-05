import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip Component', () => {
  it('renders correctly', () => {
    render(<InfoTooltip content="Test tooltip content" />);
    expect(screen.getByRole('button', { name: /more information/i })).toBeInTheDocument();
  });

  it('shows tooltip content on hover', () => {
    render(<InfoTooltip content="Test tooltip content" />);
    const button = screen.getByRole('button', { name: /more information/i });

    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();

    fireEvent.mouseEnter(button.parentElement);
    expect(screen.getByText('Test tooltip content')).toBeInTheDocument();

    fireEvent.mouseLeave(button.parentElement);
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
  });

  it('shows tooltip content on focus for keyboard accessibility', () => {
    render(<InfoTooltip content="Test tooltip content" />);
    const button = screen.getByRole('button', { name: /more information/i });

    fireEvent.focus(button);
    expect(screen.getByText('Test tooltip content')).toBeInTheDocument();

    fireEvent.blur(button);
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
  });
});
