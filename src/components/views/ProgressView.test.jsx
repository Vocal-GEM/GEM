import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProgressView from './ProgressView';

// Mock IndexedDB
global.indexedDB = {
    open: vi.fn(() => ({
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
    })),
};

// Mock hooks and services
vi.mock('../../hooks/useCourseProgress', () => ({
    useCourseProgress: vi.fn(() => ({
        getProgressPercentage: vi.fn(() => 65),
        completedLessons: [
            { id: 1, title: 'Lesson 1' },
            { id: 2, title: 'Lesson 2' },
            { id: 3, title: 'Lesson 3' },
        ],
    })),
}));

vi.mock('../../utils/historyService', () => ({
    historyService: {
        getAllSessions: vi.fn(() => Promise.resolve([
            {
                id: 1,
                date: new Date('2025-12-01T10:30:00'),
                duration: 600, // 10 minutes in seconds
            },
            {
                id: 2,
                date: new Date('2025-12-02T14:15:00'),
                duration: 900, // 15 minutes
            },
            {
                id: 3,
                date: new Date('2025-12-03T09:00:00'),
                duration: 450, // 7.5 minutes
            },
        ])),
    },
}));

// Mock child components
vi.mock('../viz/ProgressCharts', () => ({
    default: () => <div data-testid="progress-charts">Progress Charts</div>,
}));

vi.mock('../viz/VoiceRangeProfile', () => ({
    default: ({ sessions }) => (
        <div data-testid="voice-range-profile">
            Voice Range Profile ({sessions?.length || 0} sessions)
        </div>
    ),
}));

vi.mock('../ui/EmptyState', () => ({
    default: ({ title, description }) => (
        <div data-testid="empty-state">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    ),
}));

