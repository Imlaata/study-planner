import { httpClient } from '../api/httpClient';
import type { AuthUser, LoginResponse } from '../types/task';

export const authRepository = {
    login(username: string, password: string): Promise<LoginResponse> {
        return httpClient.post<LoginResponse>('/auth/login', {
            username,
            password,
            expiresInMins: 60,
        });
    },

    getCurrentUser(token: string, signal?: AbortSignal): Promise<AuthUser> {
        return httpClient.get<AuthUser>('/auth/me', {
            token,
            signal,
        });
    },
};