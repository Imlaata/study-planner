import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { AUTH_TOKEN_KEY } from '../api/httpClient';
import { authRepository } from '../repositories/authRepository';
import { AuthContext, type AuthContextValue } from './authContextDef';
import type { AuthUser } from '../types/task';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(() =>
        window.localStorage.getItem(AUTH_TOKEN_KEY)
    );
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isRestoringSession, setIsRestoringSession] = useState<boolean>(() =>
        Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY))
    );

    // Відновлення поточного користувача за збереженим токеном (GET /auth/me)
    useEffect(() => {
        if (!accessToken || user) return;

        const controller = new AbortController();

        async function restoreUser(token: string) {
            setIsRestoringSession(true);
            try {
                const currentUser = await authRepository.getCurrentUser(token, controller.signal);
                setUser(currentUser);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                window.localStorage.removeItem(AUTH_TOKEN_KEY);
                setAccessToken(null);
                setUser(null);
            } finally {
                if (!controller.signal.aborted) {
                    setIsRestoringSession(false);
                }
            }
        }

        void restoreUser(accessToken);

        return () => {
            controller.abort();
        };
    }, [accessToken, user]);

    const login = useCallback(async (username: string, password: string) => {
        const response = await authRepository.login(username, password);
        window.localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
        setAccessToken(response.accessToken);
        setUser({
            id: response.id,
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            image: response.image,
        });
        setIsRestoringSession(false);
    }, []);

    const logout = useCallback(() => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
        setIsRestoringSession(false);
    }, []);

    const isAuthenticated = Boolean(accessToken);
    const effectiveUser = accessToken ? user : null;

    const value = useMemo<AuthContextValue>(
        () => ({
            user: effectiveUser,
            accessToken,
            isAuthenticated,
            isRestoringSession: isAuthenticated && isRestoringSession,
            login,
            logout,
        }),
        [effectiveUser, accessToken, isAuthenticated, isRestoringSession, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}