import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { useAuth } from '../../context/AuthContext';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('Login', () => {
    const mockLogin = vi.fn();
    const mockOnClose = vi.fn();
    const mockOnSwitchToSignup = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            login: mockLogin,
        });
    });

    it('renders login form', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('allows user to type username and password', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('testpass');
    });

    it('calls login function with correct credentials on submit', async () => {
        mockLogin.mockResolvedValue(true);

        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
        });
    });

    it('closes modal on successful login', async () => {
        mockLogin.mockResolvedValue(true);

        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    it('displays error message on failed login', async () => {
        mockLogin.mockResolvedValue(false);

        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
        });

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('displays backend error message when login throws', async () => {
        mockLogin.mockRejectedValue(new Error('Network error'));

        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Login failed. Is the backend running?')).toBeInTheDocument();
        });
    });

    it('shows loading state during login', async () => {
        mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));

        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Logging in...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
        });
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const closeButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSwitchToSignup when sign up link is clicked', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const signupButton = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(signupButton);

        expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside the modal', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const backdrop = screen.getByText('Welcome Back').closest('.fixed');
        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when clicking inside the modal content', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const modalContent = screen.getByText('Welcome Back').closest('.bg-slate-900');
        fireEvent.click(modalContent);

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('prevents form submission with empty fields', () => {
        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const submitButton = screen.getByRole('button', { name: /log in/i });

        // HTML5 validation should prevent submission
        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);

        expect(usernameInput).toHaveAttribute('required');
        expect(passwordInput).toHaveAttribute('required');
    });

    it('clears error message on new submission', async () => {
        mockLogin.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

        render(
            <Login onClose={mockOnClose} onSwitchToSignup={mockOnSwitchToSignup} />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        // First submission - fails
        fireEvent.change(usernameInput, { target: { value: 'user' } });
        fireEvent.change(passwordInput, { target: { value: 'pass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
        });

        // Second submission - should clear error
        fireEvent.change(passwordInput, { target: { value: 'newpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.queryByText('Invalid username or password')).not.toBeInTheDocument();
        });
    });
});
