/* eslint-env jest */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
    it('should render the message', () => {
        render(<Toast message="Hello World" onClose={() => {}} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should have role="status" for info type by default', () => {
        render(<Toast message="Info" type="info" onClose={() => {}} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have role="alert" for error type', () => {
        render(<Toast message="Error" type="error" onClose={() => {}} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have a close button with aria-label', () => {
        render(<Toast message="Close me" onClose={() => {}} />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Close notification');
    });

    it('should call onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<Toast message="Close me" onClose={onClose} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClose).toHaveBeenCalled();
    });
});
