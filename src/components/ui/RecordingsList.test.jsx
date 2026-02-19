import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordingsList from './RecordingsList';
import { indexedDB } from '../../services/IndexedDBManager';

// Mock IndexedDBManager
vi.mock('../../services/IndexedDBManager', () => ({
    indexedDB: {
        getRecordings: vi.fn(),
        deleteRecording: vi.fn(),
        saveRecording: vi.fn(),
    }
}));

// Mock Audio
window.Audio = class {
    constructor() {
        this.play = vi.fn();
        this.pause = vi.fn();
        this.src = '';
        this.onended = null;
    }
};

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('RecordingsList', () => {
    const mockRecording = {
        id: '1',
        name: 'Test Recording',
        timestamp: Date.now(),
        duration: 10,
        blob: new Blob([''], { type: 'audio/webm' }),
        type: 'audio'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return
        indexedDB.getRecordings.mockResolvedValue([mockRecording]);
        // Mock window.confirm
        window.confirm = vi.fn(() => true);
    });

    it('renders recordings and has accessible buttons', async () => {
        render(<RecordingsList />);

        // Wait for loading to finish and recording to appear
        await waitFor(() => {
            expect(screen.getByText('Test Recording')).toBeInTheDocument();
        });

        // Check for accessible buttons
        // Play - Assuming default state is paused, so button should say "Play"
        // If aria-label is missing, this will fail
        expect(screen.getByRole('button', { name: /play recording/i })).toBeInTheDocument();

        // Edit Name
        expect(screen.getByRole('button', { name: /edit name/i })).toBeInTheDocument();

        // Download
        expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();

        // Delete
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('has accessible buttons in edit mode', async () => {
        render(<RecordingsList />);

        await waitFor(() => expect(screen.getByText('Test Recording')).toBeInTheDocument());

        // Enter edit mode
        // We might need to find the edit button by something else if aria-label is missing initially
        // But the goal is to make this test PASS eventually. For now, we expect failure.
        // To trigger the edit mode even if the test fails later, let's try to find it by SVG or class if possible?
        // But `getByRole` is stricter. Let's stick to `getByRole` because we WANT it to fail if it's not accessible.

        const editButton = screen.getByRole('button', { name: /edit name/i });
        fireEvent.click(editButton);

        // Check for accessible buttons in edit mode
        expect(screen.getByRole('button', { name: /save name/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
});
