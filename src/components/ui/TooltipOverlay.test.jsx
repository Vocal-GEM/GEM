import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TooltipOverlay from './TooltipOverlay';

describe('TooltipOverlay', () => {
    let target;

    beforeEach(() => {
        target = document.createElement('div');
        target.id = 'test-target';
        // Mock getBoundingClientRect
        target.getBoundingClientRect = () => ({
            top: 100,
            left: 100,
            width: 200,
            height: 100,
            bottom: 200,
            right: 300
        });
        // Mock scrollIntoView
        target.scrollIntoView = vi.fn();
        document.body.appendChild(target);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    const mockStep = {
        target: '#test-target',
        title: 'Test Title',
        content: 'Test Content'
    };

    it('should not render when not active', () => {
        render(<TooltipOverlay isActive={false} step={mockStep} />);
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render step content when active', async () => {
        render(<TooltipOverlay isActive={true} step={mockStep} />);
        // Wait for position update
        expect(await screen.findByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should call onNext when Next button is clicked', async () => {
        const onNext = vi.fn();
        render(<TooltipOverlay isActive={true} step={mockStep} onNext={onNext} isLastStep={false} />);
        const nextBtn = await screen.findByText('Next');
        fireEvent.click(nextBtn);
        expect(onNext).toHaveBeenCalled();
    });

    it('should call onSkip when Skip button is clicked', async () => {
        const onSkip = vi.fn();
        render(<TooltipOverlay isActive={true} step={mockStep} onSkip={onSkip} />);
        const skipBtn = await screen.findByLabelText('Skip Tour');
        fireEvent.click(skipBtn);
        expect(onSkip).toHaveBeenCalled();
    });

    it('should show Finish button on last step', async () => {
        render(<TooltipOverlay isActive={true} step={mockStep} isLastStep={true} />);
        expect(await screen.findByText('Finish')).toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
});
