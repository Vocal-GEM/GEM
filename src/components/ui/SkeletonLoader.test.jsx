import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonLoader from './SkeletonLoader';

describe('SkeletonLoader', () => {
    it('renders correctly with default props', () => {
        render(<SkeletonLoader />);
        const skeleton = screen.getByRole('status');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('rounded-md'); // Default 'text' variant class
    });

    it('renders the correct number of items', () => {
        render(<SkeletonLoader count={3} />);
        const skeletons = screen.getAllByRole('status');
        expect(skeletons).toHaveLength(3);
    });

    it('applies the correct class for "circle" variant', () => {
        render(<SkeletonLoader variant="circle" />);
        const skeleton = screen.getByRole('status');
        expect(skeleton).toHaveClass('rounded-full');
    });

    it('applies the correct class for "rect" variant', () => {
        render(<SkeletonLoader variant="rect" />);
        const skeleton = screen.getByRole('status');
        expect(skeleton).toHaveClass('rounded-xl');
    });

    it('applies custom className', () => {
        render(<SkeletonLoader className="w-20 h-20" />);
        const skeleton = screen.getByRole('status');
        expect(skeleton).toHaveClass('w-20');
        expect(skeleton).toHaveClass('h-20');
    });
});
