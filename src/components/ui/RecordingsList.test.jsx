import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordingsList from './RecordingsList';
import { indexedDB } from '../../services/IndexedDBManager';

// Mock the indexedDB service
vi.mock('../../services/IndexedDBManager', () => ({
    indexedDB: {
        getRecordings: vi.fn(),
        deleteRecording: vi.fn(),
        saveRecording: vi.fn(),
    }
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock window.confirm
globalThis.confirm = vi.fn(() => true);

describe('RecordingsList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no recordings', async () => {
        indexedDB.getRecordings.mockResolvedValue([]);
        render(<RecordingsList />);

        await waitFor(() => {
            expect(screen.getByText(/No recordings found/i)).toBeInTheDocument();
        });
    });

    it('renders recordings list', async () => {
        const mockRecordings = [
            { id: '1', name: 'Test Recording 1', timestamp: Date.now(), duration: 10, blob: new Blob() },
            { id: '2', name: 'Test Recording 2', timestamp: Date.now(), duration: 20, blob: new Blob() }
        ];
        indexedDB.getRecordings.mockResolvedValue(mockRecordings);

        render(<RecordingsList />);

        await waitFor(() => {
            expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
            expect(screen.getByText('Test Recording 2')).toBeInTheDocument();
        });
    });

    it('buttons have accessible names (aria-labels)', async () => {
        const mockRecordings = [
            { id: '1', name: 'Test Recording 1', timestamp: Date.now(), duration: 10, blob: new Blob() }
        ];
        indexedDB.getRecordings.mockResolvedValue(mockRecordings);

        render(<RecordingsList />);

        await waitFor(() => {
            expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
        });

        // Use getByRole with name option to verify accessibility
        // These should FAIL initially

        // Play button
        expect(screen.getByRole('button', { name: /Play recording/i })).toBeInTheDocument();

        // Download button
        expect(screen.getByRole('button', { name: /Download recording/i })).toBeInTheDocument();

        // Delete button
        expect(screen.getByRole('button', { name: /Delete recording/i })).toBeInTheDocument();

        // Edit button
        expect(screen.getByRole('button', { name: /Rename recording/i })).toBeInTheDocument();
    });

    it('edit mode buttons have accessible names', async () => {
         const mockRecordings = [
            { id: '1', name: 'Test Recording 1', timestamp: Date.now(), duration: 10, blob: new Blob() }
        ];
        indexedDB.getRecordings.mockResolvedValue(mockRecordings);

        const { container } = render(<RecordingsList />);
        await waitFor(() => screen.getByText('Test Recording 1'));

        // Find edit button by class since aria-label is missing initially
        // The edit button has 'opacity-0' and 'group-hover:opacity-100' classes
        // It is the second button in the row (first is play)
        // Let's try to find it via selector
        const editButton = container.querySelector('.opacity-0');
        fireEvent.click(editButton);

        await waitFor(() => {
             expect(screen.getByRole('button', { name: /Save name/i })).toBeInTheDocument();
             expect(screen.getByRole('button', { name: /Cancel renaming/i })).toBeInTheDocument();
        });
    });
});
