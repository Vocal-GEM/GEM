import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordingsList from './RecordingsList';
import { indexedDB } from '../../services/IndexedDBManager';

// Mock IndexedDB
vi.mock('../../services/IndexedDBManager', () => ({
    indexedDB: {
        getRecordings: vi.fn(),
        deleteRecording: vi.fn(),
        saveRecording: vi.fn()
    }
}));

// Mock Audio
const mockAudio = {
    play: vi.fn(),
    pause: vi.fn(),
    src: '',
    onended: null
};
window.Audio = vi.fn(function() { return mockAudio; });
window.URL.createObjectURL = vi.fn(() => 'blob:url');
window.URL.revokeObjectURL = vi.fn();
window.confirm = vi.fn(() => true);

describe('RecordingsList', () => {
    const mockRecordings = [
        {
            id: '1',
            name: 'Test Recording',
            timestamp: Date.now(),
            duration: 10,
            blob: new Blob([''], { type: 'audio/webm' })
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        indexedDB.getRecordings.mockResolvedValue(mockRecordings);
    });

    it('renders with accessible buttons', async () => {
        render(<RecordingsList />);

        // Wait for recordings to load
        await waitFor(() => {
            expect(screen.getByText('Test Recording')).toBeInTheDocument();
        });

        // Check Play button
        const playBtn = screen.getByLabelText('Play recording');
        expect(playBtn).toBeInTheDocument();

        // Check Edit button
        const editBtn = screen.getByLabelText('Edit name');
        expect(editBtn).toBeInTheDocument();
        expect(editBtn).toHaveClass('focus:opacity-100');

        // Check Download button
        const downloadBtn = screen.getByLabelText('Download recording');
        expect(downloadBtn).toBeInTheDocument();

        // Check Delete button
        const deleteBtn = screen.getByLabelText('Delete recording');
        expect(deleteBtn).toBeInTheDocument();
    });

    it('updates play button label when playing', async () => {
        render(<RecordingsList />);

        await waitFor(() => {
            expect(screen.getByText('Test Recording')).toBeInTheDocument();
        });

        const playBtn = screen.getByLabelText('Play recording');
        fireEvent.click(playBtn);

        expect(mockAudio.play).toHaveBeenCalled();

        // Wait for reload (caused by useEffect dependency on audioUrl) to finish
        await waitFor(() => {
            expect(screen.getByLabelText('Pause recording')).toBeInTheDocument();
        });
    });

    it('shows save/cancel buttons with labels when editing', async () => {
        render(<RecordingsList />);

        await waitFor(() => {
            expect(screen.getByText('Test Recording')).toBeInTheDocument();
        });

        const editBtn = screen.getByLabelText('Edit name');
        fireEvent.click(editBtn);

        expect(screen.getByLabelText('Save name')).toBeInTheDocument();
        expect(screen.getByLabelText('Cancel edit')).toBeInTheDocument();
    });
});
