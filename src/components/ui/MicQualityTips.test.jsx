import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MicQualityTips from './MicQualityTips';

// Mock the lucide-react icons since they are used in the component
vi.mock('lucide-react', () => ({
    Mic: () => <span data-testid="icon-mic">Mic</span>,
    X: () => <span data-testid="icon-x">X</span>,
    Volume2: () => <span>Volume2</span>,
    Home: () => <span>Home</span>,
    MapPin: () => <span>MapPin</span>,
    Smartphone: () => <span>Smartphone</span>,
    Sliders: () => <span>Sliders</span>,
    Wind: () => <span>Wind</span>,
    Headphones: () => <span>Headphones</span>,
    Monitor: () => <span>Monitor</span>,
    CheckCircle: () => <span>CheckCircle</span>
}));

// Mock the data import if necessary, but since it's a real file import,
// we can rely on the real one or mock it if we want to isolate the component.
// For now, let's use the real data import as it's a simple array.

describe('MicQualityTips Component', () => {
    it('renders correctly', () => {
        render(<MicQualityTips onClose={() => {}} />);
        expect(screen.getByText('Recording Tips')).toBeInTheDocument();
        expect(screen.getByText('Follow these tips to get the best voice analysis results.')).toBeInTheDocument();
    });

    it('has correct accessibility attributes', () => {
        render(<MicQualityTips onClose={() => {}} />);

        // Find the dialog - assuming we will add role="dialog" to the main container or inner container
        // Currently it might fail, which is expected for TDD
        const dialog = screen.getByRole('dialog');

        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'mic-tips-title');
        expect(dialog).toHaveAttribute('aria-describedby', 'mic-tips-desc');

        // Check if title and description have the corresponding IDs
        const title = screen.getByText('Recording Tips').closest('h2');
        expect(title).toHaveAttribute('id', 'mic-tips-title');

        const description = screen.getByText('Follow these tips to get the best voice analysis results.');
        expect(description).toHaveAttribute('id', 'mic-tips-desc');
    });

    it('has accessible close button', () => {
        const onClose = vi.fn();
        render(<MicQualityTips onClose={onClose} />);

        const closeButton = screen.getByRole('button', { name: /close tips/i }); // flexible match
        expect(closeButton).toBeInTheDocument();

        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });

    it('closes on Escape key press', () => {
        const onClose = vi.fn();
        render(<MicQualityTips onClose={onClose} />);

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    it('focuses close button on mount', () => {
         render(<MicQualityTips onClose={() => {}} />);
         const closeButton = screen.getByRole('button', { name: /close tips/i });
         expect(document.activeElement).toBe(closeButton);
    });
});
