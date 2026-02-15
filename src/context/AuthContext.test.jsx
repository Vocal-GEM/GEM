import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Mock Fetch
globalThis.fetch = vi.fn();

// Mock Runtime Config
vi.mock('../config/runtime', () => ({
    isBackendEnabled: vi.fn(() => true),
    getBackendUrl: vi.fn(() => 'http://localhost:5000')
}));

// Mock IndexedDBManager
vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: {
        factoryReset: vi.fn().mockResolvedValue(true),
        ensureReady: vi.fn().mockResolvedValue(true)
    }
}));

// Mock DataSyncService
vi.mock('../services/DataSyncService', () => ({
    syncToServer: vi.fn().mockResolvedValue(true),
    syncFromServer: vi.fn().mockResolvedValue(true)
}));

import { indexedDB } from '../services/IndexedDBManager';
import { syncToServer, syncFromServer } from '../services/DataSyncService';

const TestComponent = () => {
    const { user, login, signup, logout } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? user.username : 'null'}</div>
            <button onClick={() => login('testuser', 'password')}>Login</button>
            <button onClick={() => signup('newuser', 'password')}>Signup</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    // Note: Wrapping updates in act() is essential for state updates in tests.
    // We increased timeout for waitFor because state updates might be async/batched.

    it('initializes with null user if /me fails', async () => {
        fetch.mockResolvedValueOnce({ ok: false }); // /me check

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('null');
        }, { timeout: 2000 });
    });

    it('logs in successfully', async () => {
        fetch.mockResolvedValueOnce({ ok: false }); // initial /me
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: { id: 1, username: 'testuser' } })
        }); // login

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        const loginBtn = result.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('testuser');
        }, { timeout: 2000 });
    });

    it('handles login failure', async () => {
        fetch.mockResolvedValueOnce({ ok: false }); // initial /me
        fetch.mockRejectedValueOnce(new Error('Network error')); // login fail

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        const loginBtn = result.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('null');
        }, { timeout: 2000 });
    });

    it('clears local data on logout', async () => {
        // Setup: login first
        fetch.mockResolvedValueOnce({ ok: false }); // initial /me
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: { id: 1, username: 'testuser' } })
        }); // login
        fetch.mockResolvedValueOnce({ ok: true }); // logout

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // Login
        const loginBtn = result.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('testuser');
        }, { timeout: 2000 });

        // Logout
        const logoutBtn = result.getByText('Logout');
        await act(async () => {
            logoutBtn.click();
        });

        await waitFor(() => {
            // User should be cleared
            expect(result.getByTestId('user').textContent).toBe('null');
            // factoryReset should have been called to clear local data
            expect(indexedDB.factoryReset).toHaveBeenCalled();
        }, { timeout: 2000 });
    });
});

