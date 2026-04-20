
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonLoader from './SkeletonLoader';

describe('SkeletonLoader', () => {
    it('renders correctly with default props', () => {
        const { container } = render(<SkeletonLoader />);
        const containerEl = screen.getByRole('status');
        expect(containerEl).toBeInTheDocument();

        const skeleton = container.querySelector('[aria-hidden="true"]');
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('rounded-md'); // Default 'text' variant class
    });

    it('renders the correct number of items', () => {
        const { container } = render(<SkeletonLoader count={3} />);
        const containerEl = screen.getByRole('status');
        expect(containerEl).toBeInTheDocument();

        const skeletons = container.querySelectorAll('[aria-hidden="true"]');
        expect(skeletons).toHaveLength(3);
    });

    it('applies the correct class for "circle" variant', () => {
        const { container } = render(<SkeletonLoader variant="circle" />);
        const skeleton = container.querySelector('[aria-hidden="true"]');
        expect(skeleton).toHaveClass('rounded-full');
    });

    it('applies the correct class for "rect" variant', () => {
        const { container } = render(<SkeletonLoader variant="rect" />);
        const skeleton = container.querySelector('[aria-hidden="true"]');
        expect(skeleton).toHaveClass('rounded-xl');
    });

    it('applies custom className', () => {
        const { container } = render(<SkeletonLoader className="w-20 h-20" />);
        expect(container.firstChild).toHaveClass('w-20');
        expect(container.firstChild).toHaveClass('h-20');
    });
});

