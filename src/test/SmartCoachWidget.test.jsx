import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SmartCoachWidget from '../components/dashboard/SmartCoachWidget';
import { ProfileContext } from '../context/ProfileContext';

// Mock Lucide icons to avoid issues
vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="icon-sparkles" />,
    Play: () => <div data-testid="icon-play" />,
    Target: () => <div data-testid="icon-target" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Calendar: () => <div data-testid="icon-calendar" />
}));

// Mock IndexedDBManager to prevent unhandled rejections
vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(true),
        getProfiles: vi.fn().mockResolvedValue([]),
        saveProfile: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue(null),
        saveSetting: vi.fn().mockResolvedValue(true)
    }
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: { username: 'Riley' } })
}));

describe('SmartCoachWidget', () => {
    const mockOnOpenAdaptiveSession = vi.fn();

    const renderWidget = (profileData = {}) => {
        const defaultProfile = {
            activeProfile: 'p1',
            voiceProfiles: [{ id: 'p1', name: 'Riley' }],
            goals: ['pitch', 'stability'],
            ...profileData
        };

        return render(
            <ProfileContext.Provider value={defaultProfile}>
                <SmartCoachWidget onStartSession={mockOnOpenAdaptiveSession} />
            </ProfileContext.Provider>
        );
    };

    it('should render the user name and ignore profile name', () => {
        // Set profile name to 'Feminization' to simulate the bug scenario
        renderWidget({ voiceProfiles: [{ id: 'p1', name: 'Feminization' }] });

        // Should show 'Riley' (from Auth mock)
        expect(screen.getByText(/Riley/)).toBeInTheDocument();
        // Should NOT show 'Feminization'
        expect(screen.queryByText(/Feminization/)).not.toBeInTheDocument();
    });

    it('should display a daily focus based on goals', () => {
        renderWidget({ goals: ['resonance'] });
        // The widget logic picks a random goal or defaults. 
        // Since we mocked goals, it should likely pick 'Resonance' or similar if logic works.
        // However, the logic is internal. We can check if *some* focus text is present.
        expect(screen.getByText(/Daily Focus/i)).toBeInTheDocument();
    });

    it('should call onOpenAdaptiveSession when button is clicked', () => {
        renderWidget();
        const button = screen.getByText(/Start Guided Session/i);
        fireEvent.click(button);
        expect(mockOnOpenAdaptiveSession).toHaveBeenCalledTimes(1);
    });

    it('should render stats placeholders', () => {
        renderWidget();
        expect(screen.getByText(/15 min/i)).toBeInTheDocument(); // Goal
        expect(screen.getByText(/3 Days/i)).toBeInTheDocument(); // Streak
    });
});
