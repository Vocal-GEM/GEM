import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Mock Fetch
globalThis.fetch = vi.fn();

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

// Mock config/runtime
vi.mock('../config/runtime', () => ({
    isBackendEnabled: () => true,
    getBackendUrl: () => 'http://localhost:5000'
}));

import { indexedDB } from '../services/IndexedDBManager';

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
        });
    });

    it('logs in successfully', async () => {
        // 1. Initial /me check (fail)
        fetch.mockResolvedValueOnce({ ok: false });

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // 2. Login call (success)
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                user: { id: 1, username: 'testuser' },
                token: 'fake-token'
            })
        });

        const loginBtn = result.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('testuser');
        });
    });

    it('handles login failure', async () => {
        fetch.mockResolvedValueOnce({ ok: false }); // initial /me

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        fetch.mockRejectedValueOnce(new Error('Network error')); // login fail

        const loginBtn = result.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('null');
        });
    });

    it('clears local data on logout', async () => {
        // 1. Initial /me check (fail)
        fetch.mockResolvedValueOnce({ ok: false });

        let result;
        await act(async () => {
            result = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // 2. Login call (success)
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: { id: 1, username: 'testuser' }, token: 'fake-token' })
        });

        // Login
        const loginBtn = result.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('testuser');
        });

        // 3. Logout call (success)
        fetch.mockResolvedValueOnce({ ok: true });

        // Logout
        const logoutBtn = result.getByText('Logout');
        await act(async () => {
            logoutBtn.click();
        });

        await waitFor(() => {
            expect(result.getByTestId('user').textContent).toBe('null');
            expect(indexedDB.factoryReset).toHaveBeenCalled();
        });
    });
});
