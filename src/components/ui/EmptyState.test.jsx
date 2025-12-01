import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
    it('renders title and description', () => {
        render(
            <EmptyState
                title="No items found"
                description="Try adjusting your search."
            />
        );

        expect(screen.getByText('No items found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument();
    });

    it('renders action button when onAction and actionLabel are provided', () => {
        const handleAction = vi.fn();
        render(
            <EmptyState
                title="Empty"
                description="Nothing here"
                actionLabel="Create New"
                onAction={handleAction}
            />
        );

        const button = screen.getByRole('button', { name: /create new/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('does not render action button if onAction is missing', () => {
        render(
            <EmptyState
                title="Empty"
                description="Nothing here"
                actionLabel="Create New"
            />
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders with custom icon', () => {
        const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
        render(
            <EmptyState
                icon={CustomIcon}
                title="Empty"
                description="Nothing here"
            />
        );

        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
});
