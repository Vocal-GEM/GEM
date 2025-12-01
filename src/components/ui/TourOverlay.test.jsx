import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TourOverlay from './TourOverlay';
import { useTour } from '../../context/TourContext';

// Mock useTour hook
vi.mock('../../context/TourContext', () => ({
    useTour: vi.fn()
}));

// Mock createPortal
vi.mock('react-dom', () => ({
    ...vi.importActual('react-dom'),
    createPortal: (node) => node,
}));

describe('TourOverlay', () => {
    const mockNextStep = vi.fn();
    const mockPrevStep = vi.fn();
    const mockSkipTour = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render nothing if no active tour', () => {
        useTour.mockReturnValue({
            activeTour: null,
            tourConfig: null
        });

        const { container } = render(<TourOverlay />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render tooltip content', () => {
        useTour.mockReturnValue({
            activeTour: 'test_tour',
            currentStep: 0,
            tourConfig: [
                { target: 'test-target', title: 'Step 1', content: 'Content 1', placement: 'bottom' }
            ],
            nextStep: mockNextStep,
            prevStep: mockPrevStep,
            skipTour: mockSkipTour
        });

        // Mock target element
        const target = document.createElement('div');
        target.id = 'test-target';
        target.scrollIntoView = vi.fn();
        document.body.appendChild(target);
        target.getBoundingClientRect = () => ({
            top: 100, left: 100, width: 100, height: 100, bottom: 200, right: 200
        });

        render(<TourOverlay />);

        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Content 1')).toBeInTheDocument();

        // Clean up
        document.body.removeChild(target);
    });

    it('should call nextStep when Next button is clicked', () => {
        useTour.mockReturnValue({
            activeTour: 'test_tour',
            currentStep: 0,
            tourConfig: [
                { target: 'test-target', title: 'Step 1', content: 'Content 1' },
                { target: 'test-target-2', title: 'Step 2', content: 'Content 2' }
            ],
            nextStep: mockNextStep,
            prevStep: mockPrevStep,
            skipTour: mockSkipTour
        });

        const target = document.createElement('div');
        target.id = 'test-target';
        target.scrollIntoView = vi.fn();
        document.body.appendChild(target);

        render(<TourOverlay />);

        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        expect(mockNextStep).toHaveBeenCalled();

        document.body.removeChild(target);
    });

    it('should call skipTour when Finish button is clicked on last step', () => {
        useTour.mockReturnValue({
            activeTour: 'test_tour',
            currentStep: 0,
            tourConfig: [
                { target: 'test-target', title: 'Step 1', content: 'Content 1' }
            ],
            nextStep: mockNextStep,
            prevStep: mockPrevStep,
            skipTour: mockSkipTour
        });

        const target = document.createElement('div');
        target.id = 'test-target';
        target.scrollIntoView = vi.fn();
        document.body.appendChild(target);

        render(<TourOverlay />);

        const finishButton = screen.getByText('Finish');
        fireEvent.click(finishButton);

        expect(mockSkipTour).toHaveBeenCalled();

        document.body.removeChild(target);
    });
});
