import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Mock contexts
const mockUseProfile = vi.fn();
const mockOpenModal = vi.fn();

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}));

// Mock NavigationContext
const mockUseNavigation = vi.fn();
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => ({
        openModal: mockOpenModal,
        navigate: vi.fn(),
    }),
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock Feature Flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        settings: true,
        camera: true, // Enable camera for test
    },
    isFeatureEnabled: vi.fn((id) => true),
}));

describe('Sidebar Navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
    });

    it('renders navigation items correctly', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        expect(getByText('Dashboard')).toBeInTheDocument();
        expect(getByText('Practice')).toBeInTheDocument();
        expect(getByText('Voice Log')).toBeInTheDocument();
        expect(getByText('Settings')).toBeInTheDocument();
    });

    it('highlights active view', () => {
        const { getByText } = render(<Sidebar activeView="practice" onViewChange={() => { }} />);

        // Find the button containing "Practice"
        const practiceBtn = getByText('Practice').closest('button');

        // Check if it has the active class (bg-blue-600)
        expect(practiceBtn.className).toContain('bg-blue-600');
    });

    it('calls onViewChange when item clicked', () => {
        const onViewChange = vi.fn();
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={onViewChange} />);

        fireEvent.click(getByText('Practice'));
        expect(onViewChange).toHaveBeenCalledWith('practice');
    });

    it('opens Mirror modal when Mirror button is clicked', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        const mirrorBtn = getByText('Mirror');
        fireEvent.click(mirrorBtn);

        expect(mockOpenModal).toHaveBeenCalledWith('camera');
    });
});
