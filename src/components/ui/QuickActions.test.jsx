import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from './QuickActions';

describe('QuickActions', () => {
    it('should render the FAB button', () => {
        render(<QuickActions />);
        expect(screen.getByRole('button', { name: /quick actions/i })).toBeInTheDocument();
    });

    it('should expand menu when clicked', () => {
        render(<QuickActions />);
        const fab = screen.getByRole('button', { name: /quick actions/i });
        fireEvent.click(fab);
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
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
});
