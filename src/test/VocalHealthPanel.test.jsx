import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VocalHealthPanel from '../components/dashboard/VocalHealthPanel';
import { ProfileContext } from '../context/ProfileContext';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Droplets: () => <div data-testid="icon-droplets" />,
    Battery: () => <div data-testid="icon-battery" />,
    Clock: () => <div data-testid="icon-clock" />,
    Plus: () => <span data-testid="btn-plus">+</span>,
    Minus: () => <span data-testid="btn-minus">-</span>,
    AlertTriangle: () => <div data-testid="icon-alert" />,
    Zap: () => <div data-testid="icon-zap" />,
    Sun: () => <div data-testid="icon-sun" />,
    Moon: () => <div data-testid="icon-moon" />,
    Music: () => <div data-testid="icon-music" />,
    Stethoscope: () => <div data-testid="icon-stethoscope" />,
    HeartPulse: () => <div data-testid="icon-heart-pulse" />,
    Volume2: () => <div data-testid="icon-volume-2" />,
    Utensils: () => <div data-testid="icon-utensils" />,
    Wind: () => <div data-testid="icon-wind" />,
    Sparkles: () => <div data-testid="icon-sparkles" />,
    Lightbulb: () => <div data-testid="icon-lightbulb" />
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

describe('VocalHealthPanel', () => {
    const mockUpdateHydration = vi.fn();
    const mockLogFatigue = vi.fn();

    const defaultVocalHealth = {
        hydration: { current: 3, goal: 8 },
        fatigue: { level: 2 },
        usage: { todaySeconds: 1200, dailyLimitMinutes: 60 } // 20 mins used
    };

    const renderPanel = (vocalHealth = defaultVocalHealth) => {
        return render(
            <ProfileContext.Provider value={{
                vocalHealth,
                updateHydration: mockUpdateHydration,
                logFatigue: mockLogFatigue
            }}>
                <VocalHealthPanel />
            </ProfileContext.Provider>
        );
    };

    it('should render vocal hygiene tip', () => {
        renderPanel();
        expect(screen.getByText(/Vocal Hygiene/i)).toBeInTheDocument();
    });

    it('should render fatigue level', () => {
        renderPanel();
        expect(screen.getByText(/Level 2/i)).toBeInTheDocument();
    });

    it('should render usage stats', () => {
        renderPanel();
        expect(screen.getByText(/20 \/ 60 min/i)).toBeInTheDocument();
    });

    it('should show warning when usage limit is reached', () => {
        const overLimitHealth = {
            ...defaultVocalHealth,
            usage: { todaySeconds: 3600, dailyLimitMinutes: 60 } // 60 mins used (100%)
        };
        renderPanel(overLimitHealth);
        expect(screen.getByText(/Daily limit reached/i)).toBeInTheDocument();
    });

    it('should render nothing if vocalHealth is undefined', () => {
        const { container } = renderPanel(null);
        expect(container).toBeEmptyDOMElement();
    });
});
