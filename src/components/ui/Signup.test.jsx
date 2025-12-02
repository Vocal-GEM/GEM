import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Signup from './Signup';
import { useAuth } from '../../context/AuthContext';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('Signup', () => {
    const mockSignup = vi.fn();
    const mockOnClose = vi.fn();
    const mockOnSwitchToLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            signup: mockSignup,
        });
    });

    it('renders signup form', () => {
        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('allows user to type in all fields', () => {
        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('newuser');
        expect(passwordInput.value).toBe('password123');
        expect(confirmInput.value).toBe('password123');
    });

    it('shows error when passwords do not match', async () => {
        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'different' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
        });

        expect(mockSignup).not.toHaveBeenCalled();
    });

    it('calls signup function with correct credentials when passwords match', async () => {
        mockSignup.mockResolvedValue({ success: true });

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith('newuser', 'password123');
        });
    });

    it('closes modal on successful signup', async () => {
        mockSignup.mockResolvedValue({ success: true });

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    it('displays error message on failed signup', async () => {
        mockSignup.mockResolvedValue({ success: false, error: 'Username already exists' });

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Username already exists')).toBeInTheDocument();
        });

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('displays backend error message when signup throws', async () => {
        mockSignup.mockRejectedValue(new Error('Network error'));

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Signup failed. Is the backend running?')).toBeInTheDocument();
        });
    });

    it('shows loading state during signup', async () => {
        mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Creating Account...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.queryByText('Creating Account...')).not.toBeInTheDocument();
        });
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const closeButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSwitchToLogin when log in link is clicked', () => {
        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const loginButton = screen.getByRole('button', { name: /log in/i });
        fireEvent.click(loginButton);

        expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    });

    it('prevents form submission with empty fields', () => {
        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);

        expect(usernameInput).toHaveAttribute('required');
        expect(passwordInput).toHaveAttribute('required');
        expect(confirmInput).toHaveAttribute('required');
    });

    it('clears error message on new submission', async () => {
        mockSignup
            .mockResolvedValueOnce({ success: false, error: 'First error' })
            .mockResolvedValueOnce({ success: true });

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        // First submission - fails
        fireEvent.change(usernameInput, { target: { value: 'user' } });
        fireEvent.change(passwordInput, { target: { value: 'pass123' } });
        fireEvent.change(confirmInput, { target: { value: 'pass123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('First error')).toBeInTheDocument();
        });

        // Second submission - should clear error
        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.queryByText('First error')).not.toBeInTheDocument();
        });
    });

    it('clears password mismatch error when attempting new submission', async () => {
        mockSignup.mockResolvedValue({ success: true });

        render(
            <Signup onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
        );

        const usernameInput = screen.getByLabelText(/^username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        // First attempt - password mismatch
        fireEvent.change(usernameInput, { target: { value: 'user' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'different' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
        });

        // Fix password and resubmit
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.queryByText("Passwords don't match")).not.toBeInTheDocument();
        });
    });
});
