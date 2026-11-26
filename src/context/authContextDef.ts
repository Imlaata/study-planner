import { createContext } from 'react';
import type { AuthUser } from '../types/task';

export interface AuthContextValue {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isRestoringSession: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);