describe('ProgressView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('header', () => {
        it('renders title and description', async () => {
            render(<ProgressView />);

            expect(screen.getByText('Your Progress')).toBeInTheDocument();
            expect(screen.getByText('Track your voice journey over time.')).toBeInTheDocument();
        });

        it('displays course progress percentage', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('65%')).toBeInTheDocument();
            });
        });

        it('displays completed lessons count', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('3')).toBeInTheDocument();
                expect(screen.getByText('Lessons')).toBeInTheDocument();
            });
        });

        it('displays course stats card', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('Course')).toBeInTheDocument();
            });
        });
    });

    describe('visualizations', () => {
        it('renders VoiceRangeProfile component', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByTestId('voice-range-profile')).toBeInTheDocument();
            });
        });

        it('passes sessions data to VoiceRangeProfile', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText(/Voice Range Profile \(3 sessions\)/)).toBeInTheDocument();
            });
        });

        it('renders ProgressCharts component', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByTestId('progress-charts')).toBeInTheDocument();
            });
        });
    });

    describe('recent activity section', () => {
        it('renders recent activity header', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('Recent Activity')).toBeInTheDocument();
            });
        });

        it('displays practice sessions', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getAllByText('Practice Session')).toHaveLength(3);
            });
        });

        it('shows session dates', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                // Check for date formatting
                const dates = screen.getAllByText(/12\/\d{1,2}\/2025/);
                expect(dates.length).toBeGreaterThan(0);
            });
        });

        it('shows session durations', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('10m')).toBeInTheDocument(); // 600 seconds = 10 minutes
                expect(screen.getByText('15m')).toBeInTheDocument(); // 900 seconds = 15 minutes
                expect(screen.getByText('8m')).toBeInTheDocument(); // 450 seconds = 7.5 minutes rounded to 8
            });
        });

        it('displays only 5 most recent sessions', async () => {
            const manySessions = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                date: new Date(`2025-12-${String(i + 1).padStart(2, '0')}T10:00:00`),
                duration: 600,
            }));

            const { historyService } = await import('../../utils/historyService');
            historyService.getAllSessions.mockResolvedValueOnce(manySessions);

            render(<ProgressView />);

            await waitFor(() => {
                const sessions = screen.getAllByText('Practice Session');
                expect(sessions).toHaveLength(5);
            });
        });

        it('handles session without duration', async () => {
            const sessionsWithoutDuration = [
                {
                    id: 1,
                    date: new Date('2025-12-01T10:30:00'),
                    duration: null,
                },
            ];

            const { historyService } = await import('../../utils/historyService');
            historyService.getAllSessions.mockResolvedValueOnce(sessionsWithoutDuration);

            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('—')).toBeInTheDocument();
            });
        });
    });

    describe('empty state', () => {
        it('shows empty state when no sessions', async () => {
            const { historyService } = await import('../../utils/historyService');
            historyService.getAllSessions.mockResolvedValueOnce([]);

            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
                expect(screen.getByText('No Activity Yet')).toBeInTheDocument();
                expect(screen.getByText(/Complete your first practice session/)).toBeInTheDocument();
            });
        });

        it('does not show empty state when sessions exist', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
            });
        });
    });

    describe('loading state', () => {
        it('handles session loading errors gracefully', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const { historyService } = await import('../../utils/historyService');
            historyService.getAllSessions.mockRejectedValueOnce(new Error('Failed to load'));

            render(<ProgressView />);

            await waitFor(() => {
                // Component should still render even if sessions fail to load
                expect(screen.getByText('Your Progress')).toBeInTheDocument();
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to load sessions:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('passes empty sessions to VoiceRangeProfile on error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const { historyService } = await import('../../utils/historyService');
            historyService.getAllSessions.mockRejectedValueOnce(new Error('Failed to load'));

            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText(/Voice Range Profile \(0 sessions\)/)).toBeInTheDocument();
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('course progress integration', () => {
        it('uses course progress data from hook', async () => {
            render(<ProgressView />);

            // Verify that data from the mocked hook is displayed
            await waitFor(() => {
                expect(screen.getByText('65%')).toBeInTheDocument();
                expect(screen.getByText('3')).toBeInTheDocument();
            });
        });

        it('displays zero progress when no lessons completed', async () => {
            const { useCourseProgress } = await import('../../hooks/useCourseProgress');
            useCourseProgress.mockReturnValueOnce({
                getProgressPercentage: () => 0,
                completedLessons: [],
            });

            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('0%')).toBeInTheDocument();
                expect(screen.getByText('0')).toBeInTheDocument();
            });
        });

        it('displays 100% progress when all lessons completed', async () => {
            const { useCourseProgress } = await import('../../hooks/useCourseProgress');
            useCourseProgress.mockReturnValueOnce({
                getProgressPercentage: () => 100,
                completedLessons: Array.from({ length: 10 }, (_, i) => ({
                    id: i + 1,
                    title: `Lesson ${i + 1}`,
                })),
            });

            render(<ProgressView />);

            await waitFor(() => {
                expect(screen.getByText('100%')).toBeInTheDocument();
                expect(screen.getByText('10')).toBeInTheDocument();
            });
        });
    });

    describe('session date formatting', () => {
        it('formats dates with toLocaleDateString', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                // Check that dates are present in the document
                // Exact format depends on locale, so we just verify dates exist
                const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
                expect(dateElements.length).toBeGreaterThan(0);
            });
        });

        it('formats times with toLocaleTimeString', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                // Check that times are present (format varies by locale)
                const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
                expect(timeElements.length).toBeGreaterThan(0);
            });
        });
    });

    describe('layout and styling', () => {
        it('has proper container classes', () => {
            const { container } = render(<ProgressView />);

            const mainDiv = container.querySelector('.h-full');
            expect(mainDiv).toHaveClass('overflow-y-auto', 'p-6', 'space-y-8');
        });

        it('renders stats with proper styling', async () => {
            render(<ProgressView />);

            await waitFor(() => {
                const percentageElement = screen.getByText('65%');
                expect(percentageElement).toHaveClass('text-2xl', 'font-bold', 'text-pink-400');
            });
        });
    });
});
