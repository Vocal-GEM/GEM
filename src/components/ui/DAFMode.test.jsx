import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DAFMode from './DAFMode';
import { ToastProvider } from '../../context/ToastContext';

// Mock MediaDevices
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
});

describe('DAFMode component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows toast error when microphone access fails', async () => {
        mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

        render(
            <ToastProvider>
                <DAFMode onClose={() => {}} />
            </ToastProvider>
        );

        const startButton = screen.getByText('Start DAF');
        fireEvent.click(startButton);

        // Wait for the toast to appear
        await waitFor(() => {
            const toast = screen.getByRole('alert');
            expect(toast).toBeInTheDocument();
            expect(toast).toHaveTextContent('Could not access microphone. Please check permissions.');
        });
    });
});
