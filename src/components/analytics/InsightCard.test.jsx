import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { InsightCard } from './InsightCard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('InsightCard', () => {
    const mockInsight = {
        title: 'Test Insight',
        content: 'This is a test insight content.',
        icon: '🧪',
        link: 'https://example.com/learn-more'
    };

    const mockOnDismiss = vi.fn();

    it('renders correctly with insight data', () => {
        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        expect(screen.getByText('Test Insight')).toBeInTheDocument();
        expect(screen.getByText('This is a test insight content.')).toBeInTheDocument();
        expect(screen.getByText('🧪')).toBeInTheDocument();
    });

    it('should have an accessible dismiss button', () => {
        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        const dismissButton = screen.getByRole('button', { name: /dismiss insight/i });
        expect(dismissButton).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        const dismissButton = screen.getByRole('button', { name: /dismiss insight/i });
        fireEvent.click(dismissButton);
        expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should render "Learn more" button with correct link behavior and accessibility', () => {
        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        const learnMoreButton = screen.getByRole('button', { name: /learn more about test insight/i });

        expect(learnMoreButton).toBeInTheDocument();
        expect(learnMoreButton).toHaveAttribute('title', 'https://example.com/learn-more');

        fireEvent.click(learnMoreButton);
        expect(openSpy).toHaveBeenCalledWith('https://example.com/learn-more', '_blank');

        openSpy.mockRestore();
    });
});
