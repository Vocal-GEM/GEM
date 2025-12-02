import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssessmentView from './AssessmentView';

describe('AssessmentView', () => {
    const mockFeedback = {
        summary: 'Great progress! Your pitch is well-controlled and resonance is improving.',
        strengths: [
            'Consistent pitch throughout the recording',
            'Good breath support',
            'Clear articulation',
        ],
        focusArea: {
            title: 'Resonance Control',
            description: 'Work on maintaining brighter resonance in higher pitch ranges',
            exercise: 'Siren',
            priority: 'high',
            exerciseDetails: {
                difficulty: 'Intermediate',
                duration: 5,
            },
        },
        details: {
            pitch: { status: 'excellent', score: 9 },
            resonance: { status: 'good', score: 7 },
            stability: { status: 'good', score: 8 },
            voiceQuality: { status: 'needs work', score: 6 },
        },
        tips: [
            'Practice in front of a mirror to monitor tension',
            'Record yourself daily to track progress',
        ],
    };

    const mockOnClose = vi.fn();
    const mockOnPractice = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('renders null when no feedback provided', () => {
            const { container } = render(
                <AssessmentView feedback={null} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(container.firstChild).toBeNull();
        });

        it('renders header with title and icon', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText("Coach's Assessment")).toBeInTheDocument();
            expect(screen.getByText('Based on your latest recording')).toBeInTheDocument();
        });

        it('renders summary in quote', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(
                screen.getByText(/"Great progress! Your pitch is well-controlled and resonance is improving."/)
            ).toBeInTheDocument();
        });
    });

    describe('strengths section', () => {
        it('renders "What Went Well" header', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('What Went Well')).toBeInTheDocument();
        });

        it('displays all strengths', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Consistent pitch throughout the recording')).toBeInTheDocument();
            expect(screen.getByText('Good breath support')).toBeInTheDocument();
            expect(screen.getByText('Clear articulation')).toBeInTheDocument();
        });

        it('shows placeholder when no strengths', () => {
            const feedbackNoStrengths = {
                ...mockFeedback,
                strengths: [],
            };

            render(
                <AssessmentView
                    feedback={feedbackNoStrengths}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            expect(screen.getByText('Keep practicing to build your strengths!')).toBeInTheDocument();
        });
    });

    describe('focus area section', () => {
        it('renders "Primary Focus" header', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Primary Focus')).toBeInTheDocument();
        });

        it('displays focus area title and description', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Resonance Control')).toBeInTheDocument();
            expect(
                screen.getByText('Work on maintaining brighter resonance in higher pitch ranges')
            ).toBeInTheDocument();
        });

        it('shows high priority badge when priority is high', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('High Priority')).toBeInTheDocument();
        });

        it('does not show priority badge when priority is not high', () => {
            const feedbackLowPriority = {
                ...mockFeedback,
                focusArea: {
                    ...mockFeedback.focusArea,
                    priority: 'medium',
                },
            };

            render(
                <AssessmentView
                    feedback={feedbackLowPriority}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            expect(screen.queryByText('High Priority')).not.toBeInTheDocument();
        });

        it('displays exercise details when provided', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Intermediate')).toBeInTheDocument();
            expect(screen.getByText('5 min')).toBeInTheDocument();
        });

        it('renders practice button with exercise name', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Practice Siren')).toBeInTheDocument();
        });

        it('calls onPractice with exercise name when practice button clicked', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            const practiceButton = screen.getByText('Practice Siren');
            fireEvent.click(practiceButton);

            expect(mockOnPractice).toHaveBeenCalledWith('Siren');
            expect(mockOnPractice).toHaveBeenCalledTimes(1);
        });
    });

    describe('tips section', () => {
        it('renders Pro Tips header when tips exist', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Pro Tips')).toBeInTheDocument();
        });

        it('displays all tips', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Practice in front of a mirror to monitor tension')).toBeInTheDocument();
            expect(screen.getByText('Record yourself daily to track progress')).toBeInTheDocument();
        });

        it('does not render tips section when no tips', () => {
            const feedbackNoTips = {
                ...mockFeedback,
                tips: [],
            };

            render(
                <AssessmentView
                    feedback={feedbackNoTips}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            expect(screen.queryByText('Pro Tips')).not.toBeInTheDocument();
        });

        it('does not render tips section when tips is undefined', () => {
            const feedbackNoTips = {
                ...mockFeedback,
                tips: undefined,
            };

            render(
                <AssessmentView
                    feedback={feedbackNoTips}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            expect(screen.queryByText('Pro Tips')).not.toBeInTheDocument();
        });
    });

    describe('detailed metrics breakdown', () => {
        it('renders "Detailed Breakdown" header', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Detailed Breakdown')).toBeInTheDocument();
        });

        it('displays all metric cards', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Pitch')).toBeInTheDocument();
            expect(screen.getByText('Resonance')).toBeInTheDocument();
            expect(screen.getByText('Stability')).toBeInTheDocument();
            expect(screen.getByText('Voice Quality')).toBeInTheDocument();
        });

        it('displays metric scores', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('9/10')).toBeInTheDocument(); // pitch
            expect(screen.getByText('7/10')).toBeInTheDocument(); // resonance
            expect(screen.getByText('8/10')).toBeInTheDocument(); // stability
            expect(screen.getByText('6/10')).toBeInTheDocument(); // voice quality
        });

        it('displays metric statuses', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('excellent')).toBeInTheDocument();
            expect(screen.getAllByText('good')).toHaveLength(2); // resonance and stability
            expect(screen.getByText('needs work')).toBeInTheDocument();
        });
    });

    describe('metric card colors', () => {
        it.skip('applies green color for scores >= 8', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            const pitchScore = screen.getByText('9/10');
            const pitchCard = pitchScore.parentElement.parentElement;
            expect(pitchCard).toHaveClass('text-green-400');
        });

        it.skip('applies amber color for scores 5-7', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            const resonanceScore = screen.getByText('7/10');
            const resonanceCard = resonanceScore.parentElement.parentElement;
            expect(resonanceCard).toHaveClass('text-amber-400');
        });

        it.skip('applies red color for scores < 5', () => {
            const feedbackLowScore = {
                ...mockFeedback,
                details: {
                    ...mockFeedback.details,
                    voiceQuality: { status: 'poor', score: 3 },
                },
            };

            render(
                <AssessmentView
                    feedback={feedbackLowScore}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            const qualityScore = screen.getByText('3/10');
            const qualityCard = qualityScore.parentElement.parentElement;
            expect(qualityCard).toHaveClass('text-red-400');
        });
    });

    describe('close button', () => {
        it('renders close button', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            expect(screen.getByText('Close Assessment')).toBeInTheDocument();
        });

        it('calls onClose when close button clicked', () => {
            render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            const closeButton = screen.getByText('Close Assessment');
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('animation', () => {
        it('has animation classes on container', () => {
            const { container } = render(
                <AssessmentView feedback={mockFeedback} onClose={mockOnClose} onPractice={mockOnPractice} />
            );

            const mainDiv = container.firstChild;
            expect(mainDiv).toHaveClass('animate-in', 'fade-in', 'slide-in-from-bottom-4');
        });
    });

    describe('edge cases', () => {
        it('handles missing exercise details gracefully', () => {
            const feedbackNoExerciseDetails = {
                ...mockFeedback,
                focusArea: {
                    ...mockFeedback.focusArea,
                    exerciseDetails: undefined,
                },
            };

            render(
                <AssessmentView
                    feedback={feedbackNoExerciseDetails}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            // Should still render the practice button
            expect(screen.getByText('Practice Siren')).toBeInTheDocument();
            // Exercise details should not be shown
            expect(screen.queryByText('Intermediate')).not.toBeInTheDocument();
        });

        it('renders with minimal feedback data', () => {
            const minimalFeedback = {
                summary: 'Keep practicing!',
                strengths: [],
                focusArea: {
                    title: 'Pitch Control',
                    description: 'Focus on maintaining stable pitch',
                    exercise: 'Humming',
                },
                details: {
                    pitch: { status: 'needs work', score: 4 },
                    resonance: { status: 'needs work', score: 4 },
                    stability: { status: 'needs work', score: 4 },
                    voiceQuality: { status: 'needs work', score: 4 },
                },
            };

            render(
                <AssessmentView
                    feedback={minimalFeedback}
                    onClose={mockOnClose}
                    onPractice={mockOnPractice}
                />
            );

            expect(screen.getByText(/"Keep practicing!"/)).toBeInTheDocument();
            expect(screen.getByText('Keep practicing to build your strengths!')).toBeInTheDocument();
            expect(screen.getByText('Pitch Control')).toBeInTheDocument();
        });
    });
});
