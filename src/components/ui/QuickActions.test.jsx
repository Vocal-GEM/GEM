import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import QuickActions from './QuickActions';

// Mock contexts
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { listenMode: false },
        updateSettings: vi.fn()
    })
}));

describe('QuickActions', () => {
    it('should render the FAB button', () => {
        const { getByRole } = render(<QuickActions />);
        expect(getByRole('button', { name: /quick actions/i })).toBeInTheDocument();
    });
});
