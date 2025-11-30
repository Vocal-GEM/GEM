import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TooltipOverlay from './TooltipOverlay';

describe('TooltipOverlay', () => {
    const mockStep = {
        target: 'test-target',
        title: 'Test Title',
        content: 'Test Content'
    };

    it('should not render when not active', () => {
        render(<TooltipOverlay isActive={false} step={mockStep} />);
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render step content when active', () => {
        render(<TooltipOverlay isActive={true} step={mockStep} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should call onNext when Next button is clicked', () => {
        const onNext = vi.fn();
        render(<TooltipOverlay isActive={true} step={mockStep} onNext={onNext} isLastStep={false} />);
        fireEvent.click(screen.getByText('Next'));
        expect(onNext).toHaveBeenCalled();
    });

    it('should call onSkip when Skip button is clicked', () => {
        const onSkip = vi.fn();
        render(<TooltipOverlay isActive={true} step={mockStep} onSkip={onSkip} />);
        fireEvent.click(screen.getByText('Skip Tour'));
        expect(onSkip).toHaveBeenCalled();
    });

    it('should show Finish button on last step', () => {
        render(<TooltipOverlay isActive={true} step={mockStep} isLastStep={true} />);
        expect(screen.getByText('Finish')).toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
});
