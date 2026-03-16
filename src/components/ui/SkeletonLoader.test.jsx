
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonLoader from './SkeletonLoader';

describe('SkeletonLoader', () => {
    it('renders correctly with default props', () => {
        const { container } = render(<SkeletonLoader />);
        const skeleton = screen.getByRole('status');
        expect(skeleton).toBeInTheDocument();
        const inner = container.querySelector('.animate-pulse');
        expect(inner).toBeInTheDocument();
        expect(inner).toHaveClass('rounded-md'); // Default 'text' variant class
    });

    it('renders the correct number of items', () => {
        const { container } = render(<SkeletonLoader count={3} />);
        const innerItems = container.querySelectorAll('.animate-pulse');
        expect(innerItems).toHaveLength(3);
    });

    it('applies the correct class for "circle" variant', () => {
        const { container } = render(<SkeletonLoader variant="circle" />);
        const inner = container.querySelector('.animate-pulse');
        expect(inner).toHaveClass('rounded-full');
    });

    it('applies the correct class for "rect" variant', () => {
        const { container } = render(<SkeletonLoader variant="rect" />);
        const inner = container.querySelector('.animate-pulse');
        expect(inner).toHaveClass('rounded-xl');
    });

    it('applies custom className', () => {
        const { container } = render(<SkeletonLoader className="w-20 h-20" />);
        expect(container.firstChild).toHaveClass('w-20');
        expect(container.firstChild).toHaveClass('h-20');
    });
});

