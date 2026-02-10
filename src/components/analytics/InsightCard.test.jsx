import { render, screen, fireEvent } from '@testing-library/react';
import { InsightCard } from './InsightCard';
import { vi, describe, it, expect } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    X: (props) => <svg {...props} data-testid="icon-x" />,
}));

describe('InsightCard', () => {
    const mockInsight = {
        title: 'Test Insight',
        content: 'This is a test insight content.',
        icon: '🧪',
        link: 'https://example.com/learn-more'
    };

    const mockOnDismiss = vi.fn();

    it('renders the insight content correctly', () => {
        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        expect(screen.getByText('Test Insight')).toBeInTheDocument();
        expect(screen.getByText('This is a test insight content.')).toBeInTheDocument();
        expect(screen.getByText('🧪')).toBeInTheDocument();
    });

    it('renders the dismiss button with accessible label', () => {
        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        const dismissButton = screen.getByRole('button', { name: /dismiss insight/i });
        expect(dismissButton).toBeInTheDocument();

        fireEvent.click(dismissButton);
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders the learn more button with accessible label and link functionality', () => {
        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

        render(<InsightCard insight={mockInsight} onDismiss={mockOnDismiss} />);

        // Check for accessible label
        const learnMoreButton = screen.getByRole('button', { name: /learn more about test insight/i });
        expect(learnMoreButton).toBeInTheDocument();

        // Check for visual text
        expect(screen.getByText(/learn more/i)).toBeInTheDocument();

        // check tooltip
        expect(learnMoreButton).toHaveAttribute('title', mockInsight.link);

        // Check functionality
        fireEvent.click(learnMoreButton);
        expect(openSpy).toHaveBeenCalledWith(mockInsight.link, '_blank');

        openSpy.mockRestore();
    });

    it('does not render learn more button if link is missing', () => {
        const insightNoLink = { ...mockInsight, link: undefined };
        render(<InsightCard insight={insightNoLink} onDismiss={mockOnDismiss} />);

        const learnMoreButton = screen.queryByRole('button', { name: /learn more/i });
        expect(learnMoreButton).not.toBeInTheDocument();
    });
});
