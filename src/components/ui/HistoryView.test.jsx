import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryView from './HistoryView';

// Mock dependencies
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        getSessions: vi.fn().mockResolvedValue([])
    })
}));

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => key
    })
}));

vi.mock('../../context/TourContext', () => ({
    useTour: () => ({
        startTour: vi.fn()
    })
}));

// Mock SettingsContext
const mockUseSettings = vi.fn();
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => mockUseSettings(),
    SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock PracticeCardsContext
const mockUsePracticeCards = vi.fn();
vi.mock('../../context/PracticeCardsContext', () => ({
    usePracticeCards: () => mockUsePracticeCards(),
    PracticeCardsProvider: ({ children }) => <div>{children}</div>
}));

const MockPracticeCardsProvider = ({ children }) => <div>{children}</div>;

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
    Line: () => <div>Line Chart</div>,
    Bar: () => <div>Bar Chart</div>
}));

describe('HistoryView Personalization', () => {
    beforeEach(() => {
        mockUseSettings.mockReturnValue({
            settings: {
                dashboardConfig: {
                    showStreak: true,
                    showTotalPractice: true,
                    showWeeklyActivity: true,
                    showProgressTrends: true
                }
            }
        });
        mockUsePracticeCards.mockReturnValue({
            // minimal mock state if needed
        });
    });

    it('should render all widgets by default', () => {
        render(<HistoryView stats={{ totalSeconds: 600 }} journals={[]} />, { wrapper: MockPracticeCardsProvider });

        expect(screen.getByText('history.streak')).toBeInTheDocument();
        expect(screen.getByText('history.totalPractice')).toBeInTheDocument();
        expect(screen.getByText('history.weeklyActivity')).toBeInTheDocument();
        expect(screen.getByText('history.progressTrends')).toBeInTheDocument();
    });

    it('should hide widgets based on config', () => {
        mockUseSettings.mockReturnValue({
            settings: {
                dashboardConfig: {
                    showStreak: false,
                    showTotalPractice: false,
                    showWeeklyActivity: false,
                    showProgressTrends: false
                }
            }
        });

        render(<HistoryView stats={{ totalSeconds: 600 }} journals={[]} />);

        expect(screen.queryByText('history.streak')).not.toBeInTheDocument();
        expect(screen.queryByText('history.totalPractice')).not.toBeInTheDocument();
        expect(screen.queryByText('history.weeklyActivity')).not.toBeInTheDocument();
        expect(screen.queryByText('history.progressTrends')).not.toBeInTheDocument();
    });

    it('should dispatch openDashboardConfig event', () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        render(<HistoryView stats={{ totalSeconds: 600 }} journals={[]} />);

        const customizeBtn = screen.getByText('Customize Dashboard');
        fireEvent.click(customizeBtn);

        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
        expect(dispatchSpy.mock.calls[0][0].type).toBe('openDashboardConfig');
    });
});